"use client";
// Re-exposes the existing engagement-config editor inside the authenticated
// admin. The editor renders its own full-viewport chrome (position:fixed), so
// we render it directly — it has a "← Admin" link in its top bar to get back.
import { useRouter } from "next/navigation";
import "@/components/engagement/engagement.css";
import { AdminDashboard } from "@/app/admin/AdminDashboard";

export function EngagementEmbed() {
  const router = useRouter();
  return <AdminDashboard onLogout={() => router.push("/admin")} />;
}
