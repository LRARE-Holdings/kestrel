"use client";

import { useRouter } from "next/navigation";
import { AnnouncementTab } from "./announcement-tab";
import { FeatureFlagsTab } from "./feature-flags-tab";
import { SiteConfigTab } from "./site-config-tab";
import { AdminTeamTab } from "./admin-team-tab";
import type { AdminMember } from "@/lib/admin/admin-team-queries";

const TABS = [
  { key: "announcement", label: "Announcement" },
  { key: "flags", label: "Feature Flags" },
  { key: "config", label: "Site Config" },
  { key: "team", label: "Admin Team" },
] as const;

interface FeatureFlag {
  id: string;
  flag_key: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  activeTab: string;
  adminRole: string;
  adminId: string;
  settings: Record<string, unknown>;
  flags: FeatureFlag[];
  adminUsers: AdminMember[];
}

export function SettingsTabs({
  activeTab,
  adminRole,
  adminId,
  settings,
  flags,
  adminUsers,
}: Props) {
  const router = useRouter();
  const currentTab = TABS.find((t) => t.key === activeTab)
    ? activeTab
    : "announcement";

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-subtle mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => router.push(`/settings?tab=${tab.key}`)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              currentTab === tab.key
                ? "border-kestrel text-kestrel"
                : "border-transparent text-text-muted hover:text-ink hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {currentTab === "announcement" && (
        <AnnouncementTab settings={settings} />
      )}
      {currentTab === "flags" && <FeatureFlagsTab flags={flags} />}
      {currentTab === "config" && <SiteConfigTab settings={settings} />}
      {currentTab === "team" && (
        <AdminTeamTab
          adminUsers={adminUsers}
          adminRole={adminRole}
          currentAdminId={adminId}
        />
      )}
    </div>
  );
}
