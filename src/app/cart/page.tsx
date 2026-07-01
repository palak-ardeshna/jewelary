"use client";
import { useCart } from "@/components/CartProvider";
import Image from "next/image";
import Link from "next/link";

function fmt(p: number) {
  return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(p / 100);
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"6rem 1rem", color:"var(--fg-muted)" }}>
        <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🛍️</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Your cart is empty</h1>
        <p style={{ marginBottom:"2rem" }}>Looks like you haven't added anything yet.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration:"none" }}>Start Shopping →</Link>
      </div>
    );
  }

  const delivery = totalPrice >= 49900 ? 0 : 4900;
  const grandTotal = totalPrice + delivery;

  return (
    <div className="animate-fade-up">
      <h1 style={{ fontSize:"1.75rem", fontWeight:800, marginBottom:"1.5rem", letterSpacing:"-0.02em" }}>
        My Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})
      </h1>

      <div style={{ display:"grid", gap:"2rem", gridTemplateColumns:"1fr" }} className="cart-grid">
        {/* Items */}
        <div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"1rem" }}>
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} style={{ display:"flex", gap:"1rem", padding:"1rem", background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
                <div style={{ width:90, height:90, borderRadius:"var(--radius-sm)", overflow:"hidden", background:"var(--surface-2)", flexShrink:0 }}>
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={90} height={90} style={{ objectFit:"cover", width:"100%", height:"100%" }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, marginBottom:"0.25rem" }}>{item.name}</p>
                  {item.size && <p style={{ fontSize:"0.8rem", color:"var(--fg-muted)", marginBottom:"0.5rem" }}>Size: {item.size}</p>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
                    <span style={{ fontWeight:700, fontSize:"1.05rem", color:"var(--primary)" }}>{fmt(item.priceInPaise)}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <button onClick={() => updateQty(item.id, item.size, item.quantity - 1)} style={{ width:30, height:30, borderRadius:6, border:"1.5px solid var(--border)", background:"#fff", cursor:"pointer", fontWeight:700, fontSize:"1.1rem" }}>−</button>
                      <span style={{ fontWeight:600, minWidth:"1.5rem", textAlign:"center" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.size, item.quantity + 1)} style={{ width:30, height:30, borderRadius:6, border:"1.5px solid var(--border)", background:"#fff", cursor:"pointer", fontWeight:700, fontSize:"1.1rem" }}>+</button>
                      <button onClick={() => removeItem(item.id, item.size)} style={{ marginLeft:"0.5rem", color:"var(--error)", background:"none", border:"none", cursor:"pointer", fontSize:"0.875rem", fontWeight:600 }}>Remove</button>
                    </div>
                  </div>
                  <p style={{ fontSize:"0.8rem", color:"var(--fg-muted)", marginTop:"0.25rem" }}>
                    Subtotal: {fmt(item.priceInPaise * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={clearCart} style={{ marginTop:"1rem", background:"none", border:"none", color:"var(--fg-muted)", fontSize:"0.875rem", cursor:"pointer", textDecoration:"underline" }}>Clear all items</button>
        </div>

        {/* Order summary */}
        <div style={{ padding:"1.5rem", background:"var(--surface)", borderRadius:"var(--radius-lg)", border:"1px solid var(--border)", height:"fit-content" }}>
          <h2 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:"1rem" }}>Order Summary</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", fontSize:"0.9rem", marginBottom:"1rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}><span>Subtotal</span><span>{fmt(totalPrice)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>Delivery</span>
              <span style={{ color: delivery === 0 ? "var(--success)" : "var(--fg)" }}>{delivery === 0 ? "FREE" : fmt(delivery)}</span>
            </div>
            {delivery > 0 && <p style={{ fontSize:"0.8rem", color:"var(--fg-muted)" }}>Add {fmt(49900 - totalPrice)} more for free delivery</p>}
          </div>
          <hr className="divider" style={{ margin:"0.75rem 0" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:"1.1rem", marginBottom:"1.25rem" }}>
            <span>Total</span><span style={{ color:"var(--primary)" }}>{fmt(grandTotal)}</span>
          </div>
          <Link href="/checkout" className="btn-accent" style={{ display:"flex", width:"100%", textDecoration:"none", textAlign:"center" }}>
            Proceed to Checkout →
          </Link>
          <div style={{ marginTop:"1rem", display:"flex", flexDirection:"column", gap:"0.4rem" }}>
            {["🔒 Secure checkout","↩ 7-day easy returns","🚚 Free delivery above ₹499"].map(t=>(
              <p key={t} style={{ fontSize:"0.78rem", color:"var(--fg-muted)", display:"flex", gap:"0.4rem" }}>{t}</p>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(min-width:768px){.cart-grid{grid-template-columns:1fr 340px !important;}}`}</style>
    </div>
  );
}
