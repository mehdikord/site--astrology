import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import CourseCard from "@/components/cards/CourseCard";
import { courses } from "@/data/courses";

export default function CoursesSection() {
  return (
    <section className="section">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gold-500/[0.05] blur-3xl" />
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader align="start" eyebrow="دوره‌های آموزشی" title="خودت زبان آسمان را یاد بگیر" desc="دوره‌های ساخت‌یافته از مقدماتی تا حرفه‌ای؛ با دسترسی دائمی، جلسات زنده و پشتیبانی." />
          <Reveal delay={150}>
            <Link href="/courses" className="btn btn-ghost">
              همه‌ی دوره‌ها
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((c, i) => (
            <Reveal key={c.slug} delay={i * 120} className="h-full">
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
