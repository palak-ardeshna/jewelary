"use client";
// Responsive admin shell: a fixed sidebar on desktop, an off-canvas drawer with
// a hamburger top bar on mobile/tablet. The sidebar content (brand, nav, logout)
// is passed in from the server layout.
import { useState } from "react";

export function AdminShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      {/* Sidebar — sticky column on desktop, drawer on mobile.
          Clicking anything inside (a nav link) closes the drawer. */}
      <aside className="admin-aside" data-open={open} onClick={() => setOpen(false)}>
        {sidebar}
      </aside>

      <div className="admin-content">
        {/* Mobile-only top bar with the menu button */}
        <div className="admin-topbar">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, width: 38, height: 38, cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
          >
            ☰
          </button>
          <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.2rem" }}>
            Aurelia<span style={{ color: "#d4af37" }}>.</span>
          </span>
        </div>

        <main className="admin-main">{children}</main>
      </div>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}
