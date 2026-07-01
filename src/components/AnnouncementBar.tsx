"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/site";

// Luxury announcement bar: onyx ground, gold hairline, one message at a time with
// a slow crossfade. Service/trust messaging only — no discount countdowns.
// Dismissible; the choice persists for the session. Respects reduced-motion.
export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("aurelia-annc") === "off") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (dismissed || ANNOUNCEMENTS.length < 2) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), reduce ? 6000 : 4200);
    return () => clearInterval(t);
  }, [dismissed]);

  if (dismissed || ANNOUNCEMENTS.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Announcements"
      style={{
        position: "relative", background: "var(--onyx-800, #2a2420)", color: "var(--ivory, #faf8f5)",
        borderBottom: "1px solid rgba(176,141,79,0.5)", // gold hairline
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", height: 38, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Crossfading messages — all mounted, only the active one visible for a11y-safe swap. */}
        <div style={{ position: "relative", height: "1.1rem", width: "100%", textAlign: "center" }}>
          {ANNOUNCEMENTS.map((msg, idx) => (
            <span
              key={msg}
              aria-hidden={idx !== i}
              style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500,
                opacity: idx === i ? 0.92 : 0,
                transition: "opacity 800ms cubic-bezier(.22,1,.36,1)",
                pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {msg}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => { setDismissed(true); try { sessionStorage.setItem("aurelia-annc", "off"); } catch {} }}
          aria-label="Dismiss announcements"
          style={{
            position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: "var(--gold-soft, #d9c3a0)", cursor: "pointer",
            fontSize: "1rem", lineHeight: 1, padding: "0.25rem", opacity: 0.8,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
