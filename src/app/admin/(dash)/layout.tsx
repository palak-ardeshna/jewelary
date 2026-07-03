import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { logoutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/engagement", label: "Engagement" },
];

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh", background: "#faf8f5" }}>
      <aside style={{ background: "#1c1917", color: "#e7e5e4", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Link href="/admin" style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.4rem", color: "#fff", textDecoration: "none", padding: "0 0.5rem 1.25rem" }}>
          Aurelia<span style={{ color: "#d4af37" }}>.</span>
        </Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} style={{ padding: "0.6rem 0.75rem", borderRadius: 8, color: "#d6d3d1", textDecoration: "none", fontSize: "0.9rem" }}>
            {n.label}
          </Link>
        ))}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "1.5rem" }}>
          <Link href="/" style={{ padding: "0.6rem 0.75rem", color: "#a8a29e", textDecoration: "none", fontSize: "0.85rem" }}>← View store</Link>
          <form action={logoutAction}>
            <button type="submit" style={{ width: "100%", padding: "0.6rem 0.75rem", background: "#292524", color: "#fca5a5", border: "1px solid #44403c", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", textAlign: "left" }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main style={{ padding: "2.5rem 3rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
