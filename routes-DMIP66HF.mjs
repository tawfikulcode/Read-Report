import { i as __toESM } from "../_runtime.mjs";
import { R as require_react, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Target, c as RotateCcw, d as Pause, f as Moon, g as Award, h as BookOpen, i as Timer, l as Play, m as Download, n as Trophy, o as Sun, p as Flame, s as Star, t as Zap, u as Pencil } from "../_libs/lucide-react.mjs";
import { t as gsapWithCSS } from "../_libs/gsap.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as format, c as startOfWeek, i as getDaysInMonth, l as addDays, n as parseISO, o as startOfMonth, r as subDays, s as eachDayOfInterval, t as subMonths } from "../_libs/date-fns.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DMIP66HF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LS_SESSIONS = "studyreport:sessions";
var LS_SETTINGS = "studyreport:settings";
var DB_NAME = "studyreport-ai";
var DB_STORE = "sessions";
var DB_VERSION = 1;
var DEFAULT_SETTINGS = {
	name: "",
	theme: "dark",
	monthlyGoalHours: 40,
	unlockedAchievements: []
};
var ACHIEVEMENTS = [
	{
		id: "first-session",
		title: "First Session",
		hint: "Log your first study block"
	},
	{
		id: "seven-streak",
		title: "7 Day Streak",
		hint: "Study seven days in a row"
	},
	{
		id: "fifty-hours",
		title: "50 Hours",
		hint: "Reach fifty hours of focus"
	},
	{
		id: "night-owl",
		title: "Night Owl",
		hint: "Study after 10 PM"
	},
	{
		id: "perfect-week",
		title: "Perfect Week",
		hint: "Study every day of a calendar week"
	}
];
var SUBJECT_SUGGESTIONS = [
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
	"Geography"
];
var QUOTES = [
	"Small sessions, stacked daily, become a mind you can trust.",
	"Focus is a muscle. You just trained it.",
	"The page you finish today is the future you meet tomorrow.",
	"Consistency beats intensity when intensity is only a visitor.",
	"You do not rise to goals. You fall to systems.",
	"One honest hour is worth a week of almost.",
	"Protect the block. The rest of life can wait twenty-five minutes.",
	"Curiosity is the quiet engine of mastery.",
	"Done is a better teacher than perfect.",
	"Return tomorrow. That is the whole method."
];
function localDateStr(d = /* @__PURE__ */ new Date()) {
	return format(d, "yyyy-MM-dd");
}
function quoteForDate(date) {
	let h = 0;
	for (let i = 0; i < date.length; i++) h = h * 31 + date.charCodeAt(i) >>> 0;
	return QUOTES[h % QUOTES.length] ?? QUOTES[0];
}
function getInitials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "SR";
	if (parts.length === 1) return (parts[0] ?? "SR").slice(0, 2).toUpperCase();
	return ((parts[0]?.[0] ?? "S") + (parts[parts.length - 1]?.[0] ?? "R")).toUpperCase();
}
function durationMinutes(startTime, endTime) {
	const [sh, sm] = startTime.split(":").map(Number);
	const [eh, em] = endTime.split(":").map(Number);
	if ([
		sh,
		sm,
		eh,
		em
	].some((n) => Number.isNaN(n))) return 0;
	let a = (sh ?? 0) * 60 + (sm ?? 0);
	let b = (eh ?? 0) * 60 + (em ?? 0);
	if (b < a) b += 1440;
	return b - a;
}
function hoursFmt(mins) {
	const sign = mins < 0 ? "-" : "";
	const abs = Math.abs(Math.round(mins));
	const h = Math.floor(abs / 60);
	const m = abs % 60;
	if (h === 0) return `${sign}${m}m`;
	if (m === 0) return `${sign}${h}h`;
	return `${sign}${h}h ${m}m`;
}
function decimalHours(mins) {
	return Math.round(mins / 60 * 100) / 100;
}
function loadSettings() {
	try {
		const raw = localStorage.getItem(LS_SETTINGS);
		if (!raw) return { ...DEFAULT_SETTINGS };
		const parsed = JSON.parse(raw);
		return {
			name: typeof parsed.name === "string" ? parsed.name : "",
			theme: parsed.theme === "light" ? "light" : "dark",
			monthlyGoalHours: typeof parsed.monthlyGoalHours === "number" && parsed.monthlyGoalHours > 0 ? parsed.monthlyGoalHours : 40,
			unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements.filter((x) => typeof x === "string") : []
		};
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}
function saveSettings(settings) {
	localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}
function readLocalSessions() {
	try {
		const raw = localStorage.getItem(LS_SESSIONS);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isSession);
	} catch {
		return [];
	}
}
function writeLocalSessions(sessions) {
	localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
}
function isSession(value) {
	if (!value || typeof value !== "object") return false;
	const s = value;
	return typeof s.id === "string" && typeof s.subject === "string" && typeof s.topic === "string" && typeof s.date === "string" && typeof s.startTime === "string" && typeof s.endTime === "string" && typeof s.durationMinutes === "number" && typeof s.rating === "number" && typeof s.notes === "string";
}
function openDb() {
	return new Promise((resolve) => {
		if (typeof indexedDB === "undefined") {
			resolve(null);
			return;
		}
		try {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = () => {
				const db = req.result;
				if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: "id" });
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
}
async function idbGetAll(db) {
	return new Promise((resolve) => {
		try {
			const req = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).getAll();
			req.onsuccess = () => {
				resolve(Array.isArray(req.result) ? req.result.filter(isSession) : []);
			};
			req.onerror = () => resolve([]);
		} catch {
			resolve([]);
		}
	});
}
async function idbPut(db, session) {
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
async function idbDelete(db, id) {
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
async function idbBulkPut(db, sessions) {
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
async function loadSessions() {
	const local = readLocalSessions();
	const db = await openDb();
	if (!db) return [...local].sort(sortSessions);
	const fromIdb = await idbGetAll(db);
	if (fromIdb.length === 0 && local.length > 0) {
		await idbBulkPut(db, local);
		db.close();
		return [...local].sort(sortSessions);
	}
	if (fromIdb.length > 0) writeLocalSessions(fromIdb);
	db.close();
	return [...fromIdb].sort(sortSessions);
}
async function persistSession(session, current) {
	const next = [session, ...current.filter((s) => s.id !== session.id)].sort(sortSessions);
	writeLocalSessions(next);
	const db = await openDb();
	if (db) {
		await idbPut(db, session);
		db.close();
	}
	return next;
}
async function removeSession(id, current) {
	const next = current.filter((s) => s.id !== id);
	writeLocalSessions(next);
	const db = await openDb();
	if (db) {
		await idbDelete(db, id);
		db.close();
	}
	return next;
}
function sortSessions(a, b) {
	const dateCmp = b.date.localeCompare(a.date);
	if (dateCmp !== 0) return dateCmp;
	return b.startTime.localeCompare(a.startTime);
}
function uniqueDates(sessions) {
	return [...new Set(sessions.map((s) => s.date))].sort();
}
function currentStreak(sessions, today = localDateStr()) {
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
function bestStreak(sessions) {
	const days = uniqueDates(sessions);
	if (days.length === 0) return 0;
	let best = 1;
	let run = 1;
	for (let i = 1; i < days.length; i++) {
		const prev = parseISO(days[i - 1] ?? "");
		const cur = parseISO(days[i] ?? "");
		if (Math.round((cur.getTime() - prev.getTime()) / 864e5) === 1) {
			run += 1;
			best = Math.max(best, run);
		} else run = 1;
	}
	return best;
}
function totalMinutes(sessions) {
	return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}
function minutesOnDate(sessions, date) {
	return sessions.filter((s) => s.date === date).reduce((sum, s) => sum + s.durationMinutes, 0);
}
function minutesInMonth(sessions, year, monthIndex) {
	const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
	return sessions.filter((s) => s.date.startsWith(prefix)).reduce((sum, s) => sum + s.durationMinutes, 0);
}
function xpFromSessions(sessions) {
	return totalMinutes(sessions);
}
function levelFromXp(xp) {
	return {
		level: Math.floor(xp / 100) + 1,
		into: xp % 100,
		next: 100
	};
}
function rankName(level) {
	if (level <= 2) return "Spark";
	if (level <= 5) return "Scholar";
	if (level <= 10) return "Adept";
	if (level <= 20) return "Mentor";
	return "Luminary";
}
function weekBuckets(sessions, today = /* @__PURE__ */ new Date()) {
	const end = today;
	const start = subDays(end, 6);
	return eachDayOfInterval({
		start,
		end
	}).map((d) => {
		const key = format(d, "yyyy-MM-dd");
		return {
			date: key,
			label: format(d, "EEE"),
			hours: decimalHours(minutesOnDate(sessions, key))
		};
	});
}
function subjectTotals(sessions) {
	const map = /* @__PURE__ */ new Map();
	for (const s of sessions) {
		const key = s.subject.trim() || "Untitled";
		map.set(key, (map.get(key) ?? 0) + s.durationMinutes);
	}
	return [...map.entries()].map(([subject, minutes]) => ({
		subject,
		minutes,
		hours: decimalHours(minutes)
	})).sort((a, b) => b.minutes - a.minutes);
}
function heatmapDays(sessions, today = /* @__PURE__ */ new Date()) {
	const end = today;
	const start = startOfWeek(subMonths(end, 11), { weekStartsOn: 0 });
	return eachDayOfInterval({
		start,
		end
	}).map((d) => {
		const key = format(d, "yyyy-MM-dd");
		const mins = minutesOnDate(sessions, key);
		return {
			date: key,
			minutes: mins,
			hours: decimalHours(mins),
			dow: d.getDay()
		};
	});
}
function heatLevel(hours) {
	if (hours <= 0) return 0;
	if (hours < .5) return 1;
	if (hours < 1.5) return 2;
	if (hours < 3) return 3;
	return 4;
}
function hasPerfectCalendarWeek(sessions) {
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
function isNightOwlSession(s) {
	const hour = Number(s.startTime.split(":")[0]);
	const endHour = Number(s.endTime.split(":")[0]);
	if (Number.isNaN(hour)) return false;
	return hour >= 22 || hour < 5 || endHour >= 22;
}
function detectUnlocks(sessions, already) {
	const have = new Set(already);
	const fresh = [];
	const maybe = (id, ok) => {
		if (ok && !have.has(id)) {
			fresh.push(id);
			have.add(id);
		}
	};
	maybe("first-session", sessions.length >= 1);
	maybe("seven-streak", currentStreak(sessions) >= 7);
	maybe("fifty-hours", totalMinutes(sessions) >= 3e3);
	maybe("night-owl", sessions.some(isNightOwlSession));
	maybe("perfect-week", hasPerfectCalendarWeek(sessions));
	return fresh;
}
function playBeep() {
	try {
		const ctx = new (window.AudioContext || window.webkitAudioContext)();
		const now = ctx.currentTime;
		for (const { t, f } of [
			{
				t: 0,
				f: 880
			},
			{
				t: .16,
				f: 1174
			},
			{
				t: .32,
				f: 1568
			}
		]) {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = f;
			g.gain.setValueAtTime(1e-4, now + t);
			g.gain.exponentialRampToValueAtTime(.18, now + t + .02);
			g.gain.exponentialRampToValueAtTime(1e-4, now + t + .14);
			osc.connect(g);
			g.connect(ctx.destination);
			osc.start(now + t);
			osc.stop(now + t + .16);
		}
		window.setTimeout(() => {
			ctx.close();
		}, 800);
	} catch {}
}
var SUBJECT_COLORS = [
	"#00f5ff",
	"#8a2be2",
	"#67e8f9",
	"#c084fc",
	"#2dd4bf",
	"#60a5fa",
	"#a78bfa",
	"#22d3ee"
];
function colorForSubject(subject) {
	let h = 0;
	for (let i = 0; i < subject.length; i++) h = h * 33 + subject.charCodeAt(i) >>> 0;
	return SUBJECT_COLORS[h % SUBJECT_COLORS.length] ?? "#00f5ff";
}
function monthLabel(d = /* @__PURE__ */ new Date()) {
	return format(d, "MMMM yyyy");
}
function timeSlot(start, end) {
	return `${start} – ${end}`;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var ICONS = {
	"first-session": BookOpen,
	"seven-streak": Flame,
	"fifty-hours": Timer,
	"night-owl": Moon,
	"perfect-week": Award
};
function AchievementsRow({ unlocked, justUnlocked }) {
	const set = new Set(unlocked);
	const rowRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!justUnlocked || !rowRef.current) return;
		const el = rowRef.current.querySelector(`[data-ach="${justUnlocked}"]`);
		if (!el) return;
		const ctx = gsapWithCSS.context(() => {
			gsapWithCSS.fromTo(el, { scale: .86 }, {
				scale: 1,
				duration: .55,
				ease: "back.out(2.2)"
			});
		});
		return () => ctx.revert();
	}, [justUnlocked]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-[1.75rem] p-5 sm:p-6",
		"data-reveal": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
				children: "Gamification"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-xl font-semibold",
				children: "Achievements"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: rowRef,
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
				children: ACHIEVEMENTS.map((a) => {
					const Icon = ICONS[a.id] ?? Award;
					const on = set.has(a.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-ach": a.id,
						className: cn("rounded-2xl border px-3 py-4 text-center", on ? "border-primary/35 bg-primary/10 shadow-[0_0_24px_rgba(0,245,255,0.12)]" : "border-border bg-bg/30 opacity-55"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("mx-auto mb-2 size-5", on ? "text-primary" : "text-muted") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: a.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[11px] leading-snug text-subtle",
								children: a.hint
							})
						]
					}, a.id);
				})
			})
		]
	});
}
function StudyCharts({ sessions, theme }) {
	const barRef = (0, import_react.useRef)(null);
	const pieRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let bar;
		let pie;
		let cancelled = false;
		(async () => {
			const Chart = (await import("../_libs/chart.js.mjs").then((n) => n.t)).default;
			if (cancelled) return;
			const tick = theme === "dark" ? "#8b9cb3" : "#5a6b80";
			const grid = theme === "dark" ? "rgba(0,245,255,0.08)" : "rgba(8,145,178,0.12)";
			const week = weekBuckets(sessions);
			const subjects = subjectTotals(sessions);
			if (barRef.current) bar = new Chart(barRef.current, {
				type: "bar",
				data: {
					labels: week.map((d) => d.label),
					datasets: [{
						label: "Hours",
						data: week.map((d) => d.hours),
						backgroundColor: "rgba(0, 245, 255, 0.72)",
						borderColor: "#00f5ff",
						borderWidth: 1,
						borderRadius: 8
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						x: {
							ticks: { color: tick },
							grid: { display: false }
						},
						y: {
							beginAtZero: true,
							ticks: { color: tick },
							grid: { color: grid }
						}
					}
				}
			});
			if (pieRef.current) pie = new Chart(pieRef.current, {
				type: "pie",
				data: {
					labels: subjects.length ? subjects.map((s) => s.subject) : ["No data"],
					datasets: [{
						data: subjects.length ? subjects.map((s) => s.hours) : [1],
						backgroundColor: subjects.length ? subjects.map((_, i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length]) : ["rgba(139,156,179,0.35)"],
						borderWidth: 0
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: {
						position: "bottom",
						labels: {
							color: tick,
							boxWidth: 10,
							font: { size: 11 }
						}
					} }
				}
			});
		})();
		return () => {
			cancelled = true;
			bar?.destroy();
			pie?.destroy();
		};
	}, [sessions, theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "glass rounded-[1.75rem] p-5 sm:p-6",
			"data-reveal": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
					children: "Weekly"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-display text-xl font-semibold",
					children: "Hours by day"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: barRef })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "glass rounded-[1.75rem] p-5 sm:p-6",
			"data-reveal": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
					children: "Subjects"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-display text-xl font-semibold",
					children: "Time split"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: pieRef })
				})
			]
		})]
	});
}
var COLORS = [
	"#00f5ff",
	"#8a2be2",
	"#67e8f9",
	"#c084fc",
	"#ffffff",
	"#2dd4bf"
];
function ConfettiBurst({ onDone }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const width = window.innerWidth;
		const height = window.innerHeight;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const pieces = Array.from({ length: 130 }, () => ({
			x: width * .5 + (Math.random() - .5) * 80,
			y: height * .28,
			vx: (Math.random() - .5) * 18,
			vy: -6 - Math.random() * 12,
			w: 5 + Math.random() * 7,
			h: 8 + Math.random() * 10,
			color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#00f5ff",
			rot: Math.random() * Math.PI,
			vr: (Math.random() - .5) * .35
		}));
		let alive = true;
		const start = performance.now();
		const frame = (t) => {
			if (!alive) return;
			ctx.clearRect(0, 0, width, height);
			for (const p of pieces) {
				p.vy += .32;
				p.vx *= .995;
				p.x += p.vx;
				p.y += p.vy;
				p.rot += p.vr;
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rot);
				ctx.fillStyle = p.color;
				ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
				ctx.restore();
			}
			if (t - start < 2300) requestAnimationFrame(frame);
			else onDone();
		};
		const id = requestAnimationFrame(frame);
		return () => {
			alive = false;
			cancelAnimationFrame(id);
		};
	}, [onDone]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "pointer-events-none fixed inset-0 z-[80]",
		"aria-hidden": "true"
	});
}
function Heatmap({ sessions }) {
	const days = (0, import_react.useMemo)(() => heatmapDays(sessions), [sessions]);
	const [tip, setTip] = (0, import_react.useState)(null);
	const weeks = [];
	for (let i = 0; i < days.length; i += 7) {
		const slice = days.slice(i, i + 7);
		if (slice.length) weeks.push(slice);
	}
	const monthMarks = [];
	let lastMonth = "";
	weeks.forEach((week, i) => {
		const first = week[0];
		if (!first) return;
		const label = format(parseISO(first.date), "MMM");
		if (label !== lastMonth) {
			monthMarks.push({
				index: i,
				label
			});
			lastMonth = label;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-[1.75rem] p-5 sm:p-6",
		"data-reveal": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
					children: "Calendar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Twelve-month heatmap"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 text-[11px] text-muted",
					children: [
						"Less",
						[
							0,
							1,
							2,
							3,
							4
						].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-3 rounded-[3px]", `heat-${l}`) }, l)),
						"More"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative overflow-x-auto pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-block min-w-max",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1.5 grid gap-[3px] pl-7",
						style: { gridTemplateColumns: `repeat(${weeks.length}, 12px)` },
						children: monthMarks.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-subtle",
							style: { gridColumnStart: m.index + 1 },
							children: m.label
						}, `${m.label}-${m.index}`))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-between py-[2px] text-[10px] text-subtle",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sun" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Wed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sat" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-[3px]",
							children: weeks.map((week, wi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-col gap-[3px]",
								children: Array.from({ length: 7 }, (_, di) => {
									const cell = week[di];
									if (!cell) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3" }, di);
									const lvl = heatLevel(cell.hours);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: cn("size-3 rounded-[3px]", `heat-${lvl}`),
										"aria-label": `${cell.date}: ${hoursFmt(cell.minutes)}`,
										onMouseEnter: (e) => {
											const rect = e.target.getBoundingClientRect();
											setTip({
												date: cell.date,
												hours: hoursFmt(cell.minutes),
												x: rect.left + rect.width / 2,
												y: rect.top
											});
										},
										onMouseLeave: () => setTip(null)
									}, cell.date);
								})
							}, wi))
						})]
					})]
				})
			}),
			tip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none fixed z-40 rounded-lg border border-border bg-bg-elevated px-2.5 py-1.5 text-xs shadow-xl",
				style: {
					left: tip.x,
					top: tip.y - 8,
					transform: "translate(-50%, -100%)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: tip.date
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [" · ", tip.hours]
				})]
			}) : null
		]
	});
}
function Particles({ theme }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let width = 0;
		let height = 0;
		const count = 64;
		const particles = [];
		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		for (let i = 0; i < count; i++) particles.push({
			x: Math.random() * width,
			y: Math.random() * height,
			r: .6 + Math.random() * 2.2,
			vx: -.15 + Math.random() * .3,
			vy: -.22 + Math.random() * .12,
			a: .18 + Math.random() * .45,
			hue: i % 3 === 0 ? "violet" : "cyan"
		});
		const tick = () => {
			ctx.clearRect(0, 0, width, height);
			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < -8) p.x = width + 8;
				if (p.x > width + 8) p.x = -8;
				if (p.y < -8) p.y = height + 8;
				if (p.y > height + 8) p.y = -8;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				const cyan = theme === "dark" ? "0, 245, 255" : "8, 145, 178";
				const violet = theme === "dark" ? "138, 43, 226" : "109, 40, 217";
				ctx.fillStyle = `rgba(${p.hue === "cyan" ? cyan : violet}, ${p.a})`;
				ctx.fill();
			}
		};
		gsapWithCSS.ticker.add(tick);
		window.addEventListener("resize", resize);
		return () => {
			gsapWithCSS.ticker.remove(tick);
			window.removeEventListener("resize", resize);
		};
	}, [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "pointer-events-none fixed inset-0 z-[1]",
		"aria-hidden": "true"
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[transform,box-shadow,background-color,opacity,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] hover:brightness-110 active:scale-[0.98]",
			glow: "bg-primary text-primary-fg btn-glow active:scale-[0.98]",
			outline: "border border-border bg-surface/60 text-fg hover:border-primary/40 hover:shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]",
			ghost: "text-muted hover:bg-surface hover:text-fg",
			accent: "bg-accent text-white hover:brightness-110 shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_40%,transparent)] active:scale-[0.98]"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-lg px-3 text-xs",
			lg: "h-12 px-6 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, type = "button", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	type,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
var FOCUS_SEC = 1500;
var BREAK_SEC = 300;
var RADIUS = 92;
var CIRC = 2 * Math.PI * RADIUS;
function Pomodoro({ onFocusComplete }) {
	const [mode, setMode] = (0, import_react.useState)("focus");
	const [remaining, setRemaining] = (0, import_react.useState)(FOCUS_SEC);
	const [running, setRunning] = (0, import_react.useState)(false);
	const ringRef = (0, import_react.useRef)(null);
	const startedAt = (0, import_react.useRef)(null);
	const finishing = (0, import_react.useRef)(false);
	const total = mode === "focus" ? FOCUS_SEC : BREAK_SEC;
	const progress = 1 - remaining / total;
	(0, import_react.useEffect)(() => {
		const el = ringRef.current;
		if (!el) return;
		gsapWithCSS.to(el, {
			strokeDashoffset: CIRC * (1 - progress),
			duration: .45,
			ease: "power2.out"
		});
	}, [progress]);
	(0, import_react.useEffect)(() => {
		if (!running) return;
		const id = window.setInterval(() => {
			setRemaining((r) => {
				if (r <= 1) {
					window.clearInterval(id);
					return 0;
				}
				return r - 1;
			});
		}, 1e3);
		return () => window.clearInterval(id);
	}, [running]);
	(0, import_react.useEffect)(() => {
		if (remaining !== 0 || !startedAt.current || finishing.current) return;
		finishing.current = true;
		playBeep();
		if (mode === "focus") {
			const end = /* @__PURE__ */ new Date();
			const start = /* @__PURE__ */ new Date(end.getTime() - FOCUS_SEC * 1e3);
			const fmt = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
			onFocusComplete({
				startTime: fmt(start),
				endTime: fmt(end)
			});
			setMode("break");
			setRemaining(BREAK_SEC);
			startedAt.current = Date.now();
			setRunning(true);
		} else {
			setMode("focus");
			setRemaining(FOCUS_SEC);
			startedAt.current = null;
			setRunning(false);
		}
		window.setTimeout(() => {
			finishing.current = false;
		}, 50);
	}, [
		remaining,
		mode,
		onFocusComplete
	]);
	const label = (0, import_react.useMemo)(() => {
		const m = Math.floor(remaining / 60);
		const s = remaining % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}, [remaining]);
	const toggle = () => {
		if (running) {
			setRunning(false);
			return;
		}
		if (!startedAt.current) startedAt.current = Date.now();
		setRunning(true);
	};
	const reset = () => {
		setRunning(false);
		startedAt.current = null;
		setMode("focus");
		setRemaining(FOCUS_SEC);
		finishing.current = false;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-[1.75rem] p-5 sm:p-6",
		"data-reveal": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
					children: "Pomodoro"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Focus clock"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full px-3 py-1 text-xs font-medium", mode === "focus" ? "bg-primary/15 text-primary" : "bg-accent/20 text-fg"),
					children: mode === "focus" ? "25 min focus" : "5 min break"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid size-[232px] place-items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					className: "absolute inset-0 size-full -rotate-90",
					viewBox: "0 0 220 220",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "110",
							cy: "110",
							r: RADIUS,
							fill: "none",
							stroke: "currentColor",
							className: "text-fg/10",
							strokeWidth: "10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							ref: ringRef,
							cx: "110",
							cy: "110",
							r: RADIUS,
							fill: "none",
							stroke: "url(#pomodoroGlow)",
							strokeWidth: "10",
							strokeLinecap: "round",
							strokeDasharray: CIRC,
							strokeDashoffset: CIRC,
							style: { filter: "drop-shadow(0 0 8px rgba(0,245,255,0.55))" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "pomodoroGlow",
							x1: "0",
							y1: "0",
							x2: "1",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "#00f5ff"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "#8a2be2"
							})]
						}) })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[2.7rem] font-medium tabular-nums leading-none tracking-tight",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs tracking-wide text-muted uppercase",
						children: running ? "In session" : remaining === total ? "Ready" : "Paused"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center justify-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "glow",
					onClick: toggle,
					className: "min-w-32",
					children: [running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), running ? "Pause" : "Start"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					onClick: reset,
					"aria-label": "Reset timer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs text-subtle",
				children: "When focus ends, start and end times fill the log automatically."
			})
		]
	});
}
var CARD_BG = "#0b1020";
var CARD_FG = "#e8f4ff";
var MUTED = "#8b9cb3";
var CYAN = "#00f5ff";
var VIOLET = "#8a2be2";
var LINE = "rgba(0,245,255,0.16)";
function drawPie(canvas, slices) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	const total = slices.reduce((a, s) => a + s.value, 0);
	const cx = w / 2;
	const cy = h / 2;
	const r = Math.min(cx, cy) - 6;
	if (total <= 0) {
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.fillStyle = "#1a2238";
		ctx.fill();
		return;
	}
	let a = -Math.PI / 2;
	for (const s of slices) {
		const da = s.value / total * Math.PI * 2;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.arc(cx, cy, r, a, a + da);
		ctx.closePath();
		ctx.fillStyle = s.color;
		ctx.fill();
		a += da;
	}
}
function ReportCards({ name, sessions, goalHours, streak }) {
	const dailyRef = (0, import_react.useRef)(null);
	const monthlyRef = (0, import_react.useRef)(null);
	const pieRef = (0, import_react.useRef)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const today = localDateStr();
	const now = /* @__PURE__ */ new Date();
	const todaySessions = sessions.filter((s) => s.date === today);
	const monthMins = minutesInMonth(sessions, now.getFullYear(), now.getMonth());
	const monthHours = decimalHours(monthMins);
	const dayNum = now.getDate();
	const avgPerDay = dayNum > 0 ? monthHours / dayNum : 0;
	const goalPct = goalHours > 0 ? Math.min(999, monthHours / goalHours * 100) : 0;
	const { level } = levelFromXp(xpFromSessions(sessions));
	const tops = subjectTotals(sessions).slice(0, 5);
	const quote = quoteForDate(today);
	const initials = getInitials(name);
	const monthKey = format(now, "yyyy-MM");
	const monthCells = (0, import_react.useMemo)(() => {
		const start = startOfMonth(now);
		const count = getDaysInMonth(now);
		const pad = start.getDay();
		const cells = [];
		for (let i = 0; i < pad; i++) cells.push({
			date: null,
			hours: 0
		});
		for (let d = 1; d <= count; d++) {
			const date = format(new Date(now.getFullYear(), now.getMonth(), d), "yyyy-MM-dd");
			cells.push({
				date,
				hours: decimalHours(minutesOnDate(sessions, date))
			});
		}
		return cells;
	}, [sessions, monthKey]);
	(0, import_react.useEffect)(() => {
		if (pieRef.current) drawPie(pieRef.current, tops.length ? tops.map((t) => ({
			value: t.minutes,
			color: colorForSubject(t.subject)
		})) : []);
	}, [tops]);
	const capture = async (kind) => {
		const el = kind === "daily" ? dailyRef.current : monthlyRef.current;
		if (!el) return;
		setBusy(kind);
		try {
			await document.fonts.ready;
			const html2canvas = (await import("../_libs/html2canvas.mjs").then((n) => n.t)).default;
			const canvas = await html2canvas(el, {
				scale: 2,
				backgroundColor: CARD_BG,
				useCORS: true,
				logging: false
			});
			const a = document.createElement("a");
			const stamp = kind === "daily" ? today : format(now, "yyyy-MM");
			a.href = canvas.toDataURL("image/png");
			a.download = `StudyReport-${kind === "daily" ? "Daily" : "Monthly"}-${stamp}.png`;
			a.click();
		} catch (err) {
			console.error(err);
		} finally {
			setBusy(null);
		}
	};
	const cellHex = (hours) => {
		const lvl = heatLevel(hours);
		if (lvl === 0) return "#161b2e";
		if (lvl === 1) return "#0e4a55";
		if (lvl === 2) return "#128a96";
		if (lvl === 3) return "#00d5de";
		return "#00f5ff";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-[1.75rem] p-5 sm:p-6",
		"data-reveal": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
				children: "Export"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-xl font-semibold",
				children: "Report cards"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-5 max-w-xl text-sm text-muted",
				children: "Snapshot today or this month as a shareable PNG — signed with your name."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "glow",
					onClick: () => void capture("daily"),
					disabled: busy !== null,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), busy === "daily" ? "Rendering…" : "Download Daily PNG"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => void capture("monthly"),
					disabled: busy !== null,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), busy === "monthly" ? "Rendering…" : "Download Monthly PNG"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"aria-hidden": "true",
				style: {
					position: "fixed",
					left: -12e3,
					top: 0,
					pointerEvents: "none",
					zIndex: -1
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: dailyRef,
					style: {
						width: 840,
						background: CARD_BG,
						color: CARD_FG,
						fontFamily: "Outfit, sans-serif",
						padding: 40,
						boxSizing: "border-box"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
							height: 6,
							borderRadius: 99,
							background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})`,
							marginBottom: 28
						} }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: 16,
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										width: 56,
										height: 56,
										borderRadius: 18,
										background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`,
										color: "#041016",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontFamily: "Syne, sans-serif",
										fontWeight: 700,
										fontSize: 20
									},
									children: initials
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 13,
											letterSpacing: "0.18em",
											color: CYAN,
											textTransform: "uppercase"
										},
										children: "Daily report"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontFamily: "Syne, sans-serif",
											fontSize: 28,
											fontWeight: 700
										},
										children: name || "Student"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											color: MUTED,
											marginTop: 2
										},
										children: format(parseISO(today), "EEEE, d MMMM yyyy")
									})
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									textAlign: "right",
									color: MUTED,
									fontSize: 13
								},
								children: "StudyReport AI"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr 1fr",
								gap: 12,
								marginTop: 28
							},
							children: [
								{
									k: "Hours today",
									v: hoursFmt(minutesOnDate(sessions, today))
								},
								{
									k: "Streak",
									v: `${streak} day${streak === 1 ? "" : "s"}`
								},
								{
									k: "Level",
									v: `Lv ${level}`
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#12182a",
									border: `1px solid ${LINE}`,
									borderRadius: 16,
									padding: "16px 18px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: MUTED,
										fontSize: 12
									},
									children: s.k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontFamily: "IBM Plex Mono, monospace",
										fontSize: 22,
										marginTop: 6,
										color: CYAN
									},
									children: s.v
								})]
							}, s.k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							style: {
								width: "100%",
								marginTop: 28,
								borderCollapse: "collapse",
								fontSize: 13
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
								"Subject",
								"Topic",
								"Time slot",
								"Duration"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									textAlign: "left",
									color: MUTED,
									fontWeight: 500,
									padding: "10px 8px",
									borderBottom: `1px solid ${LINE}`
								},
								children: h
							}, h)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: todaySessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 4,
								style: {
									padding: 16,
									color: MUTED
								},
								children: "No sessions logged today."
							}) }) : todaySessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "10px 8px",
										borderBottom: "1px solid #162033"
									},
									children: s.subject
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "10px 8px",
										borderBottom: "1px solid #162033"
									},
									children: s.topic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "10px 8px",
										borderBottom: "1px solid #162033"
									},
									children: timeSlot(s.startTime, s.endTime)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "10px 8px",
										borderBottom: "1px solid #162033"
									},
									children: hoursFmt(s.durationMinutes)
								})
							] }, s.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 36,
								paddingTop: 18,
								borderTop: `1px solid ${LINE}`,
								color: MUTED,
								fontStyle: "italic",
								fontSize: 14
							},
							children: [
								"“",
								quote,
								"”"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: monthlyRef,
					style: {
						width: 960,
						background: CARD_BG,
						color: CARD_FG,
						fontFamily: "Outfit, sans-serif",
						padding: 40,
						boxSizing: "border-box"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
							height: 6,
							borderRadius: 99,
							background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})`,
							marginBottom: 24
						} }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-end"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 13,
										letterSpacing: "0.18em",
										color: CYAN,
										textTransform: "uppercase"
									},
									children: "Monthly report"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontFamily: "Syne, sans-serif",
										fontSize: 30,
										fontWeight: 700
									},
									children: name || "Student"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: MUTED,
										marginTop: 4
									},
									children: monthLabel(now)
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: MUTED,
									fontSize: 13
								},
								children: "Generated by StudyReport AI"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(4, 1fr)",
								gap: 12,
								marginTop: 24
							},
							children: [
								{
									k: "Total hours",
									v: hoursFmt(monthMins)
								},
								{
									k: "Avg / day",
									v: `${avgPerDay.toFixed(1)}h`
								},
								{
									k: "Goal",
									v: `${Math.round(goalPct)}%`
								},
								{
									k: "Best streak",
									v: `${bestStreak(sessions)}d`
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#12182a",
									border: `1px solid ${LINE}`,
									borderRadius: 16,
									padding: "14px 16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: MUTED,
										fontSize: 12
									},
									children: s.k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontFamily: "IBM Plex Mono, monospace",
										fontSize: 20,
										marginTop: 6,
										color: CYAN
									},
									children: s.v
								})]
							}, s.k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "280px 1fr",
								gap: 24,
								marginTop: 28
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 13,
									color: MUTED,
									marginBottom: 10
								},
								children: "Subject mix"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
								ref: pieRef,
								width: 240,
								height: 240,
								style: {
									width: 240,
									height: 240
								}
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 13,
										color: MUTED,
										marginBottom: 10
									},
									children: "Top 5 subjects"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									style: {
										width: "100%",
										borderCollapse: "collapse",
										fontSize: 13
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: ["Subject", "Hours"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: {
											textAlign: "left",
											color: MUTED,
											fontWeight: 500,
											padding: "8px 6px",
											borderBottom: `1px solid ${LINE}`
										},
										children: h
									}, h)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: tops.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 2,
										style: {
											padding: 12,
											color: MUTED
										},
										children: "No sessions this month yet."
									}) }) : tops.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										style: {
											padding: "9px 6px",
											borderBottom: "1px solid #162033"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
											display: "inline-block",
											width: 8,
											height: 8,
											borderRadius: 99,
											background: colorForSubject(t.subject),
											marginRight: 8
										} }), t.subject]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										style: {
											padding: "9px 6px",
											borderBottom: "1px solid #162033"
										},
										children: [t.hours.toFixed(1), "h"]
									})] }, t.subject)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										marginTop: 18,
										fontSize: 13,
										color: MUTED,
										marginBottom: 8
									},
									children: "Mini heatmap"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(7, 18px)",
										gap: 4
									},
									children: [[
										"S",
										"M",
										"T",
										"W",
										"T",
										"F",
										"S"
									].map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 10,
											color: MUTED,
											textAlign: "center"
										},
										children: d
									}, `${d}-${i}`)), monthCells.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
										width: 18,
										height: 18,
										borderRadius: 4,
										background: c.date ? cellHex(c.hours) : "transparent"
									} }, i))]
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								marginTop: 28,
								color: MUTED,
								fontSize: 12,
								letterSpacing: "0.08em"
							},
							children: "GENERATED BY STUDYREPORT AI"
						})
					]
				})]
			})
		]
	});
}
function defaultForm() {
	const now = /* @__PURE__ */ new Date();
	const end = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
	const startDate = /* @__PURE__ */ new Date(now.getTime() - 15e5);
	const start = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
	return {
		subject: "",
		topic: "",
		date: localDateStr(now),
		startTime: start,
		endTime: end,
		rating: 4,
		notes: ""
	};
}
function SessionForm({ form, setForm, onSave }) {
	const [error, setError] = (0, import_react.useState)("");
	const mins = durationMinutes(form.startTime, form.endTime);
	const submit = (e) => {
		e.preventDefault();
		if (!form.subject.trim() || !form.topic.trim()) {
			setError("Add a subject and topic.");
			return;
		}
		if (!form.startTime || !form.endTime) {
			setError("Start and end times are required.");
			return;
		}
		if (mins <= 0) {
			setError("End time must be after start time.");
			return;
		}
		if (mins > 960) {
			setError("Sessions over 16 hours are not allowed.");
			return;
		}
		setError("");
		onSave({
			id: crypto.randomUUID(),
			subject: form.subject.trim(),
			topic: form.topic.trim(),
			date: form.date || localDateStr(),
			startTime: form.startTime,
			endTime: form.endTime,
			durationMinutes: mins,
			rating: form.rating,
			notes: form.notes.trim()
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-[1.75rem] p-5 sm:p-6",
		"data-reveal": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
				children: "Tracker"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-5 font-display text-xl font-semibold",
				children: "Log a session"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 sm:grid-cols-2",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-medium text-muted",
						children: [
							"Subject",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field mt-1.5",
								list: "subject-list",
								placeholder: "Computer Science",
								value: form.subject,
								onChange: (e) => setForm({
									...form,
									subject: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
								id: "subject-list",
								children: SUBJECT_SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s }, s))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-medium text-muted",
						children: ["Topic", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field mt-1.5",
							placeholder: "Binary trees",
							value: form.topic,
							onChange: (e) => setForm({
								...form,
								topic: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-medium text-muted",
						children: ["Date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field mt-1.5",
							type: "date",
							value: form.date,
							onChange: (e) => setForm({
								...form,
								date: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs font-medium text-muted",
							children: ["Start", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field mt-1.5",
								type: "time",
								value: form.startTime,
								onChange: (e) => setForm({
									...form,
									startTime: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs font-medium text-muted",
							children: ["End", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field mt-1.5",
								type: "time",
								value: form.endTime,
								onChange: (e) => setForm({
									...form,
									endTime: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs font-medium text-muted",
							children: "Rating"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [[
								1,
								2,
								3,
								4,
								5
							].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-11 place-items-center rounded-xl hover:bg-surface",
								onClick: () => setForm({
									...form,
									rating: n
								}),
								"aria-label": `${n} star${n === 1 ? "" : "s"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-5", n <= form.rating ? "fill-primary text-primary" : "text-subtle") })
							}, n)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 self-center font-mono text-xs text-muted tabular-nums",
								children: mins > 0 ? `${mins} min` : "—"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-medium text-muted sm:col-span-2",
						children: ["Notes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field mt-1.5",
							maxLength: 500,
							placeholder: "What clicked, what to revisit…",
							value: form.notes,
							onChange: (e) => setForm({
								...form,
								notes: e.target.value
							})
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-red-400 sm:col-span-2",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "glow",
							className: "w-full sm:w-auto",
							children: "Save session"
						})
					})
				]
			})
		]
	});
}
function SetupModal({ onSave }) {
	const [name, setName] = (0, import_react.useState)("");
	const rootRef = (0, import_react.useRef)(null);
	const cardRef = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const ctx = gsapWithCSS.context(() => {
			gsapWithCSS.from(rootRef.current, {
				opacity: 0,
				duration: reduced ? 0 : .45
			});
			gsapWithCSS.from(cardRef.current, {
				y: 28,
				scale: .96,
				opacity: 0,
				duration: reduced ? 0 : .7,
				ease: "power3.out"
			});
		});
		return () => ctx.revert();
	}, []);
	const submit = () => {
		const next = name.trim();
		if (next.length < 1) return;
		onSave(next.slice(0, 32));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: "fixed inset-0 z-50 flex items-center justify-center px-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "welcome-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-bg/70 backdrop-blur-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: cardRef,
			className: "glass relative w-full max-w-md rounded-[1.75rem] p-7 sm:p-9",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium tracking-[0.22em] text-primary uppercase",
					children: "StudyReport AI"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					id: "welcome-title",
					className: "font-display text-3xl font-semibold tracking-tight",
					children: "Enter your name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "Reports, streaks, and XP will be signed with this name. You can change it later from your avatar."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-7 space-y-4",
					onSubmit: (e) => {
						e.preventDefault();
						submit();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs font-medium tracking-wide text-muted uppercase",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							className: "field mt-2",
							maxLength: 32,
							placeholder: "Alex Rivera",
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "glow",
						size: "lg",
						className: "w-full",
						disabled: !name.trim(),
						children: "Begin"
					})]
				})
			]
		})]
	});
}
function AppShell() {
	const rootRef = (0, import_react.useRef)(null);
	const streakRef = (0, import_react.useRef)(null);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [settings, setSettings] = (0, import_react.useState)(() => ({
		name: "",
		theme: "dark",
		monthlyGoalHours: 40,
		unlockedAchievements: []
	}));
	const [sessions, setSessions] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)(defaultForm);
	const [confetti, setConfetti] = (0, import_react.useState)(false);
	const [justUnlocked, setJustUnlocked] = (0, import_react.useState)(null);
	const [renameOpen, setRenameOpen] = (0, import_react.useState)(false);
	const [renameValue, setRenameValue] = (0, import_react.useState)("");
	const [goalDraft, setGoalDraft] = (0, import_react.useState)("40");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			const loadedSettings = loadSettings();
			const loadedSessions = await loadSessions();
			if (cancelled) return;
			document.documentElement.setAttribute("data-theme", loadedSettings.theme);
			setSettings(loadedSettings);
			setSessions(loadedSessions);
			setGoalDraft(String(loadedSettings.monthlyGoalHours));
			setHydrated(true);
		})();
		return () => {
			cancelled = true;
		};
	}, []);
	const persist = (0, import_react.useCallback)((next) => {
		setSettings(next);
		saveSettings(next);
		document.documentElement.setAttribute("data-theme", next.theme);
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		if (!hydrated || !settings.name) return;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const ctx = gsapWithCSS.context(() => {
			gsapWithCSS.from("[data-reveal]", {
				y: reduced ? 0 : 22,
				opacity: 0,
				duration: reduced ? 0 : .65,
				stagger: .06,
				ease: "power3.out"
			});
		}, rootRef);
		return () => ctx.revert();
	}, [hydrated, settings.name]);
	const today = localDateStr();
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const monthIndex = (/* @__PURE__ */ new Date()).getMonth();
	const streak = (0, import_react.useMemo)(() => currentStreak(sessions, today), [sessions, today]);
	const todayMins = (0, import_react.useMemo)(() => minutesOnDate(sessions, today), [sessions, today]);
	const monthMins = (0, import_react.useMemo)(() => minutesInMonth(sessions, year, monthIndex), [
		sessions,
		year,
		monthIndex
	]);
	const xp = xpFromSessions(sessions);
	const { level, into, next } = levelFromXp(xp);
	const monthHours = decimalHours(monthMins);
	const goalPct = settings.monthlyGoalHours > 0 ? Math.min(100, monthHours / settings.monthlyGoalHours * 100) : 0;
	const ring = 2 * Math.PI * 54;
	const initials = getInitials(settings.name);
	const applyUnlocks = (0, import_react.useCallback)((nextSessions, base) => {
		const fresh = detectUnlocks(nextSessions, base.unlockedAchievements);
		if (fresh.length === 0) return;
		const merged = {
			...base,
			unlockedAchievements: [...base.unlockedAchievements, ...fresh]
		};
		persist(merged);
		const first = ACHIEVEMENTS.find((a) => a.id === fresh[0]);
		setJustUnlocked(fresh[0] ?? null);
		setConfetti(true);
		toast.success(first ? `Unlocked: ${first.title}` : "Achievement unlocked");
	}, [persist]);
	const onSaveSession = async (session) => {
		const next = await persistSession(session, sessions);
		setSessions(next);
		setForm({
			...defaultForm(),
			subject: session.subject
		});
		toast.success("Session saved");
		if (streakRef.current) gsapWithCSS.fromTo(streakRef.current, { scale: .86 }, {
			scale: 1,
			duration: .45,
			ease: "back.out(2.4)"
		});
		applyUnlocks(next, settings);
	};
	const onDelete = async (id) => {
		const next = await removeSession(id, sessions);
		setSessions(next);
	};
	const onFocusComplete = (0, import_react.useCallback)((payload) => {
		setForm((prev) => ({
			...prev,
			date: localDateStr(),
			startTime: payload.startTime,
			endTime: payload.endTime
		}));
		toast.message("Focus block complete — times filled in the log.");
	}, []);
	const toggleTheme = () => {
		persist({
			...settings,
			theme: settings.theme === "dark" ? "light" : "dark"
		});
	};
	const commitGoal = () => {
		const n = Number(goalDraft);
		if (!Number.isFinite(n) || n < 1 || n > 400) {
			setGoalDraft(String(settings.monthlyGoalHours));
			return;
		}
		persist({
			...settings,
			monthlyGoalHours: Math.round(n)
		});
	};
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative z-10 grid min-h-screen place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.28em] text-primary uppercase",
				children: "StudyReport AI"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-2xl",
				children: "Loading your desk…"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: "relative z-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, { theme: settings.theme }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: settings.theme,
				position: "top-center",
				toastOptions: { className: "glass !border-border !bg-card !text-fg" }
			}),
			confetti ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfettiBurst, { onDone: () => setConfetti(false) }) : null,
			!settings.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupModal, { onSave: (name) => persist({
				...settings,
				name
			}) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-border/80 bg-bg/55 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grad-brand grid size-10 shrink-0 place-items-center rounded-2xl font-display text-sm font-bold text-primary-fg",
							children: "SR"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-base font-semibold tracking-tight sm:text-lg",
								children: "StudyReport AI"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: "Focus, track, export"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 sm:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs tabular-nums",
										children: [xp, " XP"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: ["Lv ", level]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								onClick: toggleTheme,
								"aria-label": settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
								children: settings.theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex items-center gap-2 rounded-full border border-border bg-surface/80 py-1 pr-3 pl-1",
								onClick: () => {
									setRenameValue(settings.name);
									setRenameOpen(true);
								},
								"aria-label": "Edit name",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grad-brand grid size-8 place-items-center rounded-full text-xs font-bold text-primary-fg",
										children: initials
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden max-w-28 truncate text-sm sm:inline",
										children: settings.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "hidden size-3.5 text-muted sm:block" })
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						"data-reveal": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Streak",
								value: `${streak}`,
								hint: "consecutive days",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									ref: streakRef,
									className: cn(streak > 0 && "text-primary"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Today",
								value: hoursFmt(todayMins),
								hint: "logged hours",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-5 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: `Level ${level}`,
								value: rankName(level),
								hint: `${into}/${next} XP to next`,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-5 text-primary" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 h-1.5 overflow-hidden rounded-full bg-fg/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grad-bar h-full rounded-full",
										style: { width: `${into}%` }
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Monthly goal",
								value: `${Math.round(goalPct)}%`,
								hint: `${monthHours.toFixed(1)}h / ${settings.monthlyGoalHours}h`,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-5 text-primary" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pomodoro, { onFocusComplete }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionForm, {
							form,
							setForm,
							onSave: (s) => void onSaveSession(s)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AchievementsRow, {
						unlocked: settings.unlockedAchievements,
						justUnlocked
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, { sessions }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudyCharts, {
						sessions,
						theme: settings.theme
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "glass rounded-[1.75rem] p-5 sm:p-6",
						"data-reveal": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-6 md:flex-row md:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalRing, {
								pct: goalPct,
								hours: monthHours,
								goal: settings.monthlyGoalHours,
								ring
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
										children: "Goal tracker"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-xl font-semibold",
										children: "Monthly target hours"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Set a target. The ring fills as you log time this month."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-4 block max-w-xs text-xs font-medium text-muted",
										children: ["Hours", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field mt-1.5",
											type: "number",
											min: 1,
											max: 400,
											value: goalDraft,
											onChange: (e) => setGoalDraft(e.target.value),
											onBlur: commitGoal,
											onKeyDown: (e) => {
												if (e.key === "Enter") e.target.blur();
											}
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass rounded-[1.75rem] p-5 sm:p-6",
						"data-reveal": true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
								children: "Log"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold",
								children: "Recent sessions"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-muted tabular-nums",
								children: [sessions.length, " total"]
							})]
						}), sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted",
							children: "No sessions yet. Start the timer or log your first block."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: sessions.slice(0, 10).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center gap-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate font-medium",
										children: [s.subject, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [" · ", s.topic]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-subtle",
										children: [
											s.date,
											" · ",
											timeSlot(s.startTime, s.endTime),
											" · ",
											hoursFmt(s.durationMinutes),
											" ·",
											" ",
											s.rating,
											"/5"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => void onDelete(s.id),
									children: "Remove"
								})]
							}, s.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportCards, {
						name: settings.name,
						sessions,
						goalHours: settings.monthlyGoalHours,
						streak
					})
				]
			}),
			renameOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 grid place-items-center px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-bg/70 backdrop-blur-sm",
					"aria-label": "Close",
					onClick: () => setRenameOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass relative w-full max-w-sm rounded-[1.5rem] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Your name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field mt-4",
							value: renameValue,
							maxLength: 32,
							onChange: (e) => setRenameValue(e.target.value),
							autoFocus: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setRenameOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "glow",
								onClick: () => {
									const n = renameValue.trim();
									if (!n) return;
									persist({
										...settings,
										name: n
									});
									setRenameOpen(false);
								},
								children: "Save"
							})]
						})
					]
				})]
			}) : null
		]
	});
}
function StatCard({ label, value, hint, icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-[1.5rem] p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: label
				}), icon]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: hint
			}),
			children
		]
	});
}
function GoalRing({ pct, hours, goal, ring }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto grid size-36 place-items-center md:mx-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "absolute inset-0 size-full -rotate-90",
			viewBox: "0 0 128 128",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "64",
					cy: "64",
					r: "54",
					fill: "none",
					stroke: "currentColor",
					className: "text-fg/10",
					strokeWidth: "10"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "64",
					cy: "64",
					r: "54",
					fill: "none",
					stroke: "url(#goalGlow)",
					strokeWidth: "10",
					strokeLinecap: "round",
					strokeDasharray: ring,
					strokeDashoffset: ring * (1 - pct / 100),
					style: { filter: "drop-shadow(0 0 6px rgba(0,245,255,0.45))" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "goalGlow",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#00f5ff"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#8a2be2"
					})]
				}) })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-2xl font-medium tabular-nums",
				children: [Math.round(pct), "%"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[10px] text-muted",
				children: [
					hours.toFixed(1),
					"/",
					goal,
					"h"
				]
			})]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
