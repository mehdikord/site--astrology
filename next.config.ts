import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // سرور Node با next start (سازگار با systemd پنل میزبانی)
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
