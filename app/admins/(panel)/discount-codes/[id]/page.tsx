import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { currentJalaliYear, formatJalaliDateTime } from "@/lib/jalali";
import { toFa } from "@/lib/format";
import DiscountForm from "../DiscountForm";
import { deleteDiscountAction, updateDiscountAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش کد تخفیف" };

export default async function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const did = parseId(id);
  if (!did) notFound();
  const c = await db.discountCode.findUnique({ where: { id: did } });
  if (!c) notFound();
  const n = (v: number | null) => (v === null ? "" : String(v));

  return (
    <>
      <AdminPageHeader
        title={`کد ${c.code}`}
        description={`${toFa(c.usedCount)} بار استفاده شده`}
        crumbs={[{ label: "کدهای تخفیف", href: "/admins/discount-codes/" }, { label: "ویرایش" }]}
        actions={
          <ConfirmAction
            action={deleteDiscountAction.bind(null, id, "/admins/discount-codes/")}
            title="حذف کد تخفیف؟"
            triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
            trigger={<><Trash2 className="h-4 w-4" />حذف</>}
          />
        }
      />
      <DiscountForm
        action={updateDiscountAction.bind(null, id)}
        submitLabel="ذخیره‌ی تغییرات"
        maxYear={currentJalaliYear()}
        values={{
          code: c.code,
          type: c.type,
          value: String(c.value),
          maxDiscount: n(c.maxDiscount),
          minAmount: n(c.minAmount),
          usageLimit: n(c.usageLimit),
          startsAt: formatJalaliDateTime(c.startsAt),
          expiresAt: formatJalaliDateTime(c.expiresAt),
          isActive: c.isActive,
        }}
      />
    </>
  );
}
