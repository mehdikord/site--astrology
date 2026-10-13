import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import BlogListing from "@/components/blog/BlogListing";
import CTA from "@/components/home/CTA";
import { getPostCategories, getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "مقالات",
  description: "مقالات آموزشی درباره‌ی ماتریکس سرنوشت، آسترولوژی ودیک، دشا، چارت تولد و خودشناسی.",
};

// مقالات زمان‌بندی‌شده حداکثر یک ساعت پس از زمان انتشار نمایش داده می‌شوند
export const revalidate = 3600;

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getPostCategories()]);

  return (
    <>
      <PageHeader eyebrow="Journal" title="مقالات" desc="نوشته‌هایی ساده و عمیق برای کسانی که می‌خواهند آسمان را بهتر بفهمند." crumbs={[{ label: "مقالات" }]} />
      <BlogListing posts={posts} categories={categories} />
      <CTA title="خواندن کافی نیست؛ نقشه‌ی خودت را بخوان" desc="مقالات نگاه کلی می‌دهند. تحلیل شخصی، نقشه‌ی دقیق تو را نشان می‌دهد." />
    </>
  );
}
