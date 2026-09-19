import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  durationMinutes,
  localDateStr,
  SUBJECT_SUGGESTIONS,
  type StudySession,
} from "@/lib/study";
import { cn } from "@/lib/utils";

export type FormState = {
  subject: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  rating: number;
  notes: string;
};

export function defaultForm(): FormState {
  const now = new Date();
  const end = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const startDate = new Date(now.getTime() - 25 * 60 * 1000);
  const start = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
  return {
    subject: "",
    topic: "",
    date: localDateStr(now),
    startTime: start,
    endTime: end,
    rating: 4,
    notes: "",
  };
}

export function SessionForm({
  form,
  setForm,
  onSave,
}: {
  form: FormState;
  setForm: (next: FormState) => void;
  onSave: (session: StudySession) => void;
}) {
  const [error, setError] = useState("");
  const mins = durationMinutes(form.startTime, form.endTime);

  const submit = (e: FormEvent) => {
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
    if (mins > 16 * 60) {
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
      notes: form.notes.trim(),
    });
  };

  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6" data-reveal>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Tracker</p>
      <h2 className="mb-5 font-display text-xl font-semibold">Log a session</h2>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-xs font-medium text-muted">
          Subject
          <input
            className="field mt-1.5"
            list="subject-list"
            placeholder="Computer Science"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <datalist id="subject-list">
            {SUBJECT_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="text-xs font-medium text-muted">
          Topic
          <input
            className="field mt-1.5"
            placeholder="Binary trees"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
        </label>
        <label className="text-xs font-medium text-muted">
          Date
          <input
            className="field mt-1.5"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-muted">
            Start
            <input
              className="field mt-1.5"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </label>
          <label className="text-xs font-medium text-muted">
            End
            <input
              className="field mt-1.5"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </label>
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs font-medium text-muted">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="grid size-11 place-items-center rounded-xl hover:bg-surface"
                onClick={() => setForm({ ...form, rating: n })}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
              >
                <Star
                  className={cn(
                    "size-5",
                    n <= form.rating ? "fill-primary text-primary" : "text-subtle",
                  )}
                />
              </button>
            ))}
            <span className="ml-2 self-center font-mono text-xs text-muted tabular-nums">
              {mins > 0 ? `${mins} min` : "—"}
            </span>
          </div>
        </div>
        <label className="text-xs font-medium text-muted sm:col-span-2">
          Notes
          <textarea
            className="field mt-1.5"
            maxLength={500}
            placeholder="What clicked, what to revisit…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        {error ? <p className="text-sm text-red-400 sm:col-span-2">{error}</p> : null}
        <div className="sm:col-span-2">
          <Button type="submit" variant="glow" className="w-full sm:w-auto">
            Save session
          </Button>
        </div>
      </form>
    </section>
  );
}
