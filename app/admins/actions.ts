"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/admin/auth";

export async function logoutAction() {
  await endSession();
  redirect("/admins/login/");
}
