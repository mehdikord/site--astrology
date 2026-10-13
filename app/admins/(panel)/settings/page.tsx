import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { getSettingValues } from "@/lib/settings";
import { SETTING_FIELDS, SETTING_GROUPS } from "@/lib/setting-fields";
import SettingsForm from "./SettingsForm";
import { saveSettingsAction } from "./actions";

export const metadata: Metadata = { title: "تنظیمات سایت" };

export default async function SettingsPage() {
  const values = await getSettingValues();
  return (
    <>
      <AdminPageHeader title="تنظیمات سایت" description="اطلاعات تماس، شبکه‌های اجتماعی و متن‌های عمومی سایت." crumbs={[{ label: "تنظیمات سایت" }]} />
      <SettingsForm action={saveSettingsAction} groups={SETTING_GROUPS} fields={SETTING_FIELDS} values={values} />
    </>
  );
}
