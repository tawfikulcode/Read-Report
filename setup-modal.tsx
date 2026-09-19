import gsap from "gsap";
import { BookOpen } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function SetupModal({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.from(rootRef.current, { opacity: 0, duration: reduced ? 0 : 0.45 });
      gsap.from(cardRef.current, {
        y: 28,
        scale: 0.96,
        opacity: 0,
        duration: reduced ? 0 : 0.7,
        ease: "power3.out",
      });
    });
    inputRef.current?.focus();
    return () => ctx.revert();
  }, []);

  const submit = () => {
    const next = name.trim();
    if (next.length < 1) return;
    onSave(next.slice(0, 32));
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-md" />
      <div
        ref={cardRef}
        className="glass relative w-full max-w-md rounded-[1.75rem] p-7 sm:p-9"
      >
        <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <BookOpen className="size-6" />
        </div>
        <p className="mb-2 text-xs font-medium tracking-[0.22em] text-primary uppercase">
          StudyReport AI
        </p>
        <h1 id="welcome-title" className="font-display text-3xl font-semibold tracking-tight">
          Enter your name
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Reports, streaks, and XP will be signed with this name. You can change it later
          from your avatar.
        </p>
        <form
          className="mt-7 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="block text-xs font-medium tracking-wide text-muted uppercase">
            Name
            <input
              ref={inputRef}
              className="field mt-2"
              maxLength={32}
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button type="submit" variant="glow" size="lg" className="w-full" disabled={!name.trim()}>
            Begin
          </Button>
        </form>
      </div>
    </div>
  );
}
