import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import { getSettings } from "@/lib/settings";

// صفحات پس از هر تغییر در پنل فوراً بازسازی می‌شوند؛ این مقدار فقط پشتیبان است (حداکثر یک ساعت تاخیر)
export const revalidate = 3600;

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSettings();
  return (
    <>
      <CosmicBackground />
      <Navbar
        site={{ name: site.name, nameEn: site.nameEn, instagram: site.instagram, telegram: site.telegram, whatsapp: site.whatsapp }}
      />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
    </>
  );
}
