import Link from "next/link";
import Image from "next/image";
import { Clock, Layers, ArrowLeft } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";
import type { Course } from "@/data/courses";
import { price, toFa, discount } from "@/lib/format";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <TiltCard className="h-full rounded-3xl" intensity={6}>
      <Link href={`/courses/${course.slug}`} className="glass glass-hover relative flex h-full flex-col overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/20 to-transparent" />
          <div className="absolute right-4 top-4 flex gap-2">
            <span className="rounded-full border border-gold-500/30 bg-night-950/70 px-3 py-1 text-[11px] text-gold-300 backdrop-blur">
              {course.level}
            </span>
            {course.badge && (
              <span className="rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-night-950">{course.badge}</span>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <span className="script text-sm text-gold-400/70">{course.subtitle}</span>
          <h3 className="mt-1 text-lg font-extrabold text-cream">{course.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-muted">{course.short}</p>
          <div className="mt-5 flex items-center gap-4 text-xs text-cream/60">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gold-500" />{toFa(course.hours)} ساعت</span>
            <span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-gold-500" />{toFa(course.sessions)} جلسه</span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-gold-500/10 pt-5">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gold-300">{price(course.price)}</span>
              {course.oldPrice && (
                <span className="text-xs text-muted line-through">{price(course.oldPrice)}</span>
              )}
              {course.oldPrice && (
                <span className="rounded-md bg-gold-500/15 px-1.5 py-0.5 text-[10px] text-gold-300">{discount(course.oldPrice, course.price)}</span>
              )}
            </div>
            <ArrowLeft className="h-4 w-4 text-cream/60 transition-all group-hover:-translate-x-1 group-hover:text-gold-300" />
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
