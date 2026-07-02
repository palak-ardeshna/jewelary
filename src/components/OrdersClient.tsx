"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/lib/site";
import { SmartImage } from "@/components/SmartImage";

export function OrdersClient() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("aurelia_orders");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) setOrders(list);
      } catch (e) {}
    }
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "50vh" }} />; // skeleton
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "center", color: "var(--fg-subtle)", marginBottom: "1.5rem" }}>
          <Icon name="bag" size={48} strokeWidth={1} />
        </div>
        <h2 className="t-h2" style={{ fontSize: "1.5rem", fontWeight: 400, marginBottom: "1rem" }}>No orders yet</h2>
        <p style={{ color: "var(--fg-muted)", marginBottom: "2rem" }}>When you place an order, it will appear here.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none", padding: "0.8rem 2rem" }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          {/* Order Header */}
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", background: "var(--surface-2)" }}>
            <div>
              <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)", marginBottom: "0.25rem" }}>Order ID</p>
              <p style={{ fontWeight: 600, color: "var(--primary)" }}>{order.id}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)", marginBottom: "0.25rem" }}>Date</p>
              <p>{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)", marginBottom: "0.25rem" }}>Total</p>
              <p style={{ fontWeight: 600 }}>{formatPrice(order.total, "INR")}</p>
            </div>
            <div>
              <span className="badge" style={{ background: "var(--accent-light)", color: "var(--accent-dark)", padding: "0.4rem 0.8rem" }}>{order.status || "Processing"}</span>
            </div>
          </div>
          
          {/* Order Items */}
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {order.items.map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ position: "relative", width: 80, height: 80, background: "var(--surface-2)", flexShrink: 0 }}>
                  {item.imageUrl && (
                    <SmartImage src={item.imageUrl} alt={item.name} fill style={{ objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Link href={`/products/${item.slug}`} style={{ textDecoration: "none", color: "inherit", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                    {item.name}
                  </Link>
                  <p style={{ fontSize: "0.9rem", color: "var(--fg-muted)" }}>
                    {item.size ? `Size: ${item.size}` : "One Size"}
                  </p>
                </div>
                <div style={{ textAlign: "right", fontWeight: 500 }}>
                  {formatPrice(item.priceInPaise, item.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
