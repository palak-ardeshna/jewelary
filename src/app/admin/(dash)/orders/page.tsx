import { prisma } from "@/server/db";
import { formatPrice } from "@/lib/site";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem" }}>
          Orders · ઓર્ડર <span style={{ color: "#a8a29e", fontSize: "1rem" }}>({orders.length})</span>
        </h1>
      </div>

      <div className="admin-table-wrap" style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "#faf8f5", textAlign: "left" }}>
              <th style={th}>Order ID (ઓર્ડર ID)</th>
              <th style={th}>Date (તારીખ)</th>
              <th style={th}>Customer (ગ્રાહક)</th>
              <th style={th}>Status (સ્થિતિ)</th>
              <th style={th}>Total (કુલ)</th>
              <th style={th}>Items (વસ્તુઓ)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const shipping = o.shippingAddress ? JSON.parse(o.shippingAddress) : null;
              const items = o.items ? JSON.parse(o.items) : [];
              return (
                <tr key={o.id} style={{ borderTop: "1px solid #f5f5f4" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{o.number}</div>
                  </td>
                  <td style={td}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{shipping?.name || o.email}</div>
                    <div style={{ color: "#78716c", fontSize: "0.8rem" }}>{o.email}</div>
                    {o.phone && <div style={{ color: "#78716c", fontSize: "0.8rem" }}>{o.phone}</div>}
                    {shipping && (
                      <div style={{ color: "#a8a29e", fontSize: "0.75rem", marginTop: "4px", lineHeight: 1.3 }}>
                        {shipping.line1}, {shipping.city}, {shipping.state} {shipping.pincode}
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: o.status === "DELIVERED" ? "#dcfce7" : o.status === "CANCELLED" ? "#fee2e2" : "#fef3c7",
                      color: o.status === "DELIVERED" ? "#166534" : o.status === "CANCELLED" ? "#991b1b" : "#92400e",
                    }}>
                      {o.status}
                    </span>
                    <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "#78716c" }}>
                      Payment: {o.paymentStatus}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{formatPrice(o.totalPaise, o.currencyCode)}</div>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {items.map((item: any, i: number) => (
                        <div key={i} style={{ fontSize: "0.8rem", color: "#44403c" }}>
                          • {item.quantity}x {item.name} 
                          {item.size ? ` (Size: ${item.size})` : ""}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p style={{ padding: "2rem", textAlign: "center", color: "#a8a29e" }}>No orders found (કોઈ ઓર્ડર મળ્યા નથી).</p>}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#78716c" };
const td: React.CSSProperties = { padding: "0.75rem 1rem", verticalAlign: "top" };
