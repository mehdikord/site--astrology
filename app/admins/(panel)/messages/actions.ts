"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { parseId, setFlash, type FormState } from "@/lib/admin/utils";

export async function toggleMessageReadAction(id: string): Promise<void> {
  await requireAdmin();
  const mid = parseId(id);
  const m = mid && (await db.contactMessage.findUnique({ where: { id: mid }, select: { readAt: true } }));
  if (!mid || !m) return;
  await db.contactMessage.update({ where: { id: mid }, data: { readAt: m.readAt ? null : new Date() } });
  revalidatePath("/admins/", "layout");
}

export async function markAllReadAction(): Promise<void> {
  await requireAdmin();
  await db.contactMessage.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/admins/", "layout");
}

export async function deleteMessageAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const mid = parseId(id);
  if (!mid || !(await db.contactMessage.findUnique({ where: { id: mid }, select: { id: true } }))) {
    return { ok: false, message: "این پیام قبلاً حذف شده است." };
  }
  await db.contactMessage.delete({ where: { id: mid } });
  revalidatePath("/admins/", "layout");
  await setFlash("success", "پیام حذف شد.");
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}
