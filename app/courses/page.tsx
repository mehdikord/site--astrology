import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CourseCard from "@/components/cards/CourseCard";
import Reveal from "@/components/ui/Reveal";
import CTA from "@/components/home/CTA";
import { courses } from "@/data/courses";
import { Infinity as InfinityIcon, Users, Award, MessagesSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "دوره‌های آموزشی",
  description: "دوره‌های آموزش ماتریکس سرنوشت، آسترولوژی ودیک و دشا، و مبانی خوانش چارت تولد — با دسترسی دائمی و جلسات زنده.",
};

const PERKS = [
  { icon: InfinityIcon, t: "دسترسی دائمی", d: "یک‌بار خرید، برای همیشه دسترسی." },
  { icon: Users, t: "جلسات زنده", d: "پرسش‌وپاسخ و تحلیل چارت واقعی." },
  { icon: MessagesSquare, t: "پشتیبانی", d: "گروه تلگرامی و پاسخ به سوالات." },
  { icon: Award, t: "گواهی پایان دوره", d: "برای دوره‌های جامع." },
];

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="دوره‌های آموزشی"
        desc="زبان آسمان را خودت یاد بگیر. از مبانی چارت تولد تا تحلیل حرفه‌ای ماتریکس و زمان‌بندی زندگی با دشا."
        crumbs={[{ label: "دوره‌ها" }]}
      />

      <section className="container-x -mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <Reveal key={p.t} delay={i * 80}>
              <div className="glass flex items-center gap-4 rounded-2xl p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/10 text-gold-300"><p.icon className="h-5 w-5" /></span>
                <span>
                  <span className="block text-sm font-bold text-cream">{p.t}</span>
                  <span className="block text-xs text-muted">{p.d}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {courses.map((c, i) => (
            <Reveal key={c.slug} delay={i * 100} className="h-full">
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      </section>

      <CTA title="نمی‌دانی از کدام دوره شروع کنی؟" desc="اگر تازه‌کاری، «مبانی خوانش چارت تولد» یا «کارگاه ماه تولد» نقطه‌ی شروع خوبی است. برای مشاوره پیام بده." />
    </>
  );
}
