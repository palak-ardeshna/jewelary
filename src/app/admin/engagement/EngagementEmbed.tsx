"use client";
// Re-exposes the existing engagement-config editor inside the authenticated
// admin. The editor itself still persists to localStorage / config.ts (its
// original design); real catalog data lives in the DB via the other admin pages.
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/components/engagement/engagement.css";
import { AdminDashboard } from "@/app/admin/AdminDashboard";

export function EngagementEmbed() {
  const router = useRouter();
  return (
    <div>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, background: "#1c1917", color: "#fff", padding: "0.5rem 1rem", display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.85rem" }}>
        <Link href="/admin" style={{ color: "#d4af37", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: "#a8a29e" }}>Engagement config editor</span>
      </div>
      <div style={{ paddingTop: "2.5rem" }}>
        <AdminDashboard onLogout={() => router.push("/admin")} />
      </div>
    </div>
  );
}
