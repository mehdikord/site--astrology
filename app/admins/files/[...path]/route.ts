import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { PRIVATE_ROOT } from "@/lib/admin/uploads";

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/** دریافت فایل‌های خصوصی (گزارش‌ها) — فقط برای مدیر واردشده */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await getCurrentAdmin())) return new Response("Unauthorized", { status: 401 });

  const { path: parts } = await params;
  const file = path.resolve(PRIVATE_ROOT, ...parts);
  const type = MIME[path.extname(file).toLowerCase()];
  if (!type || !file.startsWith(PRIVATE_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error();
    return new Response(new Uint8Array(await readFile(file)), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Content-Disposition": `inline; filename="${path.basename(file)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
