import Link from "next/link";
import Galaxy from "@/components/ui/Galaxy";
import ZodiacWheel from "@/components/ui/ZodiacWheel";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden">
      <Galaxy density={1} glowIntensity={0.3} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 text-gold-500/10">
        <ZodiacWheel className="h-full w-full animate-spin-slow" />
      </div>
      <div className="container-x relative text-center">
        <div className="script text-8xl text-gold-500/60" dir="ltr">404</div>
        <h1 className="mt-4 text-3xl text-cream sm:text-4xl">این ستاره در نقشه نیست</h1>
        <p className="mx-auto mt-4 max-w-md leading-8 text-muted">صفحه‌ای که دنبالش بودی وجود ندارد یا جابه‌جا شده است.</p>
        <Link href="/" className="btn btn-gold mt-8">بازگشت به خانه</Link>
      </div>
    </section>
  );
}
