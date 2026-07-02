import Link from "next/link";
import { Icon } from "@/components/Icon";
import { OrdersClient } from "@/components/OrdersClient";

export const metadata = { title: "My Orders | Aurelia" };

export default function OrdersPage() {
  return (
    <div className="animate-fade-up" style={{ padding: "4rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
      
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/account" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--fg-muted)", textDecoration: "none", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
          <Icon name="return" size={14} /> Back to Profile
        </Link>
      </div>

      <header style={{ marginBottom: "3rem" }}>
        <h1 className="t-display" style={{ fontSize: "2.5rem", fontWeight: 400, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>My Orders</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "1.1rem" }}>View and track your recent purchases.</p>
      </header>

      <OrdersClient />
    </div>
  );
}
