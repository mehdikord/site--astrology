/** برچسب و رنگ وضعیت‌ها در پنل مدیریت */

type Label = { label: string; cls: string };

export const ORDER_STATUS: Record<string, Label> = {
  pending: { label: "در انتظار پرداخت", cls: "adm-badge-gold" },
  paid: { label: "پرداخت‌شده", cls: "adm-badge-success" },
  failed: { label: "ناموفق", cls: "adm-badge-rose" },
  canceled: { label: "لغو شده", cls: "adm-badge-muted" },
  refunded: { label: "مسترد شده", cls: "adm-badge-info" },
};

export const TRANSACTION_STATUS: Record<string, Label> = {
  pending: { label: "در انتظار", cls: "adm-badge-gold" },
  success: { label: "موفق", cls: "adm-badge-success" },
  failed: { label: "ناموفق", cls: "adm-badge-rose" },
  canceled: { label: "لغو شده", cls: "adm-badge-muted" },
};

export const REQUEST_STATUS: Record<string, Label> = {
  pending_payment: { label: "در انتظار پرداخت", cls: "adm-badge-gold" },
  pending: { label: "در صف بررسی", cls: "adm-badge-info" },
  in_progress: { label: "در حال تحلیل", cls: "adm-badge-info" },
  completed: { label: "تحویل شده", cls: "adm-badge-success" },
  canceled: { label: "لغو شده", cls: "adm-badge-muted" },
};

export const ARTICLE_STATUS: Record<string, Label> = {
  draft: { label: "پیش‌نویس", cls: "adm-badge-muted" },
  published: { label: "منتشرشده", cls: "adm-badge-success" },
};

export const ENROLLMENT_SOURCE: Record<string, string> = { purchase: "خرید", admin: "اعطای مدیر", gift: "هدیه" };

export const BIRTH_TIME_ACCURACY: Record<string, string> = { exact: "دقیق", approximate: "تقریبی", unknown: "نامشخص" };

export const GENDER: Record<string, string> = { male: "مرد", female: "زن" };

export const GATEWAYS: Record<string, string> = {
  manual: "ثبت دستی",
  card: "کارت به کارت",
  zarinpal: "زرین‌پال",
  zibal: "زیبال",
  idpay: "آیدی‌پی",
};

export const badge = (map: Record<string, Label>, key: string): Label => map[key] ?? { label: key, cls: "adm-badge-muted" };
