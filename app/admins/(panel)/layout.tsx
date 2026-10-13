import AdminShell from "@/components/admin/AdminShell";
import Toaster from "@/components/admin/Toaster";
import { requireAdmin } from "@/lib/admin/auth";
import { readFlash } from "@/lib/admin/utils";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();
  const [flash, requests, orders, messages] = await Promise.all([
    readFlash(),
    db.analysisRequest.count({ where: { status: { in: ["pending", "in_progress"] } } }),
    db.order.count({ where: { status: "pending" } }),
    db.contactMessage.count({ where: { readAt: null } }),
  ]);

  return (
    <AdminShell admin={{ name: admin.name, email: admin.email, mobile: admin.mobile }} badges={{ requests, orders, messages }}>
      <Toaster flash={flash} />
      {children}
    </AdminShell>
  );
}
