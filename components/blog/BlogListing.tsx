import Link from "next/link";
import PostCard from "@/components/cards/PostCard";
import Reveal from "@/components/ui/Reveal";
import type { PostView } from "@/lib/content";

/** لیست مقالات با فیلتر دسته‌بندی (مشترک بین /blog و /blog/category/[slug]) */
export default function BlogListing({
  posts,
  categories,
  active,
}: {
  posts: PostView[];
  categories: { name: string; slug: string }[];
  active?: string;
}) {
  const [first, ...rest] = posts;
  const chip = (isActive: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-xs transition ${
      isActive ? "bg-gold-500 font-bold text-night-950" : "border border-gold-500/25 text-cream/80 hover:border-gold-500/60 hover:text-cream"
    }`;

  return (
    <section className="container-x -mt-6">
      {categories.length > 0 && (
        <Reveal className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <Link href="/blog" className={chip(!active)}>همه</Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/blog/category/${c.slug}`} className={chip(active === c.slug)}>
              {c.name}
            </Link>
          ))}
        </Reveal>
      )}

      {!first ? (
        <p className="glass rounded-3xl p-10 text-center text-muted">هنوز مقاله‌ای در این بخش منتشر نشده است.</p>
      ) : (
        <>
          <Reveal>
            <PostCard post={first} featured />
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
