import Link from "next/link";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, inStock, categories, collections] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { inStock: true } }),
    prisma.category.count(),
    prisma.collection.count(),
  ]);

  const stats = [
    { label: "Products", value: products, href: "/admin/products", sub: `${inStock} in stock` },
    { label: "Categories", value: categories, href: "/admin/categories" },
    { label: "Collections", value: collections, href: "/admin/collections" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", marginBottom: "0.5rem" }}>Dashboard</h1>
      <p style={{ color: "#78716c", marginBottom: "2rem" }}>Manage the live catalogue. Changes appear on the storefront immediately.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.5rem" }}>
              <div style={{ fontSize: "2.25rem", fontWeight: 700, color: "#1c1917" }}>{s.value}</div>
              <div style={{ fontSize: "0.9rem", color: "#57534e" }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: "0.78rem", color: "#a8a29e", marginTop: "0.25rem" }}>{s.sub}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/admin/products/new" style={btn}>+ New product</Link>
        <Link href="/admin/collections" style={btnGhost}>+ New collection</Link>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding: "0.7rem 1.25rem", background: "#1c1917", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem" };
const btnGhost: React.CSSProperties = { padding: "0.7rem 1.25rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem" };
