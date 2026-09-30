import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Timer, ChevronLeft, Sparkles } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import PostCard from "@/components/cards/PostCard";
import Galaxy from "@/components/ui/Galaxy";
import { posts, getPost, type Block } from "@/data/posts";
import { services } from "@/data/services";
import { toFa } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt, openGraph: { type: "article", images: [{ url: p.image }] } };
}

function renderBlock(b: Block, i: number) {
  switch (b.type) {
    case "h2":
      return <h2 key={i}>{b.text}</h2>;
    case "ul":
      return (
        <ul key={i}>
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "quote":
      return <blockquote key={i}>{b.text}</blockquote>;
    default:
      return <p key={i}>{b.text}</p>;
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const related = posts.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-32 lg:pt-40">
        <Galaxy density={0.8} glowIntensity={0.2} rotationSpeed={0.02} repulsionStrength={1} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night-950 to-transparent" />
        <div className="container-x relative max-w-4xl">
          <nav className="mb-6 flex items-center gap-1 text-xs text-muted">
            <Link href="/" className="hover:text-gold-300">خانه</Link>
            <ChevronLeft className="h-3 w-3 text-gold-500/60" />
            <Link href="/blog" className="hover:text-gold-300">مقالات</Link>
            <ChevronLeft className="h-3 w-3 text-gold-500/60" />
            <span className="text-cream/80">{p.category}</span>
          </nav>
          <span className="eyebrow animate-fade-up">{p.category}</span>
          <h1 className="mt-4 text-3xl leading-[1.3] text-cream animate-fade-up [animation-delay:120ms] sm:text-4xl lg:text-5xl">{p.title}</h1>
          <div className="mt-6 flex items-center gap-5 text-sm text-muted animate-fade-up [animation-delay:240ms]">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold-500" />{p.date}</span>
            <span className="inline-flex items-center gap-1.5"><Timer className="h-4 w-4 text-gold-500" />{toFa(p.readTime)} دقیقه مطالعه</span>
          </div>
        </div>
      </section>

      <article className="container-x max-w-4xl">
        <Reveal>
          <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-gold-500/20">
            <Image src={p.image} alt={p.title} fill priority sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
          </div>
        </Reveal>
        <Reveal className="prose-fa mx-auto mt-12 max-w-3xl text-[1.05rem]">
          <p className="!text-xl !leading-10 !text-cream/90">{p.excerpt}</p>
          {p.content.map(renderBlock)}
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-3xl">
          <div className="glass flex flex-col items-start gap-5 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-extrabold text-cream">می‌خواهی این را در چارت خودت ببینی؟</div>
              <div className="mt-1 text-sm text-muted">{services[0].title} — {services[0].short}</div>
            </div>
            <Link href={`/services/${services[0].slug}`} className="btn btn-gold shrink-0">
              <Sparkles className="h-4 w-4" />
              سفارش تحلیل
            </Link>
          </div>
        </Reveal>
      </article>

      <section className="section">
        <div className="container-x">
          <h2 className="text-2xl text-cream">مقالات مرتبط</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 100}>
                <PostCard post={r} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
