import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "./AdminNav";
import { AdminShell } from "./AdminShell";
import "@/app/admin/admin.css";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const sidebar = (
    <>
      <Link href="/admin" style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.4rem", color: "#fff", textDecoration: "none", padding: "0 0.5rem 1.25rem" }}>
        Aurelia<span style={{ color: "#d4af37" }}>.</span>
      </Link>
      <AdminNav />
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "1.5rem" }}>
        <Link href="/" style={{ padding: "0.6rem 0.75rem", color: "#a8a29e", textDecoration: "none", fontSize: "0.85rem" }}>← View store</Link>
        <form action={logoutAction}>
          <button type="submit" style={{ width: "100%", padding: "0.6rem 0.75rem", background: "#292524", color: "#fca5a5", border: "1px solid #44403c", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", textAlign: "left" }}>
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return <AdminShell sidebar={sidebar}>{children}</AdminShell>;
}
