import { db } from "@/lib/db";

export async function serviceOptions() {
  const rows = await db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true, requirements: true } });
  return rows.map((s) => ({
    id: s.id.toString(),
    title: s.title,
    needs: Array.isArray(s.requirements) ? s.requirements.filter((x): x is string => typeof x === "string") : [],
  }));
}

/** ساعت ستون TIME → «14:30» */
export const formatTime = (d: Date | null) =>
  d ? `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}` : "";
