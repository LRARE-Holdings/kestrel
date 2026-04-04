import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/actions";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={user.email} role={user.role} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
