import { db } from "@/lib/db";

/** گزینه‌های «مرتبط با» در فرم نظرات */
export async function relatedOptions() {
  const [services, courses] = await Promise.all([
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true } }),
    db.course.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true } }),
  ]);
  return {
    services: services.map((s) => ({ id: s.id.toString(), title: s.title })),
    courses: courses.map((c) => ({ id: c.id.toString(), title: c.title })),
  };
}
