import gsap from "gsap";
import { useEffect, useRef } from "react";
import type { ThemeMode } from "@/lib/study";

export function Particles({ theme }: { theme: ThemeMode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const dots = root.querySelectorAll<HTMLElement>("[data-particle]");
    const tweens = Array.from(dots).map((el, i) =>
      gsap.to(el, {
        x: (i % 2 === 0 ? 1 : -1) * (40 + (i % 7) * 12),
        y: (i % 3 === 0 ? -1 : 1) * (50 + (i % 11) * 8),
        duration: 10 + (i % 9),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: (i % 5) * 0.15,
      }),
    );
    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [theme]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: 64 }, (_, i) => (
        <span
          key={i}
          data-particle
          className="absolute rounded-full"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 29) % 100}%`,
            width: 2 + (i % 5),
            height: 2 + (i % 5),
            background: i % 3 === 0 ? "var(--color-accent)" : "var(--color-primary)",
            opacity: 0.2 + (i % 5) * 0.08,
            boxShadow:
              i % 4 === 0
                ? "0 0 10px color-mix(in srgb, var(--color-primary) 70%, transparent)"
                : "none",
          }}
        />
      ))}
    </div>
  );
}
