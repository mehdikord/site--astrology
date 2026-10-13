import { db } from "@/lib/db";

/** ثبت بازدید مقاله (از کامپوننت ArticleViewTracker، یک بار در هر نشست مرورگر) */
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await db.article.updateMany({
    where: { slug: decodeURIComponent(slug), status: "published", publishedAt: { lte: new Date() } },
    data: { views: { increment: 1 } },
  });
  return new Response(null, { status: 204 });
}
