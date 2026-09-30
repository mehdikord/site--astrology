import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import PostCard from "@/components/cards/PostCard";
import { posts } from "@/data/posts";

export default function BlogSection() {
  return (
    <section className="section">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader align="start" eyebrow="مقالات" title="از آسمان بخوان" desc="نوشته‌هایی ساده و عمیق درباره‌ی ماتریکس، آسترولوژی و خودشناسی." />
          <Reveal delay={150}>
            <Link href="/blog" className="btn btn-ghost">
              همه‌ی مقالات
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-8 grid gap-6 sm:mt-12 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <Reveal key={p.slug} delay={i * 120}>
              <PostCard post={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
