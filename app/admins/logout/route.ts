import { SESSION_COOKIE } from "@/lib/admin/session";
import { redirectTo } from "@/lib/admin/redirect";

/** پاک کردن نشست نامعتبر (مثلاً مدیر حذف شده یا گذرواژه تغییر کرده) و هدایت به صفحه‌ی ورود */
export function GET(req: Request) {
  const res = redirectTo(req, "/admins/login/");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
  return res;
}
