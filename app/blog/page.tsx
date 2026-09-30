import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import PostCard from "@/components/cards/PostCard";
import Reveal from "@/components/ui/Reveal";
import CTA from "@/components/home/CTA";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "مقالات",
  description: "مقالات آموزشی درباره‌ی ماتریکس سرنوشت، آسترولوژی ودیک، دشا، چارت تولد و خودشناسی.",
};

export default function BlogPage() {
  const [first, ...rest] = posts;
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <>
      <PageHeader eyebrow="Journal" title="مقالات" desc="نوشته‌هایی ساده و عمیق برای کسانی که می‌خواهند آسمان را بهتر بفهمند." crumbs={[{ label: "مقالات" }]} />

      <section className="container-x -mt-6">
        <Reveal className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-gold-500 px-4 py-1.5 text-xs font-bold text-night-950">همه</span>
          {categories.map((c) => (
            <span key={c} className="rounded-full border border-gold-500/25 px-4 py-1.5 text-xs text-cream/80">{c}</span>
          ))}
        </Reveal>
        <Reveal>
          <PostCard post={first} featured />
        </Reveal>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <PostCard post={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <CTA title="خواندن کافی نیست؛ نقشه‌ی خودت را بخوان" desc="مقالات نگاه کلی می‌دهند. تحلیل شخصی، نقشه‌ی دقیق تو را نشان می‌دهد." />
    </>
  );
}
