import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import DateConverter from "@/components/home/DateConverter";

export default function DateConverterSection() {
  return (
    <section id="date-converter" className="section z-20 scroll-mt-24 pb-0 sm:pb-0 lg:pb-0">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[360px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-gold-500/[0.05] blur-3xl" />
      <div className="container-x">
        <SectionHeader eyebrow="Date Converter" title="تبدیل تاریخ میلادی و شمسی" desc="تاریخ تولدت را با تقویم انتخاب کن تا معادل آن را در تقویم دیگر ببینی؛ برای ثبت دقیق اطلاعات تحلیل." />
        <Reveal delay={120} className="mt-10 sm:mt-12">
          <DateConverter />
        </Reveal>
      </div>
    </section>
  );
}
