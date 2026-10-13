import {
  LayoutDashboard,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Newspaper,
  FolderTree,
  Users,
  ClipboardList,
  Receipt,
  CreditCard,
  TicketPercent,
  Mail,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/** badge: کلید شمارنده‌ای که layout محاسبه می‌کند */
export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: "requests" | "orders" | "messages" };

export const adminNav: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admins/", label: "داشبورد", icon: LayoutDashboard }] },
  {
    title: "محتوا",
    items: [
      { href: "/admins/services/", label: "خدمات", icon: Sparkles },
      { href: "/admins/courses/", label: "دوره‌ها", icon: GraduationCap },
      { href: "/admins/articles/", label: "مقالات", icon: Newspaper },
      { href: "/admins/article-categories/", label: "دسته‌بندی مقالات", icon: FolderTree },
      { href: "/admins/faqs/", label: "سوالات متداول", icon: HelpCircle },
      { href: "/admins/testimonials/", label: "نظرات مشتریان", icon: MessageSquareQuote },
    ],
  },
  {
    title: "مشتریان و فروش",
    items: [
      { href: "/admins/users/", label: "کاربران", icon: Users },
      { href: "/admins/analysis-requests/", label: "درخواست‌های تحلیل", icon: ClipboardList, badge: "requests" },
      { href: "/admins/orders/", label: "سفارش‌ها", icon: Receipt, badge: "orders" },
      { href: "/admins/transactions/", label: "تراکنش‌ها", icon: CreditCard },
      { href: "/admins/discount-codes/", label: "کدهای تخفیف", icon: TicketPercent },
      { href: "/admins/messages/", label: "پیام‌ها", icon: Mail, badge: "messages" },
    ],
  },
  {
    title: "سیستم",
    items: [
      { href: "/admins/settings/", label: "تنظیمات سایت", icon: Settings },
      { href: "/admins/admins/", label: "مدیران", icon: ShieldCheck },
    ],
  },
];
