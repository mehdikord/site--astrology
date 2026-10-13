import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/Logo";
import ZodiacWheel from "@/components/ui/ZodiacWheel";
import Toaster from "@/components/admin/Toaster";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "ورود مدیر" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "" } = await searchParams;

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-night-950 lg:grid-cols-[1.1fr_1fr]">
      <Toaster flash={null} />

      {/* پنل تزئینی */}
      <div className="relative hidden overflow-hidden border-e border-white/[0.06] bg-gradient-to-br from-night-800 via-night-900 to-night-950 lg:block">
        <div className="absolute -start-40 top-1/2 h-[820px] w-[820px] -translate-y-1/2 text-gold-500/[0.13]">
          <ZodiacWheel className="h-full w-full animate-spin-slow" />
        </div>
        <div className="absolute end-10 top-10 h-72 w-72 rounded-full bg-gold-500/10 blur-[100px]" />
        <div className="absolute bottom-0 start-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-[110px]" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <span className="leading-tight">
              <span className="block text-lg font-extrabold text-cream">فاطمه یوسفی</span>
              <span className="block text-[10px] tracking-[0.35em] text-gold-500/80">FATEMEH YOUSEFI</span>
            </span>
          </div>
          <div className="max-w-md">
            <p className="script text-2xl text-gold-400/80" dir="ltr">Astrology is a language of the soul</p>
            <h2 className="mt-5 text-4xl leading-[1.4] text-cream">
              مدیریت <span className="gold-text">خدمات، دوره‌ها و مراجعان</span> در یک جا
            </h2>
            <p className="mt-5 leading-8 text-muted">
              از این پنل خدمات و تحلیل‌ها، سوالات متداول و کاربران سایت را مدیریت کنید.
            </p>
          </div>
          <p className="text-xs text-muted/70">© ۱۴۰۵ فاطمه یوسفی — دسترسی فقط برای مدیران</p>
        </div>
      </div>

      {/* فرم */}
      <div className="relative flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/10 blur-[100px] lg:hidden" />
        <div className="relative w-full max-w-[400px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <LogoMark className="h-14 w-14" />
          </div>
          <h1 className="text-2xl font-extrabold text-cream sm:text-3xl">ورود به پنل مدیریت</h1>
          <p className="mt-2 text-sm leading-7 text-muted">برای ادامه، با شماره موبایل یا ایمیل و گذرواژه وارد شوید.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
