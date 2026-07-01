"use client";
import { useCart } from "./CartProvider";
import Image from "next/image";
import Link from "next/link";

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p / 100);
}

export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, removeItem, updateQty, totalPrice, totalItems, clearCart } = useCart();

  if (!drawerOpen) return null;

  return (
    <>
      <div className="overlay animate-fade-in" onClick={() => setDrawerOpen(false)} />
      <div className="animate-slide-right" style={{
        position:"fixed", top:0, right:0, bottom:0, width:"min(420px,100vw)",
        background:"#fff", zIndex:50, display:"flex", flexDirection:"column",
        boxShadow:"-4px 0 24px rgb(0 0 0 / 0.15)",
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--border)" }}>
          <h2 style={{ fontSize:"1.125rem", fontWeight:700 }}>
            🛒 My Cart {totalItems > 0 && <span style={{ fontSize:"0.875rem", color:"var(--primary)", fontWeight:600 }}>({totalItems})</span>}
          </h2>
          <button onClick={() => setDrawerOpen(false)} style={{ fontSize:"1.5rem", background:"none", border:"none", cursor:"pointer", color:"var(--fg-muted)", lineHeight:1 }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"1rem 1.5rem" }}>
          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem 1rem", color:"var(--fg-muted)" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🛍️</div>
              <p style={{ fontWeight:600, marginBottom:"0.5rem" }}>Your cart is empty</p>
              <p style={{ fontSize:"0.875rem" }}>Add something you love!</p>
              <button onClick={() => setDrawerOpen(false)} className="btn-primary" style={{ marginTop:"1.5rem" }}>Continue Shopping</button>
            </div>
          ) : (
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"1rem" }}>
              {items.map((item) => (
                <li key={`${item.id}-${item.size}`} style={{ display:"flex", gap:"0.75rem", padding:"0.75rem", background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
                  <div style={{ width:72, height:72, borderRadius:"var(--radius-sm)", overflow:"hidden", background:"var(--surface-2)", flexShrink:0 }}>
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={72} height={72} style={{ objectFit:"cover", width:"100%", height:"100%" }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:"0.875rem", marginBottom:"0.25rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                    {item.size && <p style={{ fontSize:"0.75rem", color:"var(--fg-muted)", marginBottom:"0.5rem" }}>Size: {item.size}</p>}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontWeight:700, color:"var(--primary)" }}>{formatPrice(item.priceInPaise)}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                        <button onClick={() => updateQty(item.id, item.size, item.quantity - 1)} style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid var(--border)", background:"#fff", cursor:"pointer", fontWeight:700 }}>−</button>
                        <span style={{ fontWeight:600, minWidth:"1.5rem", textAlign:"center" }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.size, item.quantity + 1)} style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid var(--border)", background:"#fff", cursor:"pointer", fontWeight:700 }}>+</button>
                        <button onClick={() => removeItem(item.id, item.size)} style={{ marginLeft:"0.25rem", color:"var(--error)", background:"none", border:"none", cursor:"pointer", fontSize:"1rem" }}>🗑</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop:"1px solid var(--border)", padding:"1.25rem 1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem", fontSize:"1.125rem", fontWeight:700 }}>
              <span>Total</span>
              <span style={{ color:"var(--primary)" }}>{formatPrice(totalPrice)}</span>
            </div>
            <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn-accent" style={{ display:"flex", width:"100%", marginBottom:"0.75rem", textDecoration:"none" }}>
              Proceed to Checkout →
            </Link>
            <button onClick={clearCart} style={{ width:"100%", background:"none", border:"none", color:"var(--fg-muted)", fontSize:"0.875rem", cursor:"pointer", textDecoration:"underline" }}>Clear cart</button>
          </div>
        )}
      </div>
    </>
  );
}
