"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/admin/Toaster";

type Result = { ok?: boolean; message?: string } | void;

/**
 * دکمه‌ای که قبل از اجرای یک اکشن سرور (معمولاً حذف) دیالوگ تایید نشان می‌دهد.
 * اکشن در صورت موفقیت معمولاً redirect/revalidate می‌کند و در صورت خطا پیام برمی‌گرداند.
 */
export default function ConfirmAction({
  action,
  title = "حذف این مورد؟",
  description = "این عملیات قابل بازگشت نیست.",
  confirmLabel = "بله، حذف شود",
  trigger,
  triggerClassName = "adm-icon-btn hover:!bg-rose-500/10 hover:!text-rose-300",
  triggerLabel = "حذف",
}: {
  action: () => Promise<Result>;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  trigger?: ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const run = () =>
    start(async () => {
      const res = await action();
      if (res && res.ok === false && res.message) toast("error", res.message);
      setOpen(false);
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        // برچسب فقط برای دکمه‌ی آیکنی؛ دکمه‌ی متنی با همان متن خوانده می‌شود
        {...(trigger ? {} : { "aria-label": triggerLabel, title: triggerLabel })}
      >
        {trigger ?? <Trash2 className="h-4 w-4" />}
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && !pending && setOpen(false)}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-night-800 p-0 text-cream shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm open:[animation:adm-dialog-in_.18s_ease-out]"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-base font-bold text-cream">{title}</h3>
              <div className="mt-2 text-sm leading-7 text-muted">{description}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-row-reverse gap-2">
            <button type="button" onClick={run} disabled={pending} className="adm-btn adm-btn-danger">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
            <button type="button" onClick={() => setOpen(false)} disabled={pending} className="adm-btn adm-btn-secondary">
              انصراف
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
