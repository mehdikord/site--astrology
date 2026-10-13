import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { currentJalaliYear } from "@/lib/jalali";
import CourseForm, { emptyCourse } from "../CourseForm";
import { createCourseAction } from "../actions";

export const metadata: Metadata = { title: "افزودن دوره" };

export default function NewCoursePage() {
  return (
    <>
      <AdminPageHeader title="افزودن دوره" crumbs={[{ label: "دوره‌ها", href: "/admins/courses/" }, { label: "افزودن" }]} />
      <CourseForm action={createCourseAction} values={emptyCourse} submitLabel="ایجاد دوره" maxYear={currentJalaliYear()} />
    </>
  );
}
