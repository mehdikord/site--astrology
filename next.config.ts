import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // خروجی کاملاً استاتیک (پوشه‌ی out/) — بدون سرور و پایگاه داده
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
