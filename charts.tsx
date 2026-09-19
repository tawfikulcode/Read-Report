import { useEffect, useRef } from "react";
import type { StudySession, ThemeMode } from "@/lib/study";
import { SUBJECT_COLORS, subjectTotals, weekBuckets } from "@/lib/study";

export function StudyCharts({
  sessions,
  theme,
}: {
  sessions: StudySession[];
  theme: ThemeMode;
}) {
  const barRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let bar: { destroy: () => void } | undefined;
    let pie: { destroy: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const Chart = (await import("chart.js/auto")).default;
      if (cancelled) return;
      const tick = theme === "dark" ? "#8b9cb3" : "#5a6b80";
      const grid = theme === "dark" ? "rgba(0,245,255,0.08)" : "rgba(8,145,178,0.12)";
      const week = weekBuckets(sessions);
      const subjects = subjectTotals(sessions);

      if (barRef.current) {
        bar = new Chart(barRef.current, {
          type: "bar",
          data: {
            labels: week.map((d) => d.label),
            datasets: [
              {
                label: "Hours",
                data: week.map((d) => d.hours),
                backgroundColor: "rgba(0, 245, 255, 0.72)",
                borderColor: "#00f5ff",
                borderWidth: 1,
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { ticks: { color: tick }, grid: { display: false } },
              y: {
                beginAtZero: true,
                ticks: { color: tick },
                grid: { color: grid },
              },
            },
          },
        });
      }

      if (pieRef.current) {
        pie = new Chart(pieRef.current, {
          type: "pie",
          data: {
            labels: subjects.length ? subjects.map((s) => s.subject) : ["No data"],
            datasets: [
              {
                data: subjects.length ? subjects.map((s) => s.hours) : [1],
                backgroundColor: subjects.length
                  ? subjects.map((_, i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length])
                  : ["rgba(139,156,179,0.35)"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: tick, boxWidth: 10, font: { size: 11 } },
              },
            },
          },
        });
      }
    })();

    return () => {
      cancelled = true;
      bar?.destroy();
      pie?.destroy();
    };
  }, [sessions, theme]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Weekly</p>
        <h2 className="mb-4 font-display text-xl font-semibold">Hours by day</h2>
        <div className="h-56">
          <canvas ref={barRef} />
        </div>
      </section>
      <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Subjects</p>
        <h2 className="mb-4 font-display text-xl font-semibold">Time split</h2>
        <div className="h-56">
          <canvas ref={pieRef} />
        </div>
      </section>
    </div>
  );
}
