import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/session";

/** پاک کردن نشست نامعتبر (مثلاً مدیر حذف شده یا گذرواژه تغییر کرده) و هدایت به صفحه‌ی ورود */
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admins/login/", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
