import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";

/** نمونه‌ی واحد PrismaClient — در حالت dev روی globalThis نگه داشته می‌شود تا با HMR چند اتصال ساخته نشود. */
const createClient = () =>
  new PrismaClient({
    adapter: new PrismaMariaDb({
      host: process.env.DATABASE_HOST ?? "localhost",
      port: Number(process.env.DATABASE_PORT ?? 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5,
    }),
  });

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
