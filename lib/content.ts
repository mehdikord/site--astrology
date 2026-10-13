import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { faDate } from "@/lib/jalali";

/**
 * لایه‌ی خواندن محتوای سایت از دیتابیس و تبدیل آن به مدل‌های نمایشی صفحات.
 * فقط محتوای فعال/منتشرشده برگردانده می‌شود.
 */

export type ServiceIconName = "matrix" | "dasha" | "moon";

export type ServiceView = {
  slug: string;
  icon: ServiceIconName;
  title: string;
  titleEn: string;
  tagline: string;
  short: string;
  price: number;
  oldPrice: number | null;
  duration: string;
  format: string;
  delivery: string;
  image: string;
  intro: string[];
  forWho: string[];
  deliverables: string[];
  needs: string[];
  steps: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
};

export type CourseView = {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  introVideo: string | null;
  level: string;
  hours: number;
  sessions: number;
  format: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  short: string;
  intro: string[];
  learn: string[];
  forWho: string[];
  includes: string[];
  curriculum: { title: string; description: string | null; lessons: { title: string; minutes: number | null; isFree: boolean }[] }[];
  metaTitle: string | null;
  metaDescription: string | null;
};

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export const BLOCK_TYPES = ["p", "h2", "h3", "ul", "quote"] as const;

export type PostView = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categorySlug: string | null;
  date: string;
  readTime: number;
  content: Block[];
  metaTitle: string | null;
  metaDescription: string | null;
};

export type TestimonialView = { id: string; name: string; service: string; text: string; rating: number; avatar: string | null };

const FALLBACK_IMAGE = "/images/hero.webp";

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : []);
const paragraphs = (v: string | null | undefined) => (v ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const icon = (v: string | null): ServiceIconName => (v === "dasha" || v === "moon" ? v : "matrix");

/** محتوای مقاله: JSON بلوک‌ها؛ متن ساده هم به پاراگراف‌ها تبدیل می‌شود */
export function parseBlocks(content: string | null | undefined): Block[] {
  if (!content) return [];
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.flatMap((b): Block[] => {
        if (!b || typeof b !== "object") return [];
        if (b.type === "ul") {
          const items = strings(b.items);
          return items.length ? [{ type: "ul", items }] : [];
        }
        if ((BLOCK_TYPES as readonly string[]).includes(b.type) && typeof b.text === "string" && b.text.trim()) {
          return [{ type: b.type, text: b.text.trim() } as Block];
        }
        return [];
      });
    }
  } catch {
    /* متن ساده */
  }
  return paragraphs(content).map((text) => ({ type: "p", text }));
}

// ─── خدمات ───

const serviceInclude = {
  steps: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] },
  faqs: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] },
} satisfies Prisma.ServiceInclude;

type ServiceRow = Prisma.ServiceGetPayload<{ include: typeof serviceInclude }>;

function toServiceView(s: ServiceRow): ServiceView {
  return {
    slug: s.slug,
    icon: icon(s.icon),
    title: s.title,
    titleEn: s.titleEn ?? "",
    tagline: s.tagline ?? "",
    short: s.shortDescription ?? "",
    price: s.price,
    oldPrice: s.oldPrice,
    duration: s.duration ?? "",
    format: s.format ?? "",
    delivery: s.delivery ?? "",
    image: s.image || FALLBACK_IMAGE,
    intro: paragraphs(s.intro),
    forWho: strings(s.forWho),
    deliverables: strings(s.deliverables),
    needs: strings(s.requirements),
    steps: s.steps.map((st) => ({ title: st.title, desc: st.description ?? "" })),
    faq: s.faqs.map((f) => ({ q: f.question, a: f.answer })),
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
  };
}

export const getServices = cache(async (): Promise<ServiceView[]> => {
  const rows = await db.service.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], include: serviceInclude });
  return rows.map(toServiceView);
});

export const getService = cache(async (slug: string): Promise<ServiceView | null> => {
  const row = await db.service.findFirst({ where: { slug: decodeURIComponent(slug), isActive: true }, include: serviceInclude });
  return row ? toServiceView(row) : null;
});

// ─── دوره‌ها ───

const courseInclude = {
  chapters: {
    orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }],
    include: { lessons: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] } },
  },
} satisfies Prisma.CourseInclude;

type CourseRow = Prisma.CourseGetPayload<{ include: typeof courseInclude }>;

function toCourseView(c: CourseRow): CourseView {
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? "",
    image: c.image || FALLBACK_IMAGE,
    introVideo: c.introVideo,
    level: c.level ?? "",
    hours: c.hours,
    sessions: c.sessionsCount,
    format: c.format ?? "",
    price: c.price,
    oldPrice: c.oldPrice,
    badge: c.badge,
    short: c.shortDescription ?? "",
    intro: paragraphs(c.intro),
    learn: strings(c.learn),
    forWho: strings(c.forWho),
    includes: strings(c.includes),
    curriculum: c.chapters.map((ch) => ({
      title: ch.title,
      description: ch.description,
      lessons: ch.lessons.map((l) => ({ title: l.title, minutes: l.duration ? Math.round(l.duration / 60) : null, isFree: l.isFree })),
    })),
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
  };
}

const publishedCourse = () => ({ isActive: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] });

export const getCourses = cache(async (): Promise<CourseView[]> => {
  const rows = await db.course.findMany({ where: publishedCourse(), orderBy: [{ sortOrder: "asc" }, { id: "asc" }], include: courseInclude });
  return rows.map(toCourseView);
});

export const getCourse = cache(async (slug: string): Promise<CourseView | null> => {
  const row = await db.course.findFirst({ where: { slug: decodeURIComponent(slug), ...publishedCourse() }, include: courseInclude });
  return row ? toCourseView(row) : null;
});

// ─── مقالات ───

const postInclude = { category: { select: { name: true, slug: true, isActive: true } } } satisfies Prisma.ArticleInclude;

type PostRow = Prisma.ArticleGetPayload<{ include: typeof postInclude }>;

function toPostView(a: PostRow): PostView {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? "",
    image: a.image || FALLBACK_IMAGE,
    category: a.category?.name ?? "مقاله",
    categorySlug: a.category?.slug ?? null,
    date: faDate(a.publishedAt ?? a.createdAt),
    readTime: a.readTime,
    content: parseBlocks(a.content),
    metaTitle: a.metaTitle,
    metaDescription: a.metaDescription,
  };
}

const publishedPost = () => ({ status: "published" as const, publishedAt: { lte: new Date() } });

export const getPosts = cache(async (categorySlug?: string, limit?: number): Promise<PostView[]> => {
  const rows = await db.article.findMany({
    where: { ...publishedPost(), ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
    take: limit,
    include: postInclude,
  });
  return rows.map(toPostView);
});

export const getPost = cache(async (slug: string): Promise<PostView | null> => {
  const row = await db.article.findFirst({ where: { slug: decodeURIComponent(slug), ...publishedPost() }, include: postInclude });
  return row ? toPostView(row) : null;
});

/** دسته‌بندی‌های فعالی که مقاله‌ی منتشرشده دارند */
export const getPostCategories = cache(async () => {
  const rows = await db.articleCategory.findMany({
    where: { isActive: true, articles: { some: publishedPost() } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { name: true, slug: true },
  });
  return rows;
});

// ─── نظرات و سوالات عمومی ───

export const getTestimonials = cache(async (limit?: number): Promise<TestimonialView[]> => {
  const rows = await db.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    take: limit,
    include: { service: { select: { title: true } }, course: { select: { title: true } } },
  });
  return rows.map((t) => ({
    id: t.id.toString(),
    name: t.name,
    service: t.subtitle || t.service?.title || t.course?.title || "",
    text: t.content,
    rating: Math.min(5, Math.max(1, t.rating)),
    avatar: t.avatar,
  }));
});

export const getGeneralFaqs = cache(async () => {
  const rows = await db.serviceFaq.findMany({ where: { serviceId: null }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return rows.map((f) => ({ q: f.question, a: f.answer }));
});
