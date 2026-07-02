import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FireworksConfetti } from "@/components/Confetti";

export const metadata = { title: "Order Confirmed", robots: { index: false } };

export default function OrderSuccessPage() {
  const orderId = `AUR${Math.floor(100000 + Math.random() * 900000)}`;
  return (
    <div className="animate-fade-up" style={{ textAlign:"center", padding:"6rem 1.5rem", maxWidth:580, margin:"0 auto" }}>
      <FireworksConfetti />
      <div style={{ marginBottom:"1.5rem", color:"var(--primary)", display:"flex", justifyContent:"center" }}><Icon name="success" size={72} strokeWidth={1} /></div>
      <h1 className="t-display" style={{ fontSize:"2.75rem", fontWeight:400, letterSpacing:"-0.02em", marginBottom:"1rem" }}>Order Confirmed</h1>
      <p style={{ color:"var(--fg-muted)", fontSize:"1.1rem", marginBottom:"2rem", lineHeight:1.6 }}>
        Thank you for choosing Aurelia. Your exquisite piece is being prepared with the utmost care.
      </p>
      
      <div style={{ padding:"2rem", background:"var(--surface)", border:"1px solid var(--border)", marginBottom:"2.5rem" }}>
        <p style={{ fontSize:"0.85rem", color:"var(--fg-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"0.5rem" }}>Order ID</p>
        <p style={{ fontWeight:400, fontSize:"1.5rem", color:"var(--primary)", letterSpacing:"0.1em", marginBottom:"1.5rem" }}>{orderId}</p>
        
        <div style={{ fontSize:"0.95rem", color:"var(--fg-muted)", display:"flex", flexDirection:"column", gap:"0.75rem", alignItems:"center", borderTop:"1px solid var(--border)", paddingTop:"1.5rem" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <Icon name="mail" size={18} style={{ color:"var(--accent-dark)" }} /> 
            <strong style={{ color:"var(--fg)", fontWeight:500 }}>Order confirmation updated in your mail.</strong>
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <Icon name="truck" size={18} style={{ color:"var(--accent-dark)" }} /> 
            Expected delivery in 3–5 business days.
          </span>
        </div>
      </div>
      
      <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
        <Link href="/" className="btn-primary" style={{ textDecoration:"none", padding:"1rem 2rem", fontSize:"1rem" }}>Continue Shopping</Link>
      </div>
    </div>
  );
}
