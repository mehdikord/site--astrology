import "dotenv/config";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/admin/password";
import { normalizeDigits } from "@/lib/admin/utils";
import { parseJalali } from "@/lib/jalali";
import { SETTING_FIELDS } from "@/lib/setting-fields";
import { services } from "./seed-data/services";
import { courses } from "./seed-data/courses";
import { posts } from "./seed-data/posts";
import { testimonials } from "./seed-data/site";

/**
 * داده‌های اولیه‌ی سایت. هر بخش فقط رکوردهایی را می‌سازد که هنوز وجود ندارند،
 * پس اجرای دوباره‌ی seeder تغییرات پنل مدیریت را بازنویسی نمی‌کند.
 */

async function seedAdmin() {
  const mobile = "09120000000";
  if (await db.admin.findUnique({ where: { mobile } })) return console.log("• admin already exists:", mobile);
  await db.admin.create({
    data: { name: "Admin", mobile, email: "admin@kazhalmethod.com", password: await hashPassword("password") },
  });
  console.log("✓ admin created:", mobile);
}

async function seedSettings() {
  const existing = new Set((await db.setting.findMany({ select: { key: true } })).map((s) => s.key));
  const missing = SETTING_FIELDS.filter((f) => !existing.has(f.key));
  if (missing.length) {
    await db.setting.createMany({ data: missing.map((f) => ({ key: f.key, value: f.default, group: f.group })) });
    console.log(`✓ ${missing.length} settings created`);
  }
}

async function seedServices() {
  for (const [i, s] of services.entries()) {
    if (await db.service.findUnique({ where: { slug: s.slug } })) continue;
    await db.service.create({
      data: {
        slug: s.slug,
        icon: s.icon,
        title: s.title,
        titleEn: s.titleEn,
        tagline: s.tagline,
        shortDescription: s.short,
        intro: s.intro.join("\n\n"),
        image: s.image,
        price: s.price,
        duration: s.duration,
        format: s.format,
        delivery: s.delivery,
        forWho: s.forWho,
        deliverables: s.deliverables,
        requirements: s.needs,
        sortOrder: i + 1,
        steps: { create: s.steps.map((st, k) => ({ title: st.title, description: st.desc, sortOrder: k + 1 })) },
        faqs: { create: s.faq.map((f, k) => ({ question: f.q, answer: f.a, sortOrder: k + 1 })) },
      },
    });
    console.log("✓ service created:", s.slug);
  }
}

/** سوالات عمومی صفحه‌ی تماس */
const GENERAL_FAQS = [
  { q: "چقدر طول می‌کشد تا پاسخ بگیرم؟", a: "پیام‌های تلگرام و واتس‌اپ معمولاً ظرف چند ساعت و حداکثر ۲۴ ساعت کاری پاسخ داده می‌شوند." },
  { q: "پرداخت چطور انجام می‌شود؟", a: "پس از هماهنگی در تلگرام یا واتس‌اپ، لینک پرداخت یا شماره کارت برای شما ارسال می‌شود و پس از تایید، تحلیل شروع می‌شود." },
  { q: "امکان مشاوره‌ی رایگان قبل از سفارش هست؟", a: "بله؛ اگر مطمئن نیستید کدام تحلیل یا دوره مناسب شماست، با چند سوال کوتاه راهنمایی‌تان می‌کنیم." },
];

async function seedGeneralFaqs() {
  if (await db.serviceFaq.count({ where: { serviceId: null } })) return;
  await db.serviceFaq.createMany({ data: GENERAL_FAQS.map((f, i) => ({ question: f.q, answer: f.a, sortOrder: i + 1 })) });
  console.log(`✓ ${GENERAL_FAQS.length} general faqs created`);
}

async function seedCourses() {
  for (const [i, c] of courses.entries()) {
    if (await db.course.findUnique({ where: { slug: c.slug } })) continue;
    await db.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        shortDescription: c.short,
        intro: c.intro.join("\n\n"),
        image: c.image,
        level: c.level,
        hours: c.hours,
        sessionsCount: c.sessions,
        format: c.format,
        price: c.price,
        oldPrice: c.oldPrice ?? null,
        badge: c.badge ?? null,
        learn: c.learn,
        forWho: c.forWho,
        includes: c.includes,
        sortOrder: i + 1,
        publishedAt: new Date(),
        chapters: {
          create: c.curriculum.map((ch, k) => ({
            title: ch.title,
            sortOrder: k + 1,
            lessons: { create: ch.lessons.map((title, n) => ({ title, sortOrder: n + 1 })) },
          })),
        },
      },
    });
    console.log("✓ course created:", c.slug);
  }
}

const CATEGORY_SLUGS: Record<string, string> = {
  "ماتریکس": "matrix",
  "آسترولوژی ودیک": "vedic-astrology",
  "مبانی": "basics",
  "خودشناسی": "self-discovery",
  "ترانزیت‌ها": "transits",
};

async function seedArticles() {
  const names = [...new Set(posts.map((p) => p.category))];
  const categoryIds = new Map<string, bigint>();
  for (const [i, name] of names.entries()) {
    const slug = CATEGORY_SLUGS[name] ?? `category-${i + 1}`;
    const cat = await db.articleCategory.upsert({ where: { slug }, update: {}, create: { name, slug, sortOrder: i + 1 } });
    categoryIds.set(name, cat.id);
  }

  const admin = await db.admin.findFirst({ orderBy: { id: "asc" } });
  for (const p of posts) {
    if (await db.article.findUnique({ where: { slug: p.slug } })) continue;
    await db.article.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        image: p.image,
        content: JSON.stringify(p.content),
        readTime: p.readTime,
        status: "published",
        publishedAt: parseJalali(normalizeDigits(p.date)) ?? new Date(),
        articleCategoryId: categoryIds.get(p.category) ?? null,
        adminId: admin?.id ?? null,
      },
    });
    console.log("✓ article created:", p.slug);
  }
}

async function seedTestimonials() {
  if (await db.testimonial.count()) return;
  await db.testimonial.createMany({
    data: testimonials.map((t, i) => ({ name: t.name, subtitle: t.service, content: t.text, rating: 5, isActive: true, sortOrder: i + 1 })),
  });
  console.log(`✓ ${testimonials.length} testimonials created`);
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedServices();
  await seedGeneralFaqs();
  await seedCourses();
  await seedArticles();
  await seedTestimonials();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
