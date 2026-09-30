const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const C = 220;
const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [r2(C + r * Math.cos(a)), r2(C + r * Math.sin(a))] as const;
};

/** چرخ زودیاک تزئینی (SVG) — با CSS می‌چرخد */
export default function ZodiacWheel({ className = "", glyphs = true }: { className?: string; glyphs?: boolean }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const sectors = Array.from({ length: 12 }, (_, i) => i * 30);
  const star = Array.from({ length: 8 }, (_, i) => pt(96, i * 45 - 90));

  return (
    <svg viewBox="0 0 440 440" className={className} fill="none" stroke="currentColor" aria-hidden>
      <circle cx={C} cy={C} r="216" strokeWidth="0.8" opacity="0.7" />
      <circle cx={C} cy={C} r="198" strokeWidth="0.5" opacity="0.5" />
      <circle cx={C} cy={C} r="150" strokeWidth="0.6" opacity="0.6" />
      <circle cx={C} cy={C} r="112" strokeWidth="0.4" opacity="0.5" strokeDasharray="2 5" />
      <circle cx={C} cy={C} r="30" strokeWidth="0.6" opacity="0.6" />
      {ticks.map((d) => {
        const long = d % 30 === 0;
        const [x1, y1] = pt(216, d);
        const [x2, y2] = pt(long ? 198 : 208, d);
        return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={long ? 1 : 0.5} opacity={long ? 0.8 : 0.45} />;
      })}
      {sectors.map((d) => {
        const [x1, y1] = pt(150, d);
        const [x2, y2] = pt(198, d);
        return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.5" opacity="0.5" />;
      })}
      {glyphs &&
        SIGNS.map((s, i) => {
          const [x, y] = pt(174, i * 30 - 75);
          return (
            <text
              key={s}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="17"
              fill="currentColor"
              stroke="none"
              opacity="0.9"
              style={{ fontFamily: "'Segoe UI Symbol','Apple Symbols','Noto Sans Symbols','Noto Sans Symbols 2',serif" }}
            >
              {s}
            </text>
          );
        })}
      <polygon points={star.filter((_, i) => i % 2 === 0).map((p) => p.join(",")).join(" ")} strokeWidth="0.6" opacity="0.55" />
      <polygon points={star.filter((_, i) => i % 2 === 1).map((p) => p.join(",")).join(" ")} strokeWidth="0.6" opacity="0.55" />
      {star.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="currentColor" stroke="none" opacity="0.8" />
      ))}
      <circle cx={C} cy={C} r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}
