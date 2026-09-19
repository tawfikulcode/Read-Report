import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { heatLevel, heatmapDays, hoursFmt, type StudySession } from "@/lib/study";
import { cn } from "@/lib/utils";

export function Heatmap({ sessions }: { sessions: StudySession[] }) {
  const days = useMemo(() => heatmapDays(sessions), [sessions]);
  const [tip, setTip] = useState<{ date: string; hours: string; x: number; y: number } | null>(
    null,
  );

  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7);
    if (slice.length) weeks.push(slice);
  }

  const monthMarks: { index: number; label: string }[] = [];
  let lastMonth = "";
  weeks.forEach((week, i) => {
    const first = week[0];
    if (!first) return;
    const label = format(parseISO(first.date), "MMM");
    if (label !== lastMonth) {
      monthMarks.push({ index: i, label });
      lastMonth = label;
    }
  });

  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Calendar</p>
          <h2 className="font-display text-xl font-semibold">Twelve-month heatmap</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={cn("size-3 rounded-[3px]", `heat-${l}`)} />
          ))}
          More
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          <div
            className="mb-1.5 grid gap-[3px] pl-7"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
          >
            {monthMarks.map((m) => (
              <span
                key={`${m.label}-${m.index}`}
                className="text-[10px] text-subtle"
                style={{ gridColumnStart: m.index + 1 }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-[2px] text-[10px] text-subtle">
              <span>Sun</span>
              <span>Wed</span>
              <span>Sat</span>
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }, (_, di) => {
                    const cell = week[di];
                    if (!cell) return <span key={di} className="size-3" />;
                    const lvl = heatLevel(cell.hours);
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        className={cn("size-3 rounded-[3px]", `heat-${lvl}`)}
                        aria-label={`${cell.date}: ${hoursFmt(cell.minutes)}`}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTip({
                            date: cell.date,
                            hours: hoursFmt(cell.minutes),
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setTip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {tip ? (
        <div
          className="pointer-events-none fixed z-40 rounded-lg border border-border bg-bg-elevated px-2.5 py-1.5 text-xs shadow-xl"
          style={{ left: tip.x, top: tip.y - 8, transform: "translate(-50%, -100%)" }}
        >
          <span className="font-medium">{tip.date}</span>
          <span className="text-muted"> · {tip.hours}</span>
        </div>
      ) : null}
    </section>
  );
}
