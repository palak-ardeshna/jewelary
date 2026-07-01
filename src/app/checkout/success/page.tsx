import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Order Confirmed", robots: { index: false } };

export default function OrderSuccessPage() {
  const orderId = `AUR${Math.floor(100000 + Math.random() * 900000)}`;
  return (
    <div className="animate-fade-up" style={{ textAlign:"center", padding:"4rem 1rem", maxWidth:520, margin:"0 auto" }}>
      <div style={{ marginBottom:"1.25rem", color:"var(--success)", display:"flex", justifyContent:"center" }}><Icon name="success" size={64} strokeWidth={1.5} /></div>
      <h1 style={{ fontSize:"2rem", fontWeight:800, letterSpacing:"-0.03em", marginBottom:"0.5rem" }}>Order Confirmed</h1>
      <p style={{ color:"var(--fg-muted)", fontSize:"1.1rem", marginBottom:"1.5rem" }}>
        Thank you for shopping with Aurelia. Your order is being packed.
      </p>
      <div style={{ padding:"1.25rem 1.5rem", background:"var(--surface)", borderRadius:"var(--radius-lg)", border:"1px solid var(--border)", marginBottom:"2rem" }}>
        <p style={{ fontSize:"0.875rem", color:"var(--fg-muted)" }}>Order ID</p>
        <p style={{ fontWeight:700, fontSize:"1.25rem", color:"var(--primary)", fontFamily:"monospace" }}>{orderId}</p>
        <div style={{ fontSize:"0.875rem", color:"var(--fg-muted)", marginTop:"0.75rem", display:"flex", flexDirection:"column", gap:"0.4rem", alignItems:"center" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"0.45rem" }}><Icon name="mail" size={15} /> A confirmation has been sent to your email.</span>
          <span style={{ display:"flex", alignItems:"center", gap:"0.45rem" }}><Icon name="truck" size={15} /> Expected delivery in 3–5 business days.</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
        <Link href="/" className="btn-primary" style={{ textDecoration:"none" }}>Continue Shopping</Link>
        <Link href="/" className="btn-outline" style={{ textDecoration:"none" }}>Track Order</Link>
      </div>
    </div>
  );
}
