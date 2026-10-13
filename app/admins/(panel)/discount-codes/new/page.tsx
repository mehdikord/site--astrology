import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { currentJalaliYear } from "@/lib/jalali";
import DiscountForm, { emptyDiscount } from "../DiscountForm";
import { createDiscountAction } from "../actions";

export const metadata: Metadata = { title: "کد تخفیف جدید" };

export default function NewDiscountPage() {
  return (
    <>
      <AdminPageHeader title="کد تخفیف جدید" crumbs={[{ label: "کدهای تخفیف", href: "/admins/discount-codes/" }, { label: "جدید" }]} />
      <DiscountForm action={createDiscountAction} values={emptyDiscount} submitLabel="ساخت کد" maxYear={currentJalaliYear()} />
    </>
  );
}
