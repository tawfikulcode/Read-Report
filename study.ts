import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

export type StudySession = {
  id: string;
  subject: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  rating: number;
  notes: string;
};

export type ThemeMode = "dark" | "light";

export type StudySettings = {
  name: string;
  theme: ThemeMode;
  monthlyGoalHours: number;
  unlockedAchievements: string[];
};

export type AchievementDef = {
  id: string;
  title: string;
  hint: string;
};

const LS_SESSIONS = "studyreport:sessions";
const LS_SETTINGS = "studyreport:settings";
const DB_NAME = "studyreport-ai";
const DB_STORE = "sessions";
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: StudySettings = {
  name: "",
  theme: "dark",
  monthlyGoalHours: 40,
  unlockedAchievements: [],
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-session", title: "First Session", hint: "Log your first study block" },
  { id: "seven-streak", title: "7 Day Streak", hint: "Study seven days in a row" },
  { id: "fifty-hours", title: "50 Hours", hint: "Reach fifty hours of focus" },
  { id: "night-owl", title: "Night Owl", hint: "Study after 10 PM" },
  { id: "perfect-week", title: "Perfect Week", hint: "Study every day of a calendar week" },
];

export const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English",
  "Computer Science",
  "Languages",
  "Economics",
  "Art",
  "Music",
  "Geography",
];

const QUOTES = [
  "Small sessions, stacked daily, become a mind you can trust.",
  "Focus is a muscle. You just trained it.",
  "The page you finish today is the future you meet tomorrow.",
  "Consistency beats intensity when intensity is only a visitor.",
  "You do not rise to goals. You fall to systems.",
  "One honest hour is worth a week of almost.",
  "Protect the block. The rest of life can wait twenty-five minutes.",
  "Curiosity is the quiet engine of mastery.",
  "Done is a better teacher than perfect.",
  "Return tomorrow. That is the whole method.",
];

export function localDateStr(d = new Date()): string {
  return format(d, "yyyy-MM-dd");
}

export function quoteForDate(date: string): string {
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) >>> 0;
  return QUOTES[h % QUOTES.length] ?? QUOTES[0];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SR";
  if (parts.length === 1) return (parts[0] ?? "SR").slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "S";
  const last = parts[parts.length - 1]?.[0] ?? "R";
  return (first + last).toUpperCase();
}

export function durationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  let a = (sh ?? 0) * 60 + (sm ?? 0);
  let b = (eh ?? 0) * 60 + (em ?? 0);
  if (b < a) b += 24 * 60;
  return b - a;
}

export function hoursFmt(mins: number): string {
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(Math.round(mins));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

export function decimalHours(mins: number): number {
  return Math.round((mins / 60) * 100) / 100;
}

export function loadSettings(): StudySettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<StudySettings>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      theme: parsed.theme === "light" ? "light" : "dark",
      monthlyGoalHours:
        typeof parsed.monthlyGoalHours === "number" && parsed.monthlyGoalHours > 0
          ? parsed.monthlyGoalHours
          : 40,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: StudySettings): void {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}

function readLocalSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(LS_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSession);
  } catch {
    return [];
  }
}

function writeLocalSessions(sessions: StudySession[]): void {
  localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
}

function isSession(value: unknown): value is StudySession {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.subject === "string" &&
    typeof s.topic === "string" &&
    typeof s.date === "string" &&
    typeof s.startTime === "string" &&
    typeof s.endTime === "string" &&
    typeof s.durationMinutes === "number" &&
    typeof s.rating === "number" &&
    typeof s.notes === "string"
  );
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGetAll(db: IDBDatabase): Promise<StudySession[]> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, "readonly");
      const store = tx.objectStore(DB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = Array.isArray(req.result) ? req.result.filter(isSession) : [];
        resolve(rows);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

async function idbPut(db: IDBDatabase, session: StudySession): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(session);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbDelete(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbBulkPut(db: IDBDatabase, sessions: StudySession[]): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, "readwrite");
      const store = tx.objectStore(DB_STORE);
      for (const s of sessions) store.put(s);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadSessions(): Promise<StudySession[]> {
  const local = readLocalSessions();
  const db = await openDb();
  if (!db) {
    return [...local].sort(sortSessions);
  }
  const fromIdb = await idbGetAll(db);
  if (fromIdb.length === 0 && local.length > 0) {
    await idbBulkPut(db, local);
    db.close();
    return [...local].sort(sortSessions);
  }
  if (fromIdb.length > 0) {
    writeLocalSessions(fromIdb);
  }
  db.close();
  return [...fromIdb].sort(sortSessions);
}

export async function persistSession(
  session: StudySession,
  current: StudySession[],
): Promise<StudySession[]> {
  const next = [session, ...current.filter((s) => s.id !== session.id)].sort(sortSessions);
  writeLocalSessions(next);
  const db = await openDb();
  if (db) {
    await idbPut(db, session);
    db.close();
  }
  return next;
}

export async function removeSession(
  id: string,
  current: StudySession[],
): Promise<StudySession[]> {
  const next = current.filter((s) => s.id !== id);
  writeLocalSessions(next);
  const db = await openDb();
  if (db) {
    await idbDelete(db, id);
    db.close();
  }
  return next;
}

function sortSessions(a: StudySession, b: StudySession): number {
  const dateCmp = b.date.localeCompare(a.date);
  if (dateCmp !== 0) return dateCmp;
  return b.startTime.localeCompare(a.startTime);
}

export function uniqueDates(sessions: StudySession[]): string[] {
  return [...new Set(sessions.map((s) => s.date))].sort();
}

export function currentStreak(sessions: StudySession[], today = localDateStr()): number {
  const days = new Set(sessions.map((s) => s.date));
  if (days.size === 0) return 0;
  let cursor = today;
  if (!days.has(cursor)) {
    cursor = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
    if (!days.has(cursor)) return 0;
  }
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = format(subDays(parseISO(cursor), 1), "yyyy-MM-dd");
  }
  return count;
}

export function bestStreak(sessions: StudySession[]): number {
  const days = uniqueDates(sessions);
  if (days.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = parseISO(days[i - 1] ?? "");
    const cur = parseISO(days[i] ?? "");
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function minutesOnDate(sessions: StudySession[], date: string): number {
  return sessions
    .filter((s) => s.date === date)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function minutesInMonth(
  sessions: StudySession[],
  year: number,
  monthIndex: number,
): number {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  return sessions
    .filter((s) => s.date.startsWith(prefix))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function xpFromSessions(sessions: StudySession[]): number {
  return totalMinutes(sessions);
}

export function levelFromXp(xp: number): { level: number; into: number; next: number } {
  const level = Math.floor(xp / 100) + 1;
  const into = xp % 100;
  return { level, into, next: 100 };
}

export function rankName(level: number): string {
  if (level <= 2) return "Spark";
  if (level <= 5) return "Scholar";
  if (level <= 10) return "Adept";
  if (level <= 20) return "Mentor";
  return "Luminary";
}

export function weekBuckets(sessions: StudySession[], today = new Date()) {
  const end = today;
  const start = subDays(end, 6);
  const days = eachDayOfInterval({ start, end });
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    return {
      date: key,
      label: format(d, "EEE"),
      hours: decimalHours(minutesOnDate(sessions, key)),
    };
  });
}

export function subjectTotals(sessions: StudySession[]) {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const key = s.subject.trim() || "Untitled";
    map.set(key, (map.get(key) ?? 0) + s.durationMinutes);
  }
  return [...map.entries()]
    .map(([subject, minutes]) => ({ subject, minutes, hours: decimalHours(minutes) }))
    .sort((a, b) => b.minutes - a.minutes);
}

export function heatmapDays(sessions: StudySession[], today = new Date()) {
  const end = today;
  const start = startOfWeek(subMonths(end, 11), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const mins = minutesOnDate(sessions, key);
    return { date: key, minutes: mins, hours: decimalHours(mins), dow: d.getDay() };
  });
}

export function heatLevel(hours: number): 0 | 1 | 2 | 3 | 4 {
  if (hours <= 0) return 0;
  if (hours < 0.5) return 1;
  if (hours < 1.5) return 2;
  if (hours < 3) return 3;
  return 4;
}

function hasPerfectCalendarWeek(sessions: StudySession[]): boolean {
  const days = new Set(sessions.map((s) => s.date));
  if (days.size < 7) return false;
  for (const key of days) {
    const weekStart = startOfWeek(parseISO(key), { weekStartsOn: 1 });
    let ok = true;
    for (let i = 0; i < 7; i++) {
      const day = format(addDays(weekStart, i), "yyyy-MM-dd");
      if (!days.has(day)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function isNightOwlSession(s: StudySession): boolean {
  const hour = Number(s.startTime.split(":")[0]);
  const endHour = Number(s.endTime.split(":")[0]);
  if (Number.isNaN(hour)) return false;
  return hour >= 22 || hour < 5 || endHour >= 22;
}

export function detectUnlocks(sessions: StudySession[], already: string[]): string[] {
  const have = new Set(already);
  const fresh: string[] = [];
  const maybe = (id: string, ok: boolean) => {
    if (ok && !have.has(id)) {
      fresh.push(id);
      have.add(id);
    }
  };
  maybe("first-session", sessions.length >= 1);
  maybe("seven-streak", currentStreak(sessions) >= 7);
  maybe("fifty-hours", totalMinutes(sessions) >= 50 * 60);
  maybe("night-owl", sessions.some(isNightOwlSession));
  maybe("perfect-week", hasPerfectCalendarWeek(sessions));
  return fresh;
}

export function playBeep(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const tones = [
      { t: 0, f: 880 },
      { t: 0.16, f: 1174 },
      { t: 0.32, f: 1568 },
    ];
    for (const { t, f } of tones) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now + t);
      g.gain.exponentialRampToValueAtTime(0.18, now + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.14);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.16);
    }
    window.setTimeout(() => {
      void ctx.close();
    }, 800);
  } catch {
    /* audio optional */
  }
}

export const SUBJECT_COLORS = [
  "#00f5ff",
  "#8a2be2",
  "#67e8f9",
  "#c084fc",
  "#2dd4bf",
  "#60a5fa",
  "#a78bfa",
  "#22d3ee",
];

export function colorForSubject(subject: string): string {
  let h = 0;
  for (let i = 0; i < subject.length; i++) h = (h * 33 + subject.charCodeAt(i)) >>> 0;
  return SUBJECT_COLORS[h % SUBJECT_COLORS.length] ?? "#00f5ff";
}

export function monthLabel(d = new Date()): string {
  return format(d, "MMMM yyyy");
}

export function timeSlot(start: string, end: string): string {
  return `${start} – ${end}`;
}
