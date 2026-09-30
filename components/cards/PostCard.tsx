import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Timer } from "lucide-react";
import type { Post } from "@/data/posts";
import { toFa } from "@/lib/format";

export default function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group glass glass-hover relative flex overflow-hidden rounded-3xl ${featured ? "flex-col md:flex-row" : "flex-col"}`}
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]"}`}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-900/80 to-transparent" />
        <span className="absolute right-4 top-4 rounded-full border border-gold-500/30 bg-night-950/70 px-3 py-1 text-[11px] text-gold-300 backdrop-blur">
          {post.category}
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-10" : ""}`}>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-gold-500" />{post.date}</span>
          <span className="inline-flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-gold-500" />{toFa(post.readTime)} دقیقه</span>
        </div>
        <h3 className={`mt-3 font-extrabold leading-snug text-cream transition-colors group-hover:text-gold-200 ${featured ? "text-2xl" : "text-lg"}`}>
          {post.title}
        </h3>
        <p className={`mt-3 flex-1 text-sm leading-7 text-muted ${featured ? "" : "line-clamp-3"}`}>{post.excerpt}</p>
        <span className="mt-5 text-sm font-medium text-gold-400/90">ادامه‌ی مطلب ←</span>
      </div>
    </Link>
  );
}
