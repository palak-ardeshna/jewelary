import Link from "next/link";
import { prisma } from "@/server/db";
import { formatPrice } from "@/lib/site";
import { deleteProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem" }}>Products <span style={{ color: "#a8a29e", fontSize: "1rem" }}>({products.length})</span></h1>
        <Link href="/admin/products/new" style={{ padding: "0.65rem 1.25rem", background: "#1c1917", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem" }}>+ New product</Link>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "#faf8f5", textAlign: "left" }}>
              <th style={th}>Name</th>
              <th style={th}>Category</th>
              <th style={th}>Price</th>
              <th style={th}>Stock</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f5f5f4" }}>
                <td style={td}>
                  <Link href={`/admin/products/${p.id}`} style={{ color: "#1c1917", fontWeight: 500, textDecoration: "none" }}>{p.name}</Link>
                  <div style={{ color: "#a8a29e", fontSize: "0.75rem" }}>/{p.slug}</div>
                </td>
                <td style={td}>{p.category.name}</td>
                <td style={td}>{formatPrice(p.priceInPaise, p.currency)}</td>
                <td style={td}>
                  {p.inStock
                    ? <span style={{ color: "#16a34a" }}>In stock{p.stockUnits != null ? ` (${p.stockUnits})` : ""}</span>
                    : <span style={{ color: "#dc2626" }}>Out</span>}
                </td>
                <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                  <Link href={`/admin/products/${p.id}`} style={{ color: "#2563eb", textDecoration: "none", marginRight: "1rem" }}>Edit</Link>
                  <form action={deleteProduct} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.88rem", padding: 0 }}>Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p style={{ padding: "2rem", textAlign: "center", color: "#a8a29e" }}>No products yet.</p>}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#78716c" };
const td: React.CSSProperties = { padding: "0.75rem 1rem", verticalAlign: "top" };
