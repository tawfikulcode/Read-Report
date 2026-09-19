import gsap from "gsap";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { playBeep } from "@/lib/study";
import { cn } from "@/lib/utils";

const FOCUS_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;
const RADIUS = 92;
const CIRC = 2 * Math.PI * RADIUS;

type Mode = "focus" | "break";

export function Pomodoro({
  onFocusComplete,
}: {
  onFocusComplete: (payload: { startTime: string; endTime: string }) => void;
}) {
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(FOCUS_SEC);
  const [running, setRunning] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const startedAt = useRef<number | null>(null);
  const finishing = useRef(false);

  const total = mode === "focus" ? FOCUS_SEC : BREAK_SEC;
  const progress = 1 - remaining / total;

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    gsap.to(el, {
      strokeDashoffset: CIRC * (1 - progress),
      duration: 0.45,
      ease: "power2.out",
    });
  }, [progress]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining !== 0 || !startedAt.current || finishing.current) return;
    finishing.current = true;
    playBeep();
    if (mode === "focus") {
      const end = new Date();
      const start = new Date(end.getTime() - FOCUS_SEC * 1000);
      const fmt = (d: Date) =>
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      onFocusComplete({ startTime: fmt(start), endTime: fmt(end) });
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
  }, [remaining, mode, onFocusComplete]);

  const label = useMemo(() => {
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

  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Pomodoro</p>
          <h2 className="font-display text-xl font-semibold">Focus clock</h2>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            mode === "focus"
              ? "bg-primary/15 text-primary"
              : "bg-accent/20 text-fg",
          )}
        >
          {mode === "focus" ? "25 min focus" : "5 min break"}
        </span>
      </div>

      <div className="relative mx-auto grid size-[232px] place-items-center">
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 220 220">
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-fg/10"
            strokeWidth="10"
          />
          <circle
            ref={ringRef}
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            stroke="url(#pomodoroGlow)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            style={{ filter: "drop-shadow(0 0 8px rgba(0,245,255,0.55))" }}
          />
          <defs>
            <linearGradient id="pomodoroGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="100%" stopColor="#8a2be2" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative text-center">
          <div className="font-mono text-[2.7rem] font-medium tabular-nums leading-none tracking-tight">
            {label}
          </div>
          <p className="mt-2 text-xs tracking-wide text-muted uppercase">
            {running ? "In session" : remaining === total ? "Ready" : "Paused"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Button variant="glow" onClick={toggle} className="min-w-32">
          {running ? <Pause /> : <Play />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" size="icon" onClick={reset} aria-label="Reset timer">
          <RotateCcw />
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-subtle">
        When focus ends, start and end times fill the log automatically.
      </p>
    </section>
  );
}
