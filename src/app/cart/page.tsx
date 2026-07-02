"use client";
import { useCart } from "@/components/CartProvider";
import { SmartImage } from "@/components/SmartImage";
import { Icon } from "@/components/Icon";
import Link from "next/link";

function fmt(p: number) {
  return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(p);
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"6rem 1rem", color:"var(--fg-muted)" }}>
        <div style={{ marginBottom:"1rem", color:"var(--fg-subtle)" }}><Icon name="bag" size={56} strokeWidth={1.25} /></div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Your cart is empty</h1>
        <p style={{ marginBottom:"2rem" }}>Looks like you haven't added anything yet.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration:"none" }}>Start Shopping →</Link>
      </div>
    );
  }

  const delivery = totalPrice >= 19900 ? 0 : 4900;
  const grandTotal = totalPrice + delivery;

  return (
    <div className="animate-fade-up">
      <h1 className="t-display" style={{ fontSize:"2.75rem", fontWeight:400, marginBottom:"2rem", letterSpacing:"-0.01em" }}>
        My Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})
      </h1>

      <div style={{ display:"grid", gap:"2rem", gridTemplateColumns:"1fr" }} className="cart-grid">
        {/* Items */}
        <div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"1rem" }}>
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} style={{ display:"flex", gap:"1.5rem", padding:"1.5rem 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ position:"relative", width:110, height:130, overflow:"hidden", background:"var(--surface-2)", flexShrink:0 }}>
                  {item.imageUrl && <SmartImage src={item.imageUrl} alt={item.name} fill style={{ objectFit:"cover" }} />}
                </div>
                <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <p className="t-h2" style={{ fontWeight:400, marginBottom:"0.5rem" }}>{item.name}</p>
                  {item.size && <p style={{ fontSize:"0.8rem", color:"var(--fg-muted)", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>Size: {item.size}</p>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
                    <span style={{ fontWeight:400, fontSize:"1.1rem" }}>{fmt(item.priceInPaise)}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <button onClick={() => updateQty(item.id, item.size, item.quantity - 1)} style={{ width:28, height:28, border:"1px solid var(--border)", background:"none", cursor:"pointer", fontSize:"1rem" }}>−</button>
                      <span style={{ fontWeight:400, minWidth:"1.5rem", textAlign:"center" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.size, item.quantity + 1)} style={{ width:28, height:28, border:"1px solid var(--border)", background:"none", cursor:"pointer", fontSize:"1rem" }}>+</button>
                      <button onClick={() => removeItem(item.id, item.size)} style={{ marginLeft:"1rem", color:"var(--fg-muted)", background:"none", border:"none", cursor:"pointer", fontSize:"0.8rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>Remove</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={clearCart} style={{ marginTop:"1rem", background:"none", border:"none", color:"var(--fg-muted)", fontSize:"0.875rem", cursor:"pointer", textDecoration:"underline" }}>Clear all items</button>
        </div>

        {/* Order summary */}
        <div style={{ padding:"2rem", background:"var(--surface)", border:"1px solid var(--border)", height:"fit-content", position:"sticky", top:"100px" }}>
          <h2 className="t-h2" style={{ fontSize:"1.5rem", fontWeight:400, marginBottom:"1.5rem" }}>Order Summary</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", fontSize:"0.95rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}><span>Subtotal</span><span>{fmt(totalPrice)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>Delivery</span>
              <span style={{ color: delivery === 0 ? "var(--success)" : "var(--fg)" }}>{delivery === 0 ? "FREE" : fmt(delivery)}</span>
            </div>
            {delivery > 0 && <p style={{ fontSize:"0.8rem", color:"var(--fg-muted)" }}>Add {fmt(19900 - totalPrice)} more for free delivery</p>}
          </div>
          <hr className="divider" style={{ margin:"1.5rem 0" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:400, fontSize:"1.25rem", marginBottom:"2rem" }}>
            <span>Total</span><span style={{ color:"var(--primary)" }}>{fmt(grandTotal)}</span>
          </div>
          <Link href="/checkout" className="btn-accent" style={{ display:"flex", width:"100%", textDecoration:"none", textAlign:"center" }}>
            Proceed to Checkout →
          </Link>
          <div style={{ marginTop:"1rem", display:"flex", flexDirection:"column", gap:"0.4rem" }}>
            {[["lock","Insured secure shipping"],["return","30-day returns"],["exchange","Lifetime exchange"]].map(([icon,t])=>(
              <p key={t} style={{ fontSize:"0.78rem", color:"var(--fg-muted)", display:"flex", alignItems:"center", gap:"0.45rem" }}><Icon name={icon} size={14} />{t}</p>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(min-width:768px){.cart-grid{grid-template-columns:1fr 340px !important;}}`}</style>
    </div>
  );
}
