import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import Marquee from "@/components/home/Marquee";
import AboutTeaser from "@/components/home/AboutTeaser";
import Process from "@/components/home/Process";
import DateConverterSection from "@/components/home/DateConverterSection";
import CoursesSection from "@/components/home/CoursesSection";
import Testimonials from "@/components/home/Testimonials";
import BlogSection from "@/components/home/BlogSection";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickLinks />
      <Marquee />
      <AboutTeaser />
      <Process />
      <DateConverterSection />
      <CoursesSection />
      <Testimonials />
      <BlogSection />
      <CTA />
    </>
  );
}
