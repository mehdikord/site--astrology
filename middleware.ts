import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin/session";

/** محافظت از مسیرهای پنل مدیریت — بررسی نهایی (وجود مدیر در دیتابیس) در layout و اکشن‌ها انجام می‌شود. */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === "/admins/login" || pathname === "/admins/login/";
  if (pathname.startsWith("/admins/logout")) return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admins/login/";
    url.search = "";
    if (pathname !== "/admins" && pathname !== "/admins/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admins/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admins", "/admins/:path*"],
};
