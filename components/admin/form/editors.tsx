"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown, ArrowUp, ChevronDown, FileText, Heading2, Heading3, List, Pilcrow, Plus, Quote, Trash2, Upload, X,
} from "lucide-react";
import { JalaliDateInput } from "@/components/admin/form";
import { toFa } from "@/lib/format";

let uid = 0;
const nextKey = () => ++uid;

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Controls({ index, count, onMove, onRemove, label = "" }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; label?: string }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className="adm-icon-btn h-7 w-7 disabled:opacity-25" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`انتقال ${label} به بالا`}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="adm-icon-btn h-7 w-7 disabled:opacity-25" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`انتقال ${label} به پایین`}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="adm-icon-btn h-7 w-7 hover:!bg-rose-500/10 hover:!text-rose-300" onClick={onRemove} aria-label={`حذف ${label}`}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── تاریخ و ساعت ───

/** تاریخ شمسی + ساعت؛ در سرور با formDateTime(formData, name) خوانده می‌شود */
export function JalaliDateTimeInput({
  name,
  defaultValue = "",
  error,
  maxYear,
  minYear,
}: {
  name: string;
  defaultValue?: string; // 1405/07/21 14:30
  error?: string;
  maxYear: number;
  minYear?: number;
}) {
  const [date, time] = defaultValue.split(" ");
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_7.5rem]">
      <JalaliDateInput name={`${name}__date`} defaultValue={date ?? ""} error={error} maxYear={maxYear} minYear={minYear} />
      <input type="time" name={`${name}__time`} defaultValue={time ?? ""} dir="ltr" aria-label="ساعت" className="adm-input h-fit text-center" />
    </div>
  );
}

// ─── فایل ───

export function FileInput({ name, current, accept, hint, error }: { name: string; current?: string | null; accept: string; hint?: string; error?: string }) {
  const [removed, setRemoved] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div>
      <input type="hidden" name={`${name}_remove`} value={removed ? "1" : ""} />
      {current && !removed && !picked && (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-night-950/50 px-3.5 py-2.5 text-sm">
          <a href={current} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-gold-300 hover:text-gold-200">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">مشاهده‌ی فایل فعلی</span>
          </a>
          <button type="button" onClick={() => setRemoved(true)} className="adm-icon-btn h-7 w-7 hover:!text-rose-300" aria-label="حذف فایل">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <label className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm transition ${error ? "border-rose-500/60" : "border-white/15 hover:border-gold-500/50"}`}>
        <Upload className="h-4 w-4 shrink-0 text-gold-500" />
        <span className="min-w-0 flex-1 truncate text-cream/70">{picked ?? (current && !removed ? "جایگزینی فایل..." : "انتخاب فایل...")}</span>
        <input type="file" name={name} accept={accept} className="sr-only" onChange={(e) => setPicked(e.target.files?.[0]?.name ?? null)} />
      </label>
      {error ? <p className="adm-error">{error}</p> : hint ? <p className="adm-hint">{hint}</p> : null}
    </div>
  );
}

// ─── سرفصل‌ها و درس‌های دوره ───

export type LessonValue = { id?: string; title: string; description: string; videoUrl: string; attachment: string; minutes: string; isFree: boolean };
export type ChapterValue = { id?: string; title: string; description: string; lessons: LessonValue[] };

type LessonRow = LessonValue & { key: number; open: boolean };
type ChapterRow = Omit<ChapterValue, "lessons"> & { key: number; open: boolean; lessons: LessonRow[] };

const emptyLesson = (): LessonRow => ({ key: nextKey(), open: true, title: "", description: "", videoUrl: "", attachment: "", minutes: "", isFree: false });

export function CurriculumEditor({ name, defaultValue = [], error }: { name: string; defaultValue?: ChapterValue[]; error?: string }) {
  const [chapters, setChapters] = useState<ChapterRow[]>(() =>
    defaultValue.map((c) => ({ ...c, key: nextKey(), open: false, lessons: c.lessons.map((l) => ({ ...l, key: nextKey(), open: false })) })),
  );

  const json = JSON.stringify(
    chapters.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      lessons: c.lessons.map((l) => ({ id: l.id, title: l.title, description: l.description, videoUrl: l.videoUrl, attachment: l.attachment, minutes: l.minutes, isFree: l.isFree })),
    })),
  );

  const patchChapter = (key: number, patch: Partial<ChapterRow>) => setChapters((l) => l.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  const patchLessons = (key: number, fn: (lessons: LessonRow[]) => LessonRow[]) =>
    setChapters((l) => l.map((c) => (c.key === key ? { ...c, lessons: fn(c.lessons) } : c)));
  const lessonCount = chapters.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div>
      <input type="hidden" name={name} value={json} />
      <div className="mb-3 text-xs text-muted">
        {toFa(chapters.length)} سرفصل · {toFa(lessonCount)} درس
      </div>
      <ol className="space-y-3">
        {chapters.map((c, ci) => (
          <li key={c.key} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-night-950/40">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <button type="button" onClick={() => patchChapter(c.key, { open: !c.open })} className="adm-icon-btn h-7 w-7" aria-label={c.open ? "بستن سرفصل" : "باز کردن سرفصل"} aria-expanded={c.open}>
                <ChevronDown className={`h-4 w-4 transition ${c.open ? "" : "-rotate-90"}`} />
              </button>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-300">{toFa(ci + 1)}</span>
              <input
                className="adm-input flex-1 !py-2"
                placeholder="عنوان سرفصل"
                value={c.title}
                onChange={(e) => patchChapter(c.key, { title: e.target.value })}
                aria-label={`عنوان سرفصل ${ci + 1}`}
              />
              <span className="hidden shrink-0 text-xs text-muted sm:inline">{toFa(c.lessons.length)} درس</span>
              <Controls index={ci} count={chapters.length} label="سرفصل" onMove={(to) => setChapters((l) => move(l, ci, to))} onRemove={() => setChapters((l) => l.filter((x) => x.key !== c.key))} />
            </div>

            {c.open && (
              <div className="space-y-3 p-3.5">
                <textarea
                  className="adm-input !min-h-16"
                  rows={2}
                  placeholder="توضیح این سرفصل (در صفحه‌ی دوره زیر عنوان سرفصل نمایش داده می‌شود)"
                  value={c.description}
                  onChange={(e) => patchChapter(c.key, { description: e.target.value })}
                  aria-label={`توضیح سرفصل ${ci + 1}`}
                />
                <ul className="space-y-2">
                  {c.lessons.map((l, li) => {
                    const setL = (patch: Partial<LessonRow>) => patchLessons(c.key, (ls) => ls.map((x) => (x.key === l.key ? { ...x, ...patch } : x)));
                    return (
                      <li key={l.key} className="rounded-xl border border-white/[0.06] bg-night-900/60">
                        <div className="flex flex-wrap items-center gap-2 p-2">
                          <button type="button" onClick={() => setL({ open: !l.open })} className="adm-icon-btn h-7 w-7" aria-label="جزئیات درس" aria-expanded={l.open}>
                            <ChevronDown className={`h-3.5 w-3.5 transition ${l.open ? "" : "-rotate-90"}`} />
                          </button>
                          <span className="w-5 text-center text-xs text-muted">{toFa(li + 1)}</span>
                          <input className="adm-input min-w-40 flex-1 !py-1.5" placeholder="عنوان درس" value={l.title} onChange={(e) => setL({ title: e.target.value })} aria-label={`عنوان درس ${li + 1}`} />
                          <input className="adm-input w-20 !py-1.5 text-center" inputMode="numeric" placeholder="دقیقه" value={l.minutes} onChange={(e) => setL({ minutes: e.target.value })} aria-label="مدت (دقیقه)" />
                          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-cream/70">
                            <input type="checkbox" checked={l.isFree} onChange={(e) => setL({ isFree: e.target.checked })} className="h-3.5 w-3.5 accent-gold-500" />
                            رایگان
                          </label>
                          <Controls index={li} count={c.lessons.length} label="درس" onMove={(to) => patchLessons(c.key, (ls) => move(ls, li, to))} onRemove={() => patchLessons(c.key, (ls) => ls.filter((x) => x.key !== l.key))} />
                        </div>
                        {l.open && (
                          <div className="grid gap-2 border-t border-white/[0.05] p-2.5 sm:grid-cols-2">
                            <input className="adm-input !py-1.5 text-left" dir="ltr" placeholder="لینک ویدیو (https://...)" value={l.videoUrl} onChange={(e) => setL({ videoUrl: e.target.value })} aria-label="لینک ویدیو" />
                            <input className="adm-input !py-1.5 text-left" dir="ltr" placeholder="لینک فایل ضمیمه" value={l.attachment} onChange={(e) => setL({ attachment: e.target.value })} aria-label="لینک فایل ضمیمه" />
                            <textarea className="adm-input !min-h-14 sm:col-span-2" rows={2} placeholder="توضیح درس" value={l.description} onChange={(e) => setL({ description: e.target.value })} aria-label="توضیح درس" />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <button type="button" onClick={() => patchLessons(c.key, (ls) => [...ls, emptyLesson()])} className="adm-btn adm-btn-ghost adm-btn-sm">
                  <Plus className="h-3.5 w-3.5" />
                  افزودن درس
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {error && <p className="adm-error">{error}</p>}
      <button
        type="button"
        onClick={() => setChapters((l) => [...l, { key: nextKey(), open: true, title: "", description: "", lessons: [] }])}
        className="adm-btn adm-btn-secondary adm-btn-sm mt-3"
      >
        <Plus className="h-3.5 w-3.5" />
        افزودن سرفصل
      </button>
    </div>
  );
}

// ─── ویرایشگر محتوای مقاله (بلوکی) ───

export type BlockValue = { type: "p" | "h2" | "h3" | "ul" | "quote"; text: string };

const BLOCKS: { type: BlockValue["type"]; label: string; icon: ReactNode; placeholder: string }[] = [
  { type: "p", label: "پاراگراف", icon: <Pilcrow className="h-3.5 w-3.5" />, placeholder: "متن پاراگراف..." },
  { type: "h2", label: "تیتر", icon: <Heading2 className="h-3.5 w-3.5" />, placeholder: "تیتر بخش" },
  { type: "h3", label: "زیرتیتر", icon: <Heading3 className="h-3.5 w-3.5" />, placeholder: "زیرتیتر" },
  { type: "ul", label: "لیست", icon: <List className="h-3.5 w-3.5" />, placeholder: "هر مورد در یک خط" },
  { type: "quote", label: "نقل‌قول", icon: <Quote className="h-3.5 w-3.5" />, placeholder: "متن نقل‌قول" },
];

const blockStyle: Record<BlockValue["type"], string> = {
  p: "leading-8",
  h2: "text-lg font-extrabold",
  h3: "font-bold text-gold-200",
  ul: "leading-8",
  quote: "border-s-2 border-gold-500 !bg-gold-500/[0.04] italic leading-8 text-gold-100",
};

/** محتوای مقاله به‌صورت لیست بلوک‌ها (JSON) — در سایت با همان استایل مقاله نمایش داده می‌شود */
export function BlockEditor({ name, defaultValue = [], error }: { name: string; defaultValue?: BlockValue[]; error?: string }) {
  const [blocks, setBlocks] = useState(() => defaultValue.map((b) => ({ ...b, key: nextKey() })));
  const json = JSON.stringify(
    blocks
      .filter((b) => b.text.trim())
      .map((b) => (b.type === "ul" ? { type: "ul", items: b.text.split("\n").map((s) => s.trim()).filter(Boolean) } : { type: b.type, text: b.text.trim() })),
  );
  const add = (type: BlockValue["type"], at?: number) =>
    setBlocks((l) => {
      const next = [...l];
      next.splice(at ?? l.length, 0, { key: nextKey(), type, text: "" });
      return next;
    });
  const words = blocks.reduce((n, b) => n + b.text.split(/\s+/).filter(Boolean).length, 0);

  return (
    <div>
      <input type="hidden" name={name} value={json} />
      <div className="space-y-2.5">
        {blocks.map((b, i) => {
          const meta = BLOCKS.find((x) => x.type === b.type)!;
          return (
            <div key={b.key} className="group rounded-xl border border-white/[0.07] bg-night-950/40 p-2.5 focus-within:border-gold-500/30">
              <div className="mb-2 flex items-center justify-between gap-2">
                <select
                  value={b.type}
                  onChange={(e) => setBlocks((l) => l.map((x) => (x.key === b.key ? { ...x, type: e.target.value as BlockValue["type"] } : x)))}
                  className="adm-input w-auto !py-1 !pe-3 !text-xs"
                  aria-label="نوع بلوک"
                >
                  {BLOCKS.map((x) => (
                    <option key={x.type} value={x.type}>{x.label}</option>
                  ))}
                </select>
                <Controls index={i} count={blocks.length} label="بلوک" onMove={(to) => setBlocks((l) => move(l, i, to))} onRemove={() => setBlocks((l) => l.filter((x) => x.key !== b.key))} />
              </div>
              <textarea
                value={b.text}
                onChange={(e) => setBlocks((l) => l.map((x) => (x.key === b.key ? { ...x, text: e.target.value } : x)))}
                rows={b.type === "p" || b.type === "ul" ? 4 : 1}
                placeholder={meta.placeholder}
                className={`adm-input !min-h-0 ${blockStyle[b.type]}`}
                aria-label={meta.label}
              />
            </div>
          );
        })}
      </div>
      {blocks.length === 0 && <p className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-muted">محتوایی اضافه نشده. از دکمه‌های زیر یک بلوک اضافه کنید.</p>}
      {error && <p className="adm-error">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {BLOCKS.map((x) => (
          <button key={x.type} type="button" onClick={() => add(x.type)} className="adm-btn adm-btn-secondary adm-btn-sm">
            <Plus className="h-3 w-3" />
            {x.icon}
            {x.label}
          </button>
        ))}
        <span className="ms-auto text-xs text-muted">{toFa(words)} کلمه · حدود {toFa(Math.max(1, Math.round(words / 200)))} دقیقه مطالعه</span>
      </div>
    </div>
  );
}
