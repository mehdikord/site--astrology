"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type Toast = { id: string; type: "success" | "error"; message: string };

const EVENT = "adm-toast";

/** نمایش toast از هر کامپوننت کلاینت */
export function toast(type: Toast["type"], message: string) {
  window.dispatchEvent(new CustomEvent<Toast>(EVENT, { detail: { id: crypto.randomUUID(), type, message } }));
}

/** flash: پیامی که اکشن سرور قبل از redirect در کوکی گذاشته است */
export default function Toaster({ flash }: { flash: Toast | null }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Toast) => {
    setItems((list) => (list.some((x) => x.id === t.id) ? list : [...list, t]));
    setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 4500);
  }, []);

  useEffect(() => {
    if (!flash) return;
    push(flash);
    document.cookie = "admin_flash=; Max-Age=0; path=/";
  }, [flash, push]);

  useEffect(() => {
    const onToast = (e: Event) => push((e as CustomEvent<Toast>).detail);
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, [push]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-2xl backdrop-blur-xl [animation:adm-toast-in_.25s_ease-out] ${
            t.type === "success" ? "border-emerald-500/25 bg-night-800/95 text-emerald-100" : "border-rose-500/30 bg-night-800/95 text-rose-100"
          }`}
        >
          {t.type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />}
          <span className="flex-1 leading-6">{t.message}</span>
          <button type="button" onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))} className="text-cream/40 hover:text-cream" aria-label="بستن">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
