import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rot: number;
  vr: number;
};

const COLORS = ["#00f5ff", "#8a2be2", "#67e8f9", "#c084fc", "#ffffff", "#2dd4bf"];

export function ConfettiBurst({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    const pieces: Piece[] = Array.from({ length: 130 }, () => ({
      x: width * 0.5 + (Math.random() - 0.5) * 80,
      y: height * 0.28,
      vx: (Math.random() - 0.5) * 18,
      vy: -6 - Math.random() * 12,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#00f5ff",
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
    }));

    let alive = true;
    const start = performance.now();

    const frame = (t: number) => {
      if (!alive) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of pieces) {
        p.vy += 0.32;
        p.vx *= 0.995;
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

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-hidden="true"
    />
  );
}
