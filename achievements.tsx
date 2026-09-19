import gsap from "gsap";
import { Award, BookOpen, Flame, Moon, Timer } from "lucide-react";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "@/lib/study";
import { cn } from "@/lib/utils";

const ICONS = {
  "first-session": BookOpen,
  "seven-streak": Flame,
  "fifty-hours": Timer,
  "night-owl": Moon,
  "perfect-week": Award,
} as const;

export function AchievementsRow({
  unlocked,
  justUnlocked,
}: {
  unlocked: string[];
  justUnlocked: string | null;
}) {
  const set = new Set(unlocked);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!justUnlocked || !rowRef.current) return;
    const el = rowRef.current.querySelector(`[data-ach="${justUnlocked}"]`);
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 0.86 },
        { scale: 1, duration: 0.55, ease: "back.out(2.2)" },
      );
    });
    return () => ctx.revert();
  }, [justUnlocked]);

  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Gamification</p>
      <h2 className="mb-4 font-display text-xl font-semibold">Achievements</h2>
      <div ref={rowRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACHIEVEMENTS.map((a) => {
          const Icon = ICONS[a.id as keyof typeof ICONS] ?? Award;
          const on = set.has(a.id);
          return (
            <div
              key={a.id}
              data-ach={a.id}
              className={cn(
                "rounded-2xl border px-3 py-4 text-center",
                on
                  ? "border-primary/35 bg-primary/10 shadow-[0_0_24px_rgba(0,245,255,0.12)]"
                  : "border-border bg-bg/30 opacity-55",
              )}
            >
              <Icon className={cn("mx-auto mb-2 size-5", on ? "text-primary" : "text-muted")} />
              <p className="text-sm font-medium">{a.title}</p>
              <p className="mt-1 text-[11px] leading-snug text-subtle">{a.hint}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
