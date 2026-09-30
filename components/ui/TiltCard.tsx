"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

/**
 * TiltCard — کارت با چرخش سه‌بعدی و نور اسپات‌لایت دنبال‌کننده‌ی ماوس
 */
export default function TiltCard({
  children,
  className = "",
  intensity = 8,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * intensity;
    const ry = (px - 0.5) * intensity;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative [transform-style:preserve-3d] transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{
        transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
      }}
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(212,175,55,0.16), transparent 45%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
