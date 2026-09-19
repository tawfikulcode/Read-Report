import { format, getDaysInMonth, parseISO, startOfMonth } from "date-fns";
import { Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  bestStreak,
  colorForSubject,
  currentStreak,
  decimalHours,
  getInitials,
  heatLevel,
  hoursFmt,
  levelFromXp,
  localDateStr,
  minutesInMonth,
  minutesOnDate,
  monthLabel,
  quoteForDate,
  subjectTotals,
  timeSlot,
  totalMinutes,
  xpFromSessions,
  type StudySession,
} from "@/lib/study";

const CARD_BG = "#0b1020";
const CARD_FG = "#e8f4ff";
const MUTED = "#8b9cb3";
const CYAN = "#00f5ff";
const VIOLET = "#8a2be2";
const LINE = "rgba(0,245,255,0.16)";

function drawPie(
  canvas: HTMLCanvasElement,
  slices: { value: number; color: string }[],
) {
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
    const da = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + da);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    a += da;
  }
}

export function ReportCards({
  name,
  sessions,
  goalHours,
  streak,
}: {
  name: string;
  sessions: StudySession[];
  goalHours: number;
  streak: number;
}) {
  const dailyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState<"daily" | "monthly" | null>(null);

  const today = localDateStr();
  const now = new Date();
  const todaySessions = sessions.filter((s) => s.date === today);
  const monthMins = minutesInMonth(sessions, now.getFullYear(), now.getMonth());
  const monthHours = decimalHours(monthMins);
  const dayNum = now.getDate();
  const avgPerDay = dayNum > 0 ? monthHours / dayNum : 0;
  const goalPct = goalHours > 0 ? Math.min(999, (monthHours / goalHours) * 100) : 0;
  const xp = xpFromSessions(sessions);
  const { level } = levelFromXp(xp);
  const tops = subjectTotals(sessions).slice(0, 5);
  const quote = quoteForDate(today);
  const initials = getInitials(name);

  const monthKey = format(now, "yyyy-MM");
  const monthCells = useMemo(() => {
    const start = startOfMonth(now);
    const count = getDaysInMonth(now);
    const pad = start.getDay();
    const cells: { date: string | null; hours: number }[] = [];
    for (let i = 0; i < pad; i++) cells.push({ date: null, hours: 0 });
    for (let d = 1; d <= count; d++) {
      const date = format(
        new Date(now.getFullYear(), now.getMonth(), d),
        "yyyy-MM-dd",
      );
      cells.push({ date, hours: decimalHours(minutesOnDate(sessions, date)) });
    }
    return cells;
  }, [sessions, monthKey]);

  useEffect(() => {
    if (pieRef.current) {
      drawPie(
        pieRef.current,
        tops.length
          ? tops.map((t) => ({ value: t.minutes, color: colorForSubject(t.subject) }))
          : [],
      );
    }
  }, [tops]);

  const capture = async (kind: "daily" | "monthly") => {
    const el = kind === "daily" ? dailyRef.current : monthlyRef.current;
    if (!el) return;
    setBusy(kind);
    try {
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: CARD_BG,
        useCORS: true,
        logging: false,
      });
      const a = document.createElement("a");
      const stamp =
        kind === "daily" ? today : format(now, "yyyy-MM");
      a.href = canvas.toDataURL("image/png");
      a.download = `StudyReport-${kind === "daily" ? "Daily" : "Monthly"}-${stamp}.png`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  };

  const cellHex = (hours: number) => {
    const lvl = heatLevel(hours);
    if (lvl === 0) return "#161b2e";
    if (lvl === 1) return "#0e4a55";
    if (lvl === 2) return "#128a96";
    if (lvl === 3) return "#00d5de";
    return "#00f5ff";
  };

  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Export</p>
      <h2 className="mb-2 font-display text-xl font-semibold">Report cards</h2>
      <p className="mb-5 max-w-xl text-sm text-muted">
        Snapshot today or this month as a shareable PNG — signed with your name.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="glow" onClick={() => void capture("daily")} disabled={busy !== null}>
          <Download />
          {busy === "daily" ? "Rendering…" : "Download Daily PNG"}
        </Button>
        <Button
          variant="outline"
          onClick={() => void capture("monthly")}
          disabled={busy !== null}
        >
          <Download />
          {busy === "monthly" ? "Rendering…" : "Download Monthly PNG"}
        </Button>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -12000,
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={dailyRef}
          style={{
            width: 840,
            background: CARD_BG,
            color: CARD_FG,
            fontFamily: "Outfit, sans-serif",
            padding: 40,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})`,
              marginBottom: 28,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div
                style={{
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
                  fontSize: 20,
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 13, letterSpacing: "0.18em", color: CYAN, textTransform: "uppercase" }}>
                  Daily report
                </div>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 700 }}>
                  {name || "Student"}
                </div>
                <div style={{ color: MUTED, marginTop: 2 }}>
                  {format(parseISO(today), "EEEE, d MMMM yyyy")}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right", color: MUTED, fontSize: 13 }}>StudyReport AI</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 28 }}>
            {[
              { k: "Hours today", v: hoursFmt(minutesOnDate(sessions, today)) },
              { k: "Streak", v: `${streak} day${streak === 1 ? "" : "s"}` },
              { k: "Level", v: `Lv ${level}` },
            ].map((s) => (
              <div
                key={s.k}
                style={{
                  background: "#12182a",
                  border: `1px solid ${LINE}`,
                  borderRadius: 16,
                  padding: "16px 18px",
                }}
              >
                <div style={{ color: MUTED, fontSize: 12 }}>{s.k}</div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 22, marginTop: 6, color: CYAN }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          <table
            style={{
              width: "100%",
              marginTop: 28,
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {["Subject", "Topic", "Time slot", "Duration"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      color: MUTED,
                      fontWeight: 500,
                      padding: "10px 8px",
                      borderBottom: `1px solid ${LINE}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todaySessions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 16, color: MUTED }}>
                    No sessions logged today.
                  </td>
                </tr>
              ) : (
                todaySessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #162033" }}>{s.subject}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #162033" }}>{s.topic}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #162033" }}>
                      {timeSlot(s.startTime, s.endTime)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #162033" }}>
                      {hoursFmt(s.durationMinutes)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 36,
              paddingTop: 18,
              borderTop: `1px solid ${LINE}`,
              color: MUTED,
              fontStyle: "italic",
              fontSize: 14,
            }}
          >
            “{quote}”
          </div>
        </div>

        <div
          ref={monthlyRef}
          style={{
            width: 960,
            background: CARD_BG,
            color: CARD_FG,
            fontFamily: "Outfit, sans-serif",
            padding: 40,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})`,
              marginBottom: 24,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 13, letterSpacing: "0.18em", color: CYAN, textTransform: "uppercase" }}>
                Monthly report
              </div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 30, fontWeight: 700 }}>
                {name || "Student"}
              </div>
              <div style={{ color: MUTED, marginTop: 4 }}>{monthLabel(now)}</div>
            </div>
            <div style={{ color: MUTED, fontSize: 13 }}>Generated by StudyReport AI</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24 }}>
            {[
              { k: "Total hours", v: hoursFmt(monthMins) },
              { k: "Avg / day", v: `${avgPerDay.toFixed(1)}h` },
              { k: "Goal", v: `${Math.round(goalPct)}%` },
              { k: "Best streak", v: `${bestStreak(sessions)}d` },
            ].map((s) => (
              <div
                key={s.k}
                style={{
                  background: "#12182a",
                  border: `1px solid ${LINE}`,
                  borderRadius: 16,
                  padding: "14px 16px",
                }}
              >
                <div style={{ color: MUTED, fontSize: 12 }}>{s.k}</div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 20, marginTop: 6, color: CYAN }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginTop: 28 }}>
            <div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>Subject mix</div>
              <canvas ref={pieRef} width={240} height={240} style={{ width: 240, height: 240 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>Top 5 subjects</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Subject", "Hours"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          color: MUTED,
                          fontWeight: 500,
                          padding: "8px 6px",
                          borderBottom: `1px solid ${LINE}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tops.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ padding: 12, color: MUTED }}>
                        No sessions this month yet.
                      </td>
                    </tr>
                  ) : (
                    tops.map((t) => (
                      <tr key={t.subject}>
                        <td style={{ padding: "9px 6px", borderBottom: "1px solid #162033" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: 99,
                              background: colorForSubject(t.subject),
                              marginRight: 8,
                            }}
                          />
                          {t.subject}
                        </td>
                        <td style={{ padding: "9px 6px", borderBottom: "1px solid #162033" }}>
                          {t.hours.toFixed(1)}h
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: 18, fontSize: 13, color: MUTED, marginBottom: 8 }}>Mini heatmap</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 18px)", gap: 4 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={`${d}-${i}`} style={{ fontSize: 10, color: MUTED, textAlign: "center" }}>
                    {d}
                  </div>
                ))}
                {monthCells.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: c.date ? cellHex(c.hours) : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, color: MUTED, fontSize: 12, letterSpacing: "0.08em" }}>
            GENERATED BY STUDYREPORT AI
          </div>
        </div>
      </div>
    </section>
  );
}
