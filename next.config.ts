import "dotenv/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // سرور Node با next start (سازگار با systemd پنل میزبانی)
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // آپلود فایل در فرم‌های پنل مدیریت (تصویر تا ۳ و گزارش PDF تا ۲۰ مگابایت)
  experimental: {
    serverActions: {
      bodySizeLimit: "21mb",
      // پشت reverse proxy اگر هدر Host دامنه‌ی سایت نباشد، فرم‌ها (Server Actions) بدون این مجوز رد می‌شوند
      allowedOrigins: process.env.APP_URL ? [new URL(process.env.APP_URL).host] : undefined,
    },
  },
};

export default nextConfig;
