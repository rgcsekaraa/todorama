import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/ClientDashboard";

export default async function DashboardPage() {
  const session = await auth(); // Server-side session validation

  if (!session) {
    redirect("/"); // Redirect to home if not authenticated
  }

  return (
    <div>
      <ClientDashboard />
    </div>
  );
}
