import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import BlogListing from "@/components/blog/BlogListing";
import CTA from "@/components/home/CTA";
import { getPostCategories, getPosts } from "@/lib/content";

type Params = { slug: string };

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPostCategories()).map((c) => ({ slug: c.slug }));
}

async function findCategory(slug: string) {
  const categories = await getPostCategories();
  return { categories, category: categories.find((c) => c.slug === decodeURIComponent(slug)) };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await findCategory((await params).slug);
  return category ? { title: `مقالات ${category.name}` } : {};
}

export default async function BlogCategoryPage({ params }: { params: Promise<Params> }) {
  const { categories, category } = await findCategory((await params).slug);
  if (!category) notFound();
  const posts = await getPosts(category.slug);

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title={`مقالات ${category.name}`}
        desc="نوشته‌هایی ساده و عمیق برای کسانی که می‌خواهند آسمان را بهتر بفهمند."
        crumbs={[{ label: "مقالات", href: "/blog" }, { label: category.name }]}
      />
      <BlogListing posts={posts} categories={categories} active={category.slug} />
      <CTA title="خواندن کافی نیست؛ نقشه‌ی خودت را بخوان" desc="مقالات نگاه کلی می‌دهند. تحلیل شخصی، نقشه‌ی دقیق تو را نشان می‌دهد." />
    </>
  );
}
