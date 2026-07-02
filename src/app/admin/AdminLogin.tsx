"use client";
// Luxury split-screen login gate for the demo admin. Left: dark branded panel.
// Right: the form. Collapses to a single column on mobile. Client-side
// credential check (static build) — see docs/engagement.md.
import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/engagement/adminAuth";
import { Icon } from "@/components/Icon";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(user, pass)) { setErr(false); onSuccess(); }
    else setErr(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem 1rem", background: "#fff",
    border: `1px solid ${err ? "var(--error)" : "var(--border-strong)"}`,
    outline: "none", fontSize: "0.92rem", color: "var(--fg)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, overflowY: "auto", background: "#0c0a09" }}>
      <div className="admin-login-grid" style={{ minHeight: "100%", display: "grid" }}>

        {/* ── Brand panel ── */}
        <aside className="admin-login-brand" style={{
          position: "relative", overflow: "hidden", color: "#faf8f5",
          background: "radial-gradient(120% 120% at 0% 0%, #2a2420 0%, #1c1917 45%, #0c0a09 100%)",
          padding: "3.5rem 3rem", display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          {/* Decorative gold glow + hairline */}
          <div aria-hidden style={{ position: "absolute", top: -120, right: -120, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,.22), transparent 70%)" }} />
          <div aria-hidden style={{ position: "absolute", left: "3rem", right: "3rem", top: "50%", height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,110,.5), transparent)" }} />

          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600 }}>Aurelia</p>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,248,245,.55)", marginTop: "0.3rem" }}>Fine Jewellery</p>
          </div>

          <div style={{ position: "relative" }}>
            <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", lineHeight: 1.05, fontWeight: 500 }}>
              Engagement<br />Studio
            </h1>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(250,248,245,.7)", maxWidth: 340, marginTop: "1.1rem" }}>
              Control every popup, offer, upsell and social-proof moment across the storefront — from one refined console.
            </p>
          </div>

          <ul style={{ position: "relative", listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {["Popups, offers & A/B experiments", "Cart & conversion boosters", "Real-inventory social proof"].map((t) => (
              <li key={t} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: "rgba(250,248,245,.8)" }}>
                <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "rgba(201,169,110,.16)", color: "var(--accent)", flexShrink: 0 }}>
                  <Icon name="check" size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Form panel ── */}
        <main style={{ background: "#faf8f5", display: "flex", padding: "2.5rem 1.5rem" }}>
          <div className="eng-anim-fade" style={{ margin: "auto", width: "min(380px, 100%)" }}>
            <span style={{ display: "inline-flex", width: 46, height: 46, borderRadius: "50%", background: "#fff", border: "1px solid var(--border-strong)", color: "var(--accent-dark)", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Icon name="lock" size={19} />
            </span>
            <h2 className="font-display" style={{ fontSize: "1.9rem", lineHeight: 1.1 }}>Welcome back</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--fg-muted)", marginTop: "0.35rem", marginBottom: "1.75rem" }}>Sign in to manage engagement features.</p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: "0.4rem", fontWeight: 600 }}>Username</span>
                <input autoFocus type="text" value={user} onChange={(e) => { setUser(e.target.value); setErr(false); }} style={inputStyle} placeholder="admin" />
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: "0.4rem", fontWeight: 600 }}>Password</span>
                <div style={{ position: "relative" }}>
                  <input type={show ? "text" : "password"} value={pass} onChange={(e) => { setPass(e.target.value); setErr(false); }} style={{ ...inputStyle, paddingRight: "3.25rem" }} placeholder="••••••••" />
                  <button type="button" onClick={() => setShow((v) => !v)}
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent-dark)", fontWeight: 600 }}>
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {err && (
                <p style={{ color: "var(--error)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
                  <Icon name="alert" size={14} /> Invalid username or password.
                </p>
              )}

              <button type="submit" className="btn-primary btn-block" style={{ marginTop: "0.4rem" }}>Sign in</button>
            </form>

            <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <Link href="/" style={{ fontSize: "0.82rem", color: "var(--fg-muted)", textDecoration: "none" }}>← Back to storefront</Link>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .admin-login-grid { grid-template-columns: 1.05fr 0.95fr; }
        @media (max-width: 860px) {
          .admin-login-grid { grid-template-columns: 1fr; }
          .admin-login-brand { display: none !important; }
        }
      `}</style>
    </div>
  );
}
