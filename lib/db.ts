import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * تنظیمات اتصال به MySQL. منبع اصلی DATABASE_URL است (همان چیزی که Prisma CLI و مایگریشن‌ها استفاده می‌کنند)؛
 * اگر تعریف نشده باشد از DATABASE_HOST / DATABASE_USER / ... خوانده می‌شود.
 */
export function dbConfig() {
  const url = process.env.DATABASE_URL;
  const parsed = url ? new URL(url) : null;
  return {
    host: parsed?.hostname || process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(parsed?.port || process.env.DATABASE_PORT || 3306),
    user: parsed ? decodeURIComponent(parsed.username) : process.env.DATABASE_USER,
    password: parsed ? decodeURIComponent(parsed.password) : process.env.DATABASE_PASSWORD,
    database: parsed ? decodeURIComponent(parsed.pathname.slice(1)) : process.env.DATABASE_NAME,
    // کاربران MySQL 8 به‌طور پیش‌فرض caching_sha2_password دارند؛ بدون این گزینه اتصال بدون SSL رد می‌شود
    allowPublicKeyRetrieval: true,
    connectTimeout: 10_000,
    connectionLimit: 5,
  };
}

/** نمونه‌ی واحد PrismaClient — در حالت dev روی globalThis نگه داشته می‌شود تا با HMR چند اتصال ساخته نشود. */
const createClient = () => new PrismaClient({ adapter: new PrismaMariaDb(dbConfig()) });

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
