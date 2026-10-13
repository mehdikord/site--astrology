import { SignJWT, jwtVerify } from "jose";

/**
 * توکن نشست مدیر (JWT امضاشده با HS256 در کوکی httpOnly).
 * این فایل به دیتابیس وابسته نیست تا در middleware هم قابل استفاده باشد.
 */

export const SESSION_COOKIE = "admin_session";

/** مدت اعتبار نشست — با «مرا به خاطر بسپار» ۳۰ روز، وگرنه ۱۲ ساعت */
export const SESSION_TTL = { short: 60 * 60 * 12, long: 60 * 60 * 24 * 30 };

export type AdminSession = {
  /** شناسه‌ی مدیر */
  sub: string;
  /** اثر انگشت گذرواژه — با تغییر گذرواژه، نشست‌های قبلی باطل می‌شوند */
  pwd: string;
};

function secretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: AdminSession, maxAge: number) {
  return new SignJWT({ pwd: session.pwd })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.pwd !== "string") return null;
    return { sub: payload.sub, pwd: payload.pwd };
  } catch {
    return null;
  }
}
