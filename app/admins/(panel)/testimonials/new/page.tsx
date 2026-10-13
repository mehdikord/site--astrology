import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import TestimonialForm, { emptyTestimonial } from "../TestimonialForm";
import { createTestimonialAction } from "../actions";
import { relatedOptions } from "../options";

export const metadata: Metadata = { title: "افزودن نظر" };

export default async function NewTestimonialPage() {
  return (
    <>
      <AdminPageHeader title="افزودن نظر مشتری" crumbs={[{ label: "نظرات مشتریان", href: "/admins/testimonials/" }, { label: "افزودن" }]} />
      <TestimonialForm action={createTestimonialAction} values={emptyTestimonial} options={await relatedOptions()} submitLabel="افزودن نظر" />
    </>
  );
}
