import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin/session";
import { redirectTo } from "@/lib/admin/redirect";

/** محافظت از مسیرهای پنل مدیریت — بررسی نهایی (وجود مدیر در دیتابیس) در layout و اکشن‌ها انجام می‌شود. */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === "/admins/login" || pathname === "/admins/login/";
  if (pathname.startsWith("/admins/logout")) return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLogin) {
    const next = pathname !== "/admins" && pathname !== "/admins/" ? `?next=${encodeURIComponent(pathname + search)}` : "";
    return redirectTo(req, `/admins/login/${next}`);
  }

  if (session && isLogin) return redirectTo(req, "/admins/");

  return NextResponse.next();
}

export const config = {
  matcher: ["/admins", "/admins/:path*"],
};
