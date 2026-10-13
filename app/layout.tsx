import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./globals.css";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return {
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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
