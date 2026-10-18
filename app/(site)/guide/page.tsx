import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "راهنمای انتخاب",
  description: "راهنمای انتخاب تحلیل یا دوره‌ی مناسب در کژال متد.",
};

export default function GuidePage() {
  return (
    <>
      <PageHeader eyebrow="Guide" title="راهنمای انتخاب" crumbs={[{ label: "راهنمای انتخاب" }]} />
      {/* محتوای این صفحه بعداً اضافه می‌شود */}
      <section className="container-x min-h-[30vh]" />
    </>
  );
}
