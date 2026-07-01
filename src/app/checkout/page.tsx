"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import { Icon } from "@/components/Icon";
import { useRouter } from "next/navigation";

function fmt(p: number) {
  return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(p / 100);
}

const STATES = ["Delhi","Mumbai","Bengaluru","Chennai","Hyderabad","Kolkata","Pune","Ahmedabad","Jaipur","Lucknow","Other"];

const STEPS = [
  { id: 1, label: "Contact" },
  { id: 2, label: "Shipping" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Review" },
] as const;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"", city:"", state:"Delhi", pin:"" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const delivery = totalPrice >= 19900 ? 0 : 4900;
  const grandTotal = totalPrice + delivery;

  // Per-step validation — only the fields on the current step are checked.
  function validateStep(s: number) {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "Name is required";
      if (!form.email.includes("@")) e.email = "Valid email required";
      if (form.phone.replace(/\D/g,"").length < 10) e.phone = "Valid 10-digit phone required";
    }
    if (s === 2) {
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!/^\d{6}$/.test(form.pin)) e.pin = "Valid 6-digit PIN code required";
    }
    return e;
  }

  function next() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => Math.min(4, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setStep(s => Math.max(1, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder() {
    // Final safety re-validation of every step before committing.
    const errs = { ...validateStep(1), ...validateStep(2) };
    if (Object.keys(errs).length) { setErrors(errs); setStep(errs.name || errs.email || errs.phone ? 1 : 2); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    clearCart();
    router.push("/checkout/success");
  }

  useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items.length, router]);

  if (items.length === 0) return null;

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label style={{ display:"block", fontWeight:600, fontSize:"0.875rem", marginBottom:"0.375rem" }}>{label}</label>
      <input
        type={type} className="input" placeholder={placeholder}
        value={form[key]}
        onChange={e => { setForm(f=>({...f,[key]:e.target.value})); setErrors(err=>({...err,[key]:""})); }}
        onKeyDown={e => { if (e.key === "Enter" && step < 4) { e.preventDefault(); next(); } }}
      />
      {errors[key] && <p style={{ color:"var(--error)", fontSize:"0.78rem", marginTop:"0.25rem" }}>{errors[key]}</p>}
    </div>
  );

  const cardStyle: React.CSSProperties = { padding:"clamp(1.15rem, 4vw, 1.75rem)", background:"var(--surface)", borderRadius:"var(--radius-lg)", border:"1px solid var(--border)" };
  const rowStyle: React.CSSProperties = { display:"flex", justifyContent:"space-between", gap:"1rem", fontSize:"0.875rem" };

  return (
    <div className="animate-fade-up">
      <h1 className="font-display" style={{ fontSize:"2.25rem", fontWeight:500, marginBottom:"1.5rem" }}>Checkout</h1>

      {/* ── Step progress indicator ── */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:"2rem", maxWidth:640 }}>
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? 1 : "0 0 auto" }}>
              <button
                type="button"
                onClick={() => { if (s.id < step) setStep(s.id); }}
                style={{
                  display:"flex", alignItems:"center", gap:"0.5rem", background:"none", border:"none",
                  cursor: s.id < step ? "pointer" : "default", padding:0,
                }}
              >
                <span style={{
                  width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.85rem", fontWeight:700, flexShrink:0,
                  background: done ? "var(--accent)" : active ? "var(--primary)" : "var(--surface-2)",
                  color: done || active ? "#fff" : "var(--fg-muted)",
                  border: active ? "2px solid var(--accent)" : "2px solid transparent",
                  transition:"all 0.2s",
                }}>
                  {done ? <Icon name="check" size={16} /> : s.id}
                </span>
                <span style={{ fontSize:"0.82rem", fontWeight: active ? 700 : 500, color: active ? "var(--fg)" : "var(--fg-muted)", letterSpacing:"0.02em" }} className="step-label">
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="step-rail" style={{ flex:1, height:2, margin:"0 0.75rem", background: step > s.id ? "var(--accent)" : "var(--border)", transition:"background 0.2s" }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid", gap:"2rem", gridTemplateColumns:"1fr" }} className="checkout-grid">
        {/* Left: current step */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

          {/* Step 1 — Contact */}
          {step === 1 && (
            <div style={cardStyle} className="animate-fade-up">
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:"1.25rem" }}>Contact Information</h2>
              <div style={{ display:"grid", gap:"1rem", gridTemplateColumns:"1fr 1fr" }} className="field-grid">
                {field("Full Name","name","text","Riya Sharma")}
                {field("Email","email","email","riya@example.com")}
              </div>
              <div style={{ marginTop:"1rem" }}>{field("Phone","phone","tel","9876543210")}</div>
            </div>
          )}

          {/* Step 2 — Shipping */}
          {step === 2 && (
            <div style={cardStyle} className="animate-fade-up">
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:"1.25rem" }}>Shipping Address</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {field("House / Flat / Street","address","text","123, Lajpat Nagar")}
                <div style={{ display:"grid", gap:"1rem", gridTemplateColumns:"1fr 1fr" }} className="field-grid">
                  {field("City","city","text","New Delhi")}
                  <div>
                    <label style={{ display:"block", fontWeight:600, fontSize:"0.875rem", marginBottom:"0.375rem" }}>State</label>
                    <select className="input" value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}>
                      {STATES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {field("PIN Code","pin","text","110024")}
              </div>
            </div>
          )}

          {/* Step 3 — Payment (Cash on Delivery only) */}
          {step === 3 && (
            <div style={cardStyle} className="animate-fade-up">
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:"1.25rem" }}>Payment Method</h2>
              <label style={{ display:"flex", alignItems:"center", gap:"0.9rem", padding:"1.1rem 1.15rem", borderRadius:"var(--radius)", border:"2px solid var(--accent)", background:"var(--surface-2)", cursor:"default", fontWeight:600 }}>
                <input type="radio" name="payment" checked readOnly style={{ accentColor:"var(--accent)" }} />
                <Icon name="wallet" size={22} style={{ color:"var(--accent-dark)" }} />
                <span>
                  <span style={{ display:"block", fontSize:"0.95rem" }}>Cash on Delivery</span>
                  <span style={{ display:"block", fontSize:"0.8rem", color:"var(--fg-muted)", fontWeight:500, marginTop:"0.15rem" }}>
                    Pay in cash when your jewellery is delivered to your door.
                  </span>
                </span>
              </label>
              <div style={{ marginTop:"1rem", padding:"0.9rem 1rem", background:"var(--bg)", border:"1px dashed var(--border-strong)", borderRadius:"var(--radius)", fontSize:"0.82rem", color:"var(--fg-muted)", lineHeight:1.6, display:"flex", gap:"0.5rem", alignItems:"flex-start" }}>
                <Icon name="lock" size={15} style={{ marginTop:"0.15rem" }} /><span>Every order ships fully insured and tamper-proof. Please keep the exact amount ready — our delivery partner accepts cash only.</span>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }} className="animate-fade-up">
              <div style={cardStyle}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                  <h2 style={{ fontSize:"1rem", fontWeight:700 }}>Contact</h2>
                  <button type="button" onClick={()=>setStep(1)} style={{ background:"none", border:"none", color:"var(--accent-dark)", fontWeight:600, fontSize:"0.82rem", cursor:"pointer" }}>Edit</button>
                </div>
                <p style={{ fontSize:"0.9rem", color:"var(--fg-muted)", lineHeight:1.6 }}>{form.name}<br />{form.email}<br />{form.phone}</p>
              </div>
              <div style={cardStyle}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                  <h2 style={{ fontSize:"1rem", fontWeight:700 }}>Shipping Address</h2>
                  <button type="button" onClick={()=>setStep(2)} style={{ background:"none", border:"none", color:"var(--accent-dark)", fontWeight:600, fontSize:"0.82rem", cursor:"pointer" }}>Edit</button>
                </div>
                <p style={{ fontSize:"0.9rem", color:"var(--fg-muted)", lineHeight:1.6 }}>{form.address}, {form.city}, {form.state} — {form.pin}</p>
              </div>
              <div style={cardStyle}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                  <h2 style={{ fontSize:"1rem", fontWeight:700 }}>Payment</h2>
                  <button type="button" onClick={()=>setStep(3)} style={{ background:"none", border:"none", color:"var(--accent-dark)", fontWeight:600, fontSize:"0.82rem", cursor:"pointer" }}>Edit</button>
                </div>
                <p style={{ fontSize:"0.9rem", color:"var(--fg-muted)", display:"flex", alignItems:"center", gap:"0.4rem" }}><Icon name="wallet" size={15} /> Cash on Delivery</p>
              </div>
            </div>
          )}

          {/* ── Step navigation ── */}
          <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }} className="checkout-nav">
            {step > 1 && (
              <button type="button" className="btn-outline" onClick={back} disabled={loading}>← Back</button>
            )}
            {step < 4 && (
              <button type="button" className="btn-primary" onClick={next} style={{ marginLeft:"auto" }}>
                Continue →
              </button>
            )}
            {step === 4 && (
              <button type="button" className="btn-accent" onClick={placeOrder} disabled={loading} style={{ marginLeft:"auto", fontSize:"1rem", padding:"0.9rem 1.75rem" }}>
                {loading ? <span className="animate-spin" style={{ display:"inline-block" }}>⏳</span> : `Place Order (COD) — ${fmt(grandTotal)}`}
              </button>
            )}
          </div>
        </div>

        {/* Right: order summary (always visible) */}
        <div style={{ ...cardStyle, height:"fit-content" }} className="checkout-summary">
          <h2 style={{ fontSize:"1rem", fontWeight:700, marginBottom:"1rem" }}>Order Summary</h2>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1rem" }}>
            {items.map(item=>(
              <li key={`${item.id}-${item.size}`} style={rowStyle}>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"60%" }}>{item.name}{item.size?` (${item.size})`:""} ×{item.quantity}</span>
                <span style={{ fontWeight:600 }}>{fmt(item.priceInPaise*item.quantity)}</span>
              </li>
            ))}
          </ul>
          <hr className="divider" style={{ margin:"0.75rem 0" }} />
          <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem", fontSize:"0.875rem", marginBottom:"1rem" }}>
            <div style={rowStyle}><span>Subtotal</span><span>{fmt(totalPrice)}</span></div>
            <div style={rowStyle}><span>Delivery</span><span style={{ color: delivery===0?"var(--success)":"var(--fg)" }}>{delivery===0?"FREE":fmt(delivery)}</span></div>
          </div>
          <hr className="divider" style={{ margin:"0.75rem 0" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:"1.1rem" }}>
            <span>Total</span><span style={{ color:"var(--accent-dark)" }}>{fmt(grandTotal)}</span>
          </div>
          <p style={{ fontSize:"0.78rem", color:"var(--fg-muted)", textAlign:"center", marginTop:"1rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.4rem" }}><Icon name="lock" size={13} /> Insured shipping · Cash on Delivery</p>
        </div>
      </div>

      <style>{`
        @media(min-width:768px){
          .checkout-grid{ grid-template-columns:1fr 340px !important; }
          .checkout-summary{ position:sticky; top:5.5rem; }
        }
        /* Phones: hide step labels, single-column fields, and stack the nav
           buttons full-width so the long "Place Order" button never overflows. */
        @media(max-width:560px){
          .step-label{ display:none; }
          .field-grid{ grid-template-columns:1fr !important; }
          .checkout-nav{ flex-direction:column-reverse; align-items:stretch; gap:0.6rem; }
          .checkout-nav > button{ width:100%; margin-left:0 !important; }
          .checkout-nav .btn-accent{ padding:0.9rem 1rem !important; }
        }
        /* Very small phones: tighten the step indicator so 4 dots + rails fit. */
        @media(max-width:380px){
          .step-rail{ margin:0 0.4rem !important; }
        }
      `}</style>
    </div>
  );
}
