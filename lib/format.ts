const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل ارقام انگلیسی به فارسی */
export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** جداکننده‌ی هزارگان + ارقام فارسی  → ۱٬۸۰۰٬۰۰۰ */
export function formatNumber(n: number): string {
  const withSep = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toFa(withSep);
}

/** قیمت به تومان */
export function price(n: number): string {
  return `${formatNumber(n)} تومان`;
}

/** درصد تخفیف */
export function discount(oldPrice: number, newPrice: number): string {
  return toFa(Math.round(((oldPrice - newPrice) / oldPrice) * 100)) + "٪";
}
