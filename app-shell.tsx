import gsap from "gsap";
import { Flame, Moon, Pencil, Sun, Target, Trophy, Zap } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { AchievementsRow } from "@/components/study/achievements";
import { StudyCharts } from "@/components/study/charts";
import { ConfettiBurst } from "@/components/study/confetti";
import { Heatmap } from "@/components/study/heatmap";
import { Particles } from "@/components/study/particles";
import { Pomodoro } from "@/components/study/pomodoro";
import { ReportCards } from "@/components/study/reports";
import { defaultForm, SessionForm, type FormState } from "@/components/study/session-form";
import { SetupModal } from "@/components/study/setup-modal";
import { Button } from "@/components/ui/button";
import {
  ACHIEVEMENTS,
  currentStreak,
  decimalHours,
  detectUnlocks,
  getInitials,
  hoursFmt,
  levelFromXp,
  loadSessions,
  loadSettings,
  localDateStr,
  minutesInMonth,
  minutesOnDate,
  persistSession,
  rankName,
  removeSession,
  saveSettings,
  timeSlot,
  type StudySession,
  type StudySettings,
  xpFromSessions,
} from "@/lib/study";
import { cn } from "@/lib/utils";

export function AppShell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<StudySettings>({
    name: "",
    theme: "dark",
    monthlyGoalHours: 40,
    unlockedAchievements: [],
  });
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [form, setForm] = useState<FormState>({
    subject: "",
    topic: "",
    date: "",
    startTime: "",
    endTime: "",
    rating: 4,
    notes: "",
  });
  const [confetti, setConfetti] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [goalDraft, setGoalDraft] = useState("40");
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const loadedSettings = loadSettings();
    document.documentElement.setAttribute("data-theme", loadedSettings.theme);
    setSettings(loadedSettings);
    setGoalDraft(String(loadedSettings.monthlyGoalHours));
    setBooted(true);
    setForm(defaultForm());
    void loadSessions().then(setSessions);
  }, []);

  const persist = useCallback((next: StudySettings) => {
    setSettings(next);
    saveSettings(next);
    document.documentElement.setAttribute("data-theme", next.theme);
  }, []);

  useLayoutEffect(() => {
    if (!booted || !settings.name) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        y: reduced ? 0 : 22,
        opacity: 0,
        duration: reduced ? 0 : 0.65,
        stagger: 0.06,
        ease: "power3.out",
      });
    }, rootRef);
    return () => ctx.revert();
  }, [booted, settings.name]);

  const today = localDateStr();
  const year = new Date().getFullYear();
  const monthIndex = new Date().getMonth();
  const streak = useMemo(() => currentStreak(sessions, today), [sessions, today]);
  const todayMins = useMemo(() => minutesOnDate(sessions, today), [sessions, today]);
  const monthMins = useMemo(
    () => minutesInMonth(sessions, year, monthIndex),
    [sessions, year, monthIndex],
  );
  const xp = xpFromSessions(sessions);
  const { level, into, next } = levelFromXp(xp);
  const monthHours = decimalHours(monthMins);
  const goalPct =
    settings.monthlyGoalHours > 0
      ? Math.min(100, (monthHours / settings.monthlyGoalHours) * 100)
      : 0;
  const ring = 2 * Math.PI * 54;
  const initials = getInitials(settings.name);

  const applyUnlocks = useCallback(
    (nextSessions: StudySession[], base: StudySettings) => {
      const fresh = detectUnlocks(nextSessions, base.unlockedAchievements);
      if (fresh.length === 0) return;
      const merged = { ...base, unlockedAchievements: [...base.unlockedAchievements, ...fresh] };
      persist(merged);
      const first = ACHIEVEMENTS.find((a) => a.id === fresh[0]);
      setJustUnlocked(fresh[0] ?? null);
      setConfetti(true);
      toast.success(first ? `Unlocked: ${first.title}` : "Achievement unlocked");
    },
    [persist],
  );

  const onSaveSession = async (session: StudySession) => {
    const next = await persistSession(session, sessions);
    setSessions(next);
    setForm({ ...defaultForm(), subject: session.subject });
    toast.success("Session saved");
    if (streakRef.current) {
      gsap.fromTo(
        streakRef.current,
        { scale: 0.86 },
        { scale: 1, duration: 0.45, ease: "back.out(2.4)" },
      );
    }
    applyUnlocks(next, settings);
  };

  const onDelete = async (id: string) => {
    const next = await removeSession(id, sessions);
    setSessions(next);
  };

  const onFocusComplete = useCallback((payload: { startTime: string; endTime: string }) => {
    setForm((prev) => ({
      ...prev,
      date: localDateStr(),
      startTime: payload.startTime,
      endTime: payload.endTime,
    }));
    toast.message("Focus block complete — times filled in the log.");
  }, []);

  const toggleTheme = () => {
    persist({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" });
  };

  const commitGoal = () => {
    const n = Number(goalDraft);
    if (!Number.isFinite(n) || n < 1 || n > 400) {
      setGoalDraft(String(settings.monthlyGoalHours));
      return;
    }
    persist({ ...settings, monthlyGoalHours: Math.round(n) });
  };

  return (
    <div ref={rootRef} className="relative z-10">
      <Particles theme={settings.theme} />
      <Toaster
        theme={settings.theme}
        position="top-center"
        toastOptions={{
          className: "glass !border-border !bg-card !text-fg",
        }}
      />
      {confetti ? <ConfettiBurst onDone={() => setConfetti(false)} /> : null}
      {!settings.name ? (
        <SetupModal
          onSave={(name) => persist({ ...settings, name })}
        />
      ) : null}

      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grad-brand grid size-10 shrink-0 place-items-center rounded-2xl font-display text-sm font-bold text-primary-fg">
              SR
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold tracking-tight sm:text-lg">
                StudyReport AI
              </p>
              <p className="truncate text-xs text-muted">Focus, track, export</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 sm:flex">
              <Zap className="size-3.5 text-primary" />
              <span className="font-mono text-xs tabular-nums">{xp} XP</span>
              <span className="text-subtle">·</span>
              <span className="text-xs text-muted">Lv {level}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {settings.theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border bg-surface/80 py-1 pr-3 pl-1"
              onClick={() => {
                setRenameValue(settings.name);
                setRenameOpen(true);
              }}
              aria-label="Edit name"
            >
              <span className="grad-brand grid size-8 place-items-center rounded-full text-xs font-bold text-primary-fg">
                {initials}
              </span>
              <span className="hidden max-w-28 truncate text-sm sm:inline">{settings.name}</span>
              <Pencil className="hidden size-3.5 text-muted sm:block" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          <StatCard
            label="Streak"
            value={`${streak}`}
            hint="consecutive days"
            icon={
              <div ref={streakRef} className={cn(streak > 0 && "text-primary")}>
                <Flame className="size-5" />
              </div>
            }
          />
          <StatCard
            label="Today"
            value={hoursFmt(todayMins)}
            hint="logged hours"
            icon={<Target className="size-5 text-primary" />}
          />
          <StatCard
            label={`Level ${level}`}
            value={rankName(level)}
            hint={`${into}/${next} XP to next`}
            icon={<Trophy className="size-5 text-primary" />}
          >
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fg/10">
              <div
                className="grad-bar h-full rounded-full"
                style={{ width: `${into}%` }}
              />
            </div>
          </StatCard>
          <StatCard
            label="Monthly goal"
            value={`${Math.round(goalPct)}%`}
            hint={`${monthHours.toFixed(1)}h / ${settings.monthlyGoalHours}h`}
            icon={<Target className="size-5 text-primary" />}
          />
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Pomodoro onFocusComplete={onFocusComplete} />
          <SessionForm form={form} setForm={setForm} onSave={(s) => void onSaveSession(s)} />
        </div>

        <AchievementsRow unlocked={settings.unlockedAchievements} justUnlocked={justUnlocked} />

        <Heatmap sessions={sessions} />

        {settings.name ? <StudyCharts sessions={sessions} theme={settings.theme} /> : null}

        <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <GoalRing pct={goalPct} hours={monthHours} goal={settings.monthlyGoalHours} ring={ring} />
            <div className="flex-1">
              <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
                Goal tracker
              </p>
              <h2 className="font-display text-xl font-semibold">Monthly target hours</h2>
              <p className="mt-1 text-sm text-muted">
                Set a target. The ring fills as you log time this month.
              </p>
              <label className="mt-4 block max-w-xs text-xs font-medium text-muted">
                Hours
                <input
                  className="field mt-1.5"
                  type="number"
                  min={1}
                  max={400}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  onBlur={commitGoal}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Log</p>
              <h2 className="font-display text-xl font-semibold">Recent sessions</h2>
            </div>
            <p className="font-mono text-xs text-muted tabular-nums">{sessions.length} total</p>
          </div>
          {sessions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
              No sessions yet. Start the timer or log your first block.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {sessions.slice(0, 10).map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {s.subject}
                      <span className="text-muted"> · {s.topic}</span>
                    </p>
                    <p className="text-xs text-subtle">
                      {s.date} · {timeSlot(s.startTime, s.endTime)} · {hoursFmt(s.durationMinutes)} ·{" "}
                      {s.rating}/5
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void onDelete(s.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {settings.name ? (
          <ReportCards
            name={settings.name}
            sessions={sessions}
            goalHours={settings.monthlyGoalHours}
            streak={streak}
          />
        ) : null}
      </main>

      {renameOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setRenameOpen(false)}
          />
          <div className="glass relative w-full max-w-sm rounded-[1.5rem] p-6">
            <h2 className="font-display text-lg font-semibold">Your name</h2>
            <input
              className="field mt-4"
              value={renameValue}
              maxLength={32}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="glow"
                onClick={() => {
                  const n = renameValue.trim();
                  if (!n) return;
                  persist({ ...settings, name: n });
                  setRenameOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="glass rounded-[1.5rem] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-subtle">{hint}</p>
      {children}
    </div>
  );
}

function GoalRing({
  pct,
  hours,
  goal,
  ring,
}: {
  pct: number;
  hours: number;
  goal: number;
  ring: number;
}) {
  return (
    <div className="relative mx-auto grid size-36 place-items-center md:mx-0">
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" className="text-fg/10" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="url(#goalGlow)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={ring}
          strokeDashoffset={ring * (1 - pct / 100)}
          style={{ filter: "drop-shadow(0 0 6px rgba(0,245,255,0.45))" }}
        />
        <defs>
          <linearGradient id="goalGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#8a2be2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative text-center">
        <p className="font-mono text-2xl font-medium tabular-nums">{Math.round(pct)}%</p>
        <p className="text-[10px] text-muted">
          {hours.toFixed(1)}/{goal}h
        </p>
      </div>
    </div>
  );
}
