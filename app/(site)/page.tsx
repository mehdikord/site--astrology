import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Marquee from "@/components/home/Marquee";
import AboutTeaser from "@/components/home/AboutTeaser";
import Process from "@/components/home/Process";
import CoursesSection from "@/components/home/CoursesSection";
import Testimonials from "@/components/home/Testimonials";
import BlogSection from "@/components/home/BlogSection";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Marquee />
      <AboutTeaser />
      <Process />
      <CoursesSection />
      <Testimonials />
      <BlogSection />
      <CTA />
    </>
  );
}
