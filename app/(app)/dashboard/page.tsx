import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard/actions";
import { GreetingSplash } from "@/components/app/greeting-splash";
import { EmptyDashboard } from "@/components/app/dashboard/empty-state";
import { PopulatedDashboard } from "@/components/app/dashboard/populated-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Kestrel",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data?.profile) redirect("/sign-in");

  const hasData = data.disputes.length > 0 || data.documentCount > 0;
  const firstName = data.profile.display_name?.split(" ")[0] ?? "there";

  return (
    <>
      <GreetingSplash firstName={firstName} />

      <div>
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back, {firstName}.
        </p>
      </div>

      {hasData ? (
        <PopulatedDashboard
          disputes={data.disputes}
          recentDocuments={data.recentDocuments}
          documentCount={data.documentCount}
        />
      ) : (
        <EmptyDashboard />
      )}
    </>
  );
}
