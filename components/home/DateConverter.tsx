"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import { CalendarDays, ArrowLeftRight, ChevronRight, ChevronLeft, Copy, Check } from "lucide-react";
import { JALALI_MONTHS } from "@/lib/jalali";
import { toFa } from "@/lib/format";

type Mode = "g2j" | "j2g";
type Ymd = { y: number; m: number; d: number };

const G_MONTHS = ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"];
const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"]; // شنبه تا جمعه
const WEEKDAY_NAMES = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

const pad = (n: number) => String(n).padStart(2, "0");
/** نمایش به شکل 16-08-2018 */
const fmt = ({ y, m, d }: Ymd) => `${pad(d)}-${pad(m)}-${y}`;

const gMonthLength = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** تاریخ (در تقویم انتخاب‌شده) → Date میلادی در نیمه‌شب UTC */
function toDate(v: Ymd, jalali: boolean): Date {
  if (!jalali) return new Date(Date.UTC(v.y, v.m - 1, v.d));
  const { gy, gm, gd } = toGregorian(v.y, v.m, v.d);
  return new Date(Date.UTC(gy, gm - 1, gd));
}

function convert(v: Ymd, mode: Mode): Ymd {
  if (mode === "g2j") {
    const { jy, jm, jd } = toJalaali(v.y, v.m, v.d);
    return { y: jy, m: jm, d: jd };
  }
  const { gy, gm, gd } = toGregorian(v.y, v.m, v.d);
  return { y: gy, m: gm, d: gd };
}

function today(mode: Mode): Ymd {
  const now = new Date();
  const g = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  if (mode === "g2j") return g;
  const { jy, jm, jd } = toJalaali(g.y, g.m, g.d);
  return { y: jy, m: jm, d: jd };
}

export default function DateConverter() {
  const [mode, setMode] = useState<Mode>("g2j");
  const [value, setValue] = useState<Ymd>(() => today("g2j"));
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const jalaliInput = mode === "j2g";
  const result = useMemo(() => convert(value, mode), [value, mode]);
  const weekday = WEEKDAY_NAMES[toDate(value, jalaliInput).getUTCDay()];
  const monthsIn = jalaliInput ? JALALI_MONTHS : G_MONTHS;
  const monthsOut = jalaliInput ? G_MONTHS : JALALI_MONTHS;

  const swap = () => {
    const next: Mode = mode === "g2j" ? "j2g" : "g2j";
    setMode(next);
    setValue(result); // همان روز، در تقویم دیگر
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => boxRef.current && !boxRef.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fmt(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="glass noise relative mx-auto max-w-4xl overflow-visible rounded-[2rem] p-5 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      {/* انتخاب جهت تبدیل */}
      <div className="relative mx-auto flex w-full max-w-md rounded-full border border-gold-500/20 bg-night-950/50 p-1 text-sm">
        {(["g2j", "j2g"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => m !== mode && swap()}
            className={`flex-1 rounded-full px-4 py-2.5 font-bold transition-all duration-300 ${
              mode === m ? "bg-gradient-to-l from-gold-300 via-gold-500 to-gold-400 text-night-950 shadow-gold" : "text-cream/70 hover:text-cream"
            }`}
          >
            {m === "g2j" ? "میلادی به شمسی" : "شمسی به میلادی"}
          </button>
        ))}
      </div>

      <div className="relative mt-8 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        {/* ورودی */}
        <div ref={boxRef} className="relative">
          <span className="mb-2 block text-xs font-medium text-gold-400/90">تاریخ {jalaliInput ? "شمسی" : "میلادی"}</span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-night-950/50 px-4 py-4 text-start transition ${
              open ? "border-gold-500/70 bg-gold-500/[0.05]" : "border-gold-500/25 hover:border-gold-500/50"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/10 text-gold-300"><CalendarDays className="h-5 w-5" /></span>
              <span>
                <span className="block text-lg font-extrabold tabular-nums text-cream" dir="ltr">{fmt(value)}</span>
                <span className="block text-xs text-muted">{weekday}، {toFa(value.d)} {monthsIn[value.m - 1]} {toFa(value.y)}</span>
              </span>
            </span>
            <ChevronLeft className={`h-4 w-4 text-gold-500/70 transition-transform ${open ? "-rotate-90" : ""}`} />
          </button>

          {open && (
            <Calendar
              value={value}
              jalali={jalaliInput}
              onChange={(v) => {
                setValue(v);
                setOpen(false);
              }}
            />
          )}
        </div>

        {/* دکمه‌ی جابه‌جایی */}
        <div className="flex items-center justify-center lg:pt-6">
          <button
            type="button"
            onClick={swap}
            aria-label="جابه‌جایی جهت تبدیل"
            className="group grid h-12 w-12 place-items-center rounded-full border border-gold-500/40 bg-night-950/60 text-gold-300 transition hover:border-gold-500 hover:bg-gold-500/10"
          >
            <ArrowLeftRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180 lg:rotate-0 max-lg:rotate-90" />
          </button>
        </div>

        {/* خروجی */}
        <div>
          <span className="mb-2 block text-xs font-medium text-gold-400/90">تاریخ {jalaliInput ? "میلادی" : "شمسی"}</span>
          <div className="relative flex h-[calc(100%-1.5rem)] min-h-[5.5rem] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-gold-500/40 bg-gradient-to-l from-gold-500/[0.12] to-gold-500/[0.03] px-4 py-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold-500/20 blur-2xl" />
            <span>
              <span className="gold-text block text-3xl font-extrabold tabular-nums sm:text-4xl" dir="ltr">{fmt(result)}</span>
              <span className="mt-1 block text-xs text-cream/70">{weekday}، {toFa(result.d)} {monthsOut[result.m - 1]} {toFa(result.y)}</span>
            </span>
            <button
              type="button"
              onClick={copy}
              aria-label="کپی تاریخ"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/30 text-cream/80 transition hover:border-gold-500 hover:text-gold-300"
            >
              {copied ? <Check className="h-4 w-4 text-gold-300" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <p className="relative mt-6 text-center text-xs leading-6 text-muted">
        قالب نمایش: روز-ماه-سال (مثلاً <span dir="ltr">25-04-1376</span>). برای ثبت سفارش تحلیل، تاریخ تولد شمسی یا میلادی هر دو پذیرفته می‌شود.
      </p>
    </div>
  );
}

/* ───────────────────────── تقویم ───────────────────────── */

function Calendar({ value, jalali, onChange }: { value: Ymd; jalali: boolean; onChange: (v: Ymd) => void }) {
  const [view, setView] = useState({ y: value.y, m: value.m });
  const months = jalali ? JALALI_MONTHS : G_MONTHS;
  const years = useMemo(() => {
    const now = today(jalali ? "j2g" : "g2j").y;
    const list: number[] = [];
    for (let y = now + 10; y >= now - 120; y--) list.push(y);
    return list;
  }, [jalali]);

  const length = jalali ? jalaaliMonthLength(view.y, view.m) : gMonthLength(view.y, view.m);
  // ستون شروع ماه در شبکه‌ای که از شنبه آغاز می‌شود
  const first = toDate({ y: view.y, m: view.m, d: 1 }, jalali).getUTCDay(); // 0 = یکشنبه
  const offset = (first + 1) % 7; // شنبه = 0
  const t = today(jalali ? "j2g" : "g2j");

  const step = (dir: 1 | -1) =>
    setView(({ y, m }) => {
      const nm = m + dir;
      if (nm < 1) return { y: y - 1, m: 12 };
      if (nm > 12) return { y: y + 1, m: 1 };
      return { y, m: nm };
    });

  const cells = Array.from({ length: offset + length }, (_, i) => (i < offset ? null : i - offset + 1));

  return (
    <div
      role="dialog"
      aria-label="انتخاب تاریخ"
      className="absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-gold-500/30 bg-night-900/95 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] backdrop-blur-2xl animate-fade-up [animation-duration:.35s]"
    >
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="ماه قبل" className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/20 text-cream/80 transition hover:border-gold-500/60 hover:text-gold-300">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <select value={view.m} onChange={(e) => setView((v) => ({ ...v, m: +e.target.value }))} className="input !w-auto !py-1.5 !pe-3 !ps-3 text-sm" aria-label="ماه">
            {months.map((name, i) => <option key={name} value={i + 1} className="bg-night-900">{name}</option>)}
          </select>
          <select value={view.y} onChange={(e) => setView((v) => ({ ...v, y: +e.target.value }))} className="input !w-auto !py-1.5 !pe-3 !ps-3 text-sm tabular-nums" aria-label="سال" dir="ltr">
            {years.map((y) => <option key={y} value={y} className="bg-night-900">{y}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => step(1)} aria-label="ماه بعد" className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/20 text-cream/80 transition hover:border-gold-500/60 hover:text-gold-300">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-gold-500/80">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const selected = d === value.d && view.m === value.m && view.y === value.y;
          const isToday = d === t.d && view.m === t.m && view.y === t.y;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ y: view.y, m: view.m, d })}
              className={`relative h-9 rounded-xl text-sm tabular-nums transition ${
                selected
                  ? "bg-gradient-to-br from-gold-300 to-gold-500 font-extrabold text-night-950 shadow-gold"
                  : "text-cream/85 hover:bg-gold-500/15 hover:text-gold-200"
              }`}
            >
              {jalali ? toFa(d) : d}
              {isToday && !selected && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-400" />}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gold-500/10 pt-3 text-xs">
        <button type="button" onClick={() => { setView({ y: t.y, m: t.m }); onChange(t); }} className="text-gold-300 transition hover:text-gold-200">
          امروز
        </button>
        <span className="text-muted">{jalali ? "تقویم هجری شمسی" : "تقویم میلادی"}</span>
      </div>
    </div>
  );
}
