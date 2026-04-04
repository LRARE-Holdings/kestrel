import { getAdminUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { DiscoverForm } from "./discover-form";

export default async function DiscoverLeadsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">
          Discover Leads
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Search for businesses using Google Places and add them to your
          pipeline.
        </p>
      </div>
      <DiscoverForm />
    </div>
  );
}
