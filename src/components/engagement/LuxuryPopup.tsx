"use client";
// Presentational popup shell. Layout, copy, imagery, animation, accent and the
// optional email field are all driven by the admin's PopupDesign — this file has
// no feature-specific logic, so every popup kind reuses it.
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { PopupDesign, Offer } from "@/lib/engagement/types";

interface Props {
  design: PopupDesign;
  offer?: Offer;
  onPrimary: (email?: string) => void;
  onSecondary: () => void;
  onDismiss: () => void;
  /** Set once the user converts — reveals the coupon code inline. */
  revealedCode?: string;
}

export function LuxuryPopup({ design, offer, onPrimary, onSecondary, onDismiss, revealedCode }: Props) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(false);
  const accent = design.accent ?? "var(--accent)";
  const dark = design.dark;

  const bg = dark ? "#1c1917" : "#fff";
  const fg = dark ? "#faf8f5" : "var(--fg)";
  const muted = dark ? "rgba(250,248,245,.7)" : "var(--fg-muted)";

  function submit() {
    if (design.emailCapture) {
      const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      if (!ok) { setErr(true); return; }
    }
    onPrimary(design.emailCapture ? email : undefined);
  }

  // Positioning per layout.
  const positional: React.CSSProperties =
    design.layout === "corner-card"
      ? { position: "fixed", right: "1.5rem", bottom: "1.5rem", width: "min(360px, calc(100vw - 2rem))", zIndex: 201 }
      : design.layout === "bottom-sheet"
      ? { position: "fixed", left: 0, right: 0, bottom: 0, width: "100%", zIndex: 201 }
      : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(460px, calc(100vw - 2rem))", zIndex: 201 };

  const animClass =
    design.animation === "slide-up" ? "eng-anim-slide-up"
    : design.animation === "slide-right" ? "eng-anim-slide-right"
    : design.animation === "fade" ? "eng-anim-fade"
    : design.layout === "center-modal" ? "eng-anim-fade-scale"
    : "eng-anim-slide-up";

  const isModal = design.layout === "center-modal" || design.layout === "bottom-sheet";

  return (
    <>
      {isModal && <div className="eng-overlay" onClick={onDismiss} aria-hidden />}
      <div
        role="dialog"
        aria-modal={isModal}
        aria-label={design.heading}
        className={animClass}
        style={{
          ...positional,
          background: bg, color: fg,
          border: `1px solid ${dark ? "rgba(201,169,110,.35)" : "var(--border-strong)"}`,
          boxShadow: "var(--shadow-lg)",
          padding: design.layout === "corner-card" ? "1.5rem" : "2.5rem 2.25rem",
        }}
      >
        <button
          type="button" onClick={onDismiss} aria-label="Dismiss"
          style={{ position: "absolute", top: ".75rem", right: ".75rem", background: "none", border: "none", cursor: "pointer", color: muted, display: "inline-flex", padding: ".25rem" }}
        >
          <Icon name="x" size={18} />
        </button>

        {design.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={design.imageUrl} alt="" style={{ width: "100%", height: 140, objectFit: "cover", marginBottom: "1.25rem" }} />
        )}

        {design.eyebrow && (
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: accent, fontWeight: 600, marginBottom: "0.6rem" }}>
            {design.eyebrow}
          </p>
        )}
        <h2 className="font-display" style={{ fontSize: design.layout === "corner-card" ? "1.5rem" : "1.9rem", lineHeight: 1.15, marginBottom: "0.6rem", color: fg }}>
          {design.heading}
        </h2>
        {design.body && (
          <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: muted, marginBottom: "1.25rem" }}>{design.body}</p>
        )}

        {revealedCode ? (
          <div style={{ textAlign: "center", padding: "1rem", border: `1px dashed ${accent}`, marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
              {offer?.label ?? "Your code"}
            </p>
            <p className="font-display" style={{ fontSize: "1.75rem", letterSpacing: "0.14em", color: accent, fontWeight: 600 }}>{revealedCode}</p>
          </div>
        ) : (
          <>
            {design.emailCapture && (
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="email" value={email} placeholder="Email address"
                  onChange={(e) => { setEmail(e.target.value); setErr(false); }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  style={{ width: "100%", padding: "0.85rem 1rem", background: dark ? "#0c0a09" : "var(--bg)", color: fg, border: `1px solid ${err ? "var(--error)" : dark ? "rgba(250,248,245,.25)" : "var(--border-strong)"}`, outline: "none", fontSize: "0.9rem" }}
                />
                {err && <p style={{ color: "var(--error)", fontSize: "0.78rem", marginTop: "0.35rem" }}>Please enter a valid email.</p>}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {design.primaryCta.href ? (
                <Link href={design.primaryCta.href} onClick={() => onPrimary()} className="btn-primary btn-block" style={{ textAlign: "center", background: accent, borderColor: accent, color: "#1c1917" }}>
                  {design.primaryCta.label}
                </Link>
              ) : (
                <button type="button" onClick={submit} className="btn-primary btn-block" style={{ background: accent, borderColor: accent, color: "#1c1917" }}>
                  {design.primaryCta.label}
                </button>
              )}
              {design.secondaryCta && (
                <button type="button" onClick={onSecondary} style={{ background: "none", border: "none", color: muted, fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline", padding: "0.25rem" }}>
                  {design.secondaryCta.label}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
