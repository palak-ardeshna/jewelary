"use client";
// Storefront chrome (announcement bar, header, page container, footer).
// Suppressed on /admin so the engagement admin renders as a standalone app
// without the shop header/footer bleeding around its login/dashboard.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";

export function SiteChrome({
  children, headerAd, footerAd,
}: {
  children: React.ReactNode;
  headerAd?: React.ReactNode;
  footerAd?: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin runs chrome-free (it paints its own full-viewport surface).
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      {/* ── Announcement bar (scrolls away above the sticky header) ── */}
      <AnnouncementBar />

      {/* ── Header ── */}
      <Header />

      {/* ── Admin-managed header ad slot ── */}
      {headerAd}

      {/* ── Page ── */}
      <main id="main" style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "1.5rem 1.25rem 4rem" }}>
        {children}
      </main>

      {/* ── Admin-managed footer ad slot ── */}
      {footerAd}

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", marginTop: "auto", paddingTop: "4rem" }}>
        <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "0 1.25rem" }}>

          {/* Top Section: Newsletter & Trust */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "3rem", paddingBottom: "4rem", borderBottom: "1px solid var(--border-strong)" }}>
            <div style={{ maxWidth: 400 }}>
              <h3 className="t-h2" style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Join the Aurelia Society</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Sign up to receive insider access to new collections, early event invites, and exclusive editorial content.
              </p>
              <form style={{ display: "flex", gap: "0.5rem" }}>
                <input type="email" placeholder="Email address" style={{ flex: 1, padding: "0.75rem 1rem", border: "1px solid var(--border-strong)", background: "var(--bg)", outline: "none" }} />
                <button type="button" className="btn-primary" style={{ padding: "0.75rem 1.5rem", border: "none", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Subscribe</button>
              </form>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignContent: "start" }}>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.75rem", color: "var(--accent-dark)" }}>The Aurelia Standard</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--fg-muted)", fontSize: "0.9rem" }}>
                  <li>18K Solid Gold</li>
                  <li>VS+ Clarity Diamonds</li>
                  <li>Ethically Sourced</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.75rem", color: "var(--accent-dark)" }}>Trust & Assurance</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--fg-muted)", fontSize: "0.9rem" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Icon name="lock" size={14} /> IGI Certified</li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Icon name="return" size={14} /> 30-Day Returns</li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Icon name="bag" size={14} /> Insured Shipping</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Middle Section: Links — collapsible accordions on phones, open columns on desktop */}
          <div className="footer-links" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "3rem", padding: "4rem 0" }}>
            <div className="footer-brand">
              <p className="font-display" style={{ fontWeight: 400, fontSize: "1.8rem", color: "var(--primary)", marginBottom: "1rem", letterSpacing: "0.02em" }}>Aurelia</p>
              <p style={{ fontSize: "0.9rem", color: "var(--fg-muted)", lineHeight: 1.6, maxWidth: 280 }}>Design-led fine jewellery. Made to be worn. Built to last. Meant to be inherited.</p>
            </div>
            {([
              ["Shop", [["Engagement", "/engagement-rings"], ["Rings", "/rings"], ["Necklaces", "/necklaces"], ["Earrings", "/earrings"], ["Bracelets", "/bracelets"]]],
              ["Collections", [["Bridal Heritage", "/c/best-diamond-engagement-rings"], ["Everyday Gold", "/c/everyday-gold-under-200"], ["Solitaires", "/c/best-white-gold-diamond-jewellery"]]],
              ["Client Care", [["My Account", "/account"], ["Track Order", "/account/orders"], ["Returns & Exchanges", "/"], ["Ring Size Guide", "/"], ["Contact Us", "/"]]],
            ] as [string, [string, string][]][]).map(([heading, links]) => (
              <details key={heading} className="footer-col">
                <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.25rem" }}>
                  {heading}
                  <span className="footer-chevron" aria-hidden style={{ transition: "transform var(--dur-2) var(--ease-out)" }}>▾</span>
                </summary>
                <div className="footer-col-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {links.map(([l, h]) => (
                    <Link key={l} href={h} style={{ fontSize: "0.95rem", color: "var(--fg-muted)", textDecoration: "none", transition: "color 0.2s" }}>{l}</Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        <style>{`
          .footer-col summary::-webkit-details-marker { display: none; }
          .footer-chevron { display: none; }
          /* Desktop: force columns open (content visible regardless of the
             details toggle state) and remove the toggle affordance. */
          @media (min-width: 769px) {
            .footer-col > summary { pointer-events: none; }
            .footer-col .footer-col-body { display: flex !important; }
          }
          /* Phones: accordions collapse to save vertical space. */
          @media (max-width: 768px) {
            .footer-links { gap: 0 !important; padding: 2rem 0 !important; }
            .footer-brand { margin-bottom: 1.5rem; }
            .footer-col { border-top: 1px solid var(--border); }
            .footer-col > summary { padding: 1rem 0; margin-bottom: 0 !important; }
            .footer-chevron { display: inline; }
            .footer-col[open] .footer-chevron { transform: rotate(180deg); }
            .footer-col > div { padding-bottom: 1rem; }
          }
        `}</style>

        {/* Bottom Section: Copyright */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--fg-subtle)", background: "var(--bg)" }}>
          © {new Date().getFullYear()} Aurelia Fine Jewellery. All rights reserved. Prices in INR.
        </div>
      </footer>
    </>
  );
}
