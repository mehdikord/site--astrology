import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2, Users } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { currentJalaliYear, formatJalaliDateTime } from "@/lib/jalali";
import { toFa } from "@/lib/format";
import CourseForm, { type CourseFormValues } from "../CourseForm";
import { deleteCourseAction, updateCourseAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش دوره" };

const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courseId = parseId(id);
  if (!courseId) notFound();

  const c = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], include: { lessons: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!c) notFound();

  const values: CourseFormValues = {
    title: c.title,
    slug: c.slug,
    subtitle: c.subtitle ?? "",
    shortDescription: c.shortDescription ?? "",
    intro: c.intro ?? "",
    introVideo: c.introVideo ?? "",
    image: c.image,
    level: c.level ?? "",
    hours: c.hours ? String(c.hours) : "",
    sessionsCount: c.sessionsCount ? String(c.sessionsCount) : "",
    format: c.format ?? "",
    price: String(c.price),
    oldPrice: c.oldPrice ? String(c.oldPrice) : "",
    badge: c.badge ?? "",
    learn: list(c.learn),
    forWho: list(c.forWho),
    includes: list(c.includes),
    curriculum: c.chapters.map((ch) => ({
      id: ch.id.toString(),
      title: ch.title,
      description: ch.description ?? "",
      lessons: ch.lessons.map((l) => ({
        id: l.id.toString(),
        title: l.title,
        description: l.description ?? "",
        videoUrl: l.videoUrl ?? "",
        attachment: l.attachment ?? "",
        minutes: l.duration ? String(Math.round(l.duration / 60)) : "",
        isFree: l.isFree,
      })),
    })),
    isActive: c.isActive,
    sortOrder: String(c.sortOrder),
    publishedAt: formatJalaliDateTime(c.publishedAt),
    metaTitle: c.metaTitle ?? "",
    metaDescription: c.metaDescription ?? "",
  };

  return (
    <>
      <AdminPageHeader
        title={c.title}
        description="ویرایش اطلاعات، سرفصل‌ها و درس‌های دوره"
        crumbs={[{ label: "دوره‌ها", href: "/admins/courses/" }, { label: "ویرایش" }]}
        actions={
          <>
            <Link href={`/admins/courses/${id}/students/`} className="adm-btn adm-btn-secondary">
              <Users className="h-4 w-4" />
              دانشجویان ({toFa(c._count.enrollments)})
            </Link>
            <a href={`/courses/${c.slug}/`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary">
              <ExternalLink className="h-4 w-4" />
              مشاهده
            </a>
            <ConfirmAction
              action={deleteCourseAction.bind(null, id, "/admins/courses/")}
              title="حذف دوره؟"
              description={<>دوره‌ی <b className="text-cream">«{c.title}»</b> همراه با همه‌ی سرفصل‌ها و درس‌هایش حذف می‌شود.</>}
              triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              trigger={<><Trash2 className="h-4 w-4" />حذف</>}
            />
          </>
        }
      />
      <CourseForm key={c.updatedAt.getTime()} action={updateCourseAction.bind(null, id)} values={values} submitLabel="ذخیره‌ی تغییرات" maxYear={currentJalaliYear()} />
    </>
  );
}
