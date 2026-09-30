import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import { site } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | تحلیل ماتریکس، دشا و آسترولوژی ماه تولد`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [{ url: "/images/hero.webp", width: 1600, height: 900 }],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen">
        <CosmicBackground />
        <Navbar />
        <main className="overflow-x-clip">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
