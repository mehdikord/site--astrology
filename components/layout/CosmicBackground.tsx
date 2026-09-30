/** پس‌زمینه‌ی ثابت کهکشانی سایت — گرادیان + ستاره‌های ریز SVG (قطعی و سبک) */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CosmicBackground() {
  const rnd = mulberry(1404);
  const stars = Array.from({ length: 160 }, (_, i) => ({
    x: Math.round(rnd() * 1600 * 10) / 10,
    y: Math.round(rnd() * 900 * 10) / 10,
    r: Math.round((0.4 + rnd() * 1.1) * 100) / 100,
    o: Math.round((0.25 + rnd() * 0.6) * 100) / 100,
    tw: i % 6 === 0,
    d: Math.round(rnd() * 4 * 10) / 10,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 600px at 85% -5%, rgba(212,175,55,0.09), transparent 60%), radial-gradient(900px 600px at 5% 105%, rgba(88,70,160,0.14), transparent 60%), radial-gradient(700px 500px at 50% 50%, rgba(20,24,48,0.5), transparent 70%), #06070d",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#f5dc8f"
            opacity={s.o}
            className={s.tw ? "animate-twinkle" : undefined}
            style={s.tw ? { animationDelay: `${s.d}s`, transformOrigin: `${s.x}px ${s.y}px` } : undefined}
          />
        ))}
      </svg>
    </div>
  );
}
