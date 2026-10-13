import { revalidatePath } from "next/cache";

/**
 * صفحات عمومی سایت به‌صورت استاتیک ساخته و کش می‌شوند؛
 * پس از هر تغییر محتوا در پنل، کل کش سایت باطل می‌شود تا صفحات با داده‌ی جدید بازسازی شوند.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
  // صفحه‌ی اصلی با revalidate کل layout باطل نمی‌شود و باید جداگانه باطل شود
  revalidatePath("/");
}
