import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/actions";
import {
  getAllSiteSettings,
  getAllFeatureFlags,
} from "@/lib/admin/settings-queries";
import { listAdminUsers } from "@/lib/admin/admin-team-queries";
import { SettingsTabs } from "./settings-tabs";

export default async function AdminSettings({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/sign-in");

  const params = await searchParams;
  const activeTab =
    typeof params.tab === "string" ? params.tab : "announcement";

  const [{ data: settings }, { data: flags }, adminUsers] = await Promise.all([
    getAllSiteSettings(),
    getAllFeatureFlags(),
    listAdminUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage site configuration, announcements, and admin access.
        </p>
      </div>
      <SettingsTabs
        activeTab={activeTab}
        adminRole={admin.role}
        adminId={admin.id}
        settings={settings}
        flags={flags}
        adminUsers={adminUsers}
      />
    </div>
  );
}
