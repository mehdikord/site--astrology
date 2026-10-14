/**
 * بررسی اتصال به دیتابیس با همان تنظیمات برنامه و نمایش خطای واقعی
 * (Prisma خطای اتصال را فقط به‌صورت «pool timeout» نشان می‌دهد).
 * اجرا: npm run db:check
 */
import "dotenv/config";
import mariadb from "mariadb";
import { dbConfig } from "@/lib/db";

// connectionLimit فقط برای pool است
const { connectionLimit, ...config } = dbConfig();
void connectionLimit;
console.log(`Connecting to ${config.user}@${config.host}:${config.port}/${config.database} ...`);

async function main() {
  try {
    const conn = await mariadb.createConnection(config);
    const [{ version }] = await conn.query("SELECT VERSION() AS version");
    const [{ n }] = await conn.query("SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE()");
    console.log(`✓ Connected — MySQL ${version}, ${n} tables`);
    await conn.end();
  } catch (e) {
    const err = e as { code?: string; message: string };
    console.error(`✗ ${err.code ?? "ERROR"}: ${err.message.split("\n")[0]}`);
    process.exitCode = 1;
  }
}

main();
