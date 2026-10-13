import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/admin/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const file = path.resolve(UPLOAD_ROOT, ...parts);
  const type = MIME[path.extname(file).toLowerCase()];
  if (!type || !file.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error();
    const body = await readFile(file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        // نام فایل‌ها یکتاست، پس کش دائمی امن است
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
