/**
 * آدرس عمومی سایت برای ریدایرکت‌ها.
 * پشت reverse proxy (nginx)، Next آدرس درخواست را از آدرس داخلی سرور (localhost:3040) می‌سازد؛
 * پس آدرس واقعی از APP_URL، یا هدرهای X-Forwarded-* / Host که پراکسی می‌فرستد، خوانده می‌شود.
 */
export function publicOrigin(req: Request & { nextUrl?: URL }): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");

  const first = (v: string | null) => v?.split(",")[0]?.trim() || null;
  const host = first(req.headers.get("x-forwarded-host")) ?? req.headers.get("host");
  const fallback = req.nextUrl ?? new URL(req.url);
  if (!host) return fallback.origin;
  const proto = first(req.headers.get("x-forwarded-proto")) ?? fallback.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** ریدایرکت به مسیری از همین سایت با دامنه‌ی واقعی */
export function redirectTo(req: Request & { nextUrl?: URL }, path: string, status: 302 | 303 | 307 = 307) {
  return new Response(null, { status, headers: { Location: publicOrigin(req) + path } });
}
