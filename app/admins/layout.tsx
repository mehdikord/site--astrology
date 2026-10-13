import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "پنل مدیریت", template: "%s | پنل مدیریت" },
  robots: { index: false, follow: false },
};

export default function AdminsRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
