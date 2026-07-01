import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema-org";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { CartButton } from "@/components/CartButton";
import { AnnouncementBar } from "@/components/AnnouncementBar";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
};

const NAV_LINKS: [string, string][] = [
  ["Rings", "/rings"],
  ["Necklaces", "/necklaces"],
  ["Earrings", "/earrings"],
  ["Bangles", "/bangles"],
  ["Bridal", "/necklaces"],
  ["Gifts", "/gifts"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        {/* Google AdSense — must be in <head> for site verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3720190862522195"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ fontFamily: "var(--font-inter, Inter), ui-sans-serif, system-ui, sans-serif" }}>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <CartProvider>
          {/* ── Announcement bar (scrolls away above the sticky header) ── */}
          <AnnouncementBar />

          {/* ── Header ── */}
          <header style={{
            position:"sticky", top:0, zIndex:30,
            background:"rgba(255,255,255,0.95)", backdropFilter:"blur(10px)",
            borderBottom:"1px solid var(--border)", boxShadow:"var(--shadow-sm)",
          }}>
            <div className="hdr-inner">
              {/* Logo */}
              <Link href="/" className="hdr-logo" style={{ textDecoration:"none", flexShrink:0, display:"flex", flexDirection:"column", lineHeight:1 }}>
                <span className="font-display hdr-logo-name" style={{ fontWeight:600, fontSize:"1.7rem", color:"var(--primary)", letterSpacing:"0.02em" }}>
                  Aurelia
                </span>
                <span style={{ fontSize:"0.6rem", letterSpacing:"0.35em", textTransform:"uppercase", color:"var(--fg-muted)", marginTop:"0.1rem" }}>
                  Fine Jewellery
                </span>
              </Link>

              {/* Cart — stays top-right on every screen */}
              <div className="hdr-cart"><CartButton /></div>

              {/* Search bar */}
              <form action="/search" method="GET" className="hdr-search">
                <div style={{ position:"relative" }}>
                  <input
                    name="q"
                    type="search"
                    placeholder="Search rings, diamonds, gold chains…"
                    className="input"
                    style={{ paddingLeft:"2.5rem", fontSize:"0.875rem", height:40 }}
                  />
                  <span style={{ position:"absolute", left:"0.75rem", top:"50%", transform:"translateY(-50%)", color:"var(--fg-muted)", pointerEvents:"none" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </span>
                </div>
              </form>

              {/* Primary nav — horizontally scrollable on mobile */}
              <nav className="hdr-nav">
                {NAV_LINKS.map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontSize:"0.82rem", fontWeight:500, color:"var(--fg)", textDecoration:"none", letterSpacing:"0.02em", whiteSpace:"nowrap", padding:"0.4rem 0" }}>{label}</Link>
                ))}
              </nav>
            </div>
          </header>

          {/* ── Page ── */}
          <main style={{ maxWidth:1200, margin:"0 auto", padding:"1.5rem 1rem 4rem" }}>
            {children}
          </main>

          {/* ── Footer ── */}
          <footer style={{ borderTop:"1px solid var(--border)", background:"var(--surface)", marginTop:"auto" }}>
            <div style={{ maxWidth:1200, margin:"0 auto", padding:"3rem 1rem 2rem", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"2rem" }}>
              <div>
                <p className="font-display" style={{ fontWeight:600, fontSize:"1.5rem", color:"var(--primary)", marginBottom:"0.5rem", letterSpacing:"0.02em" }}>Aurelia</p>
                <p style={{ fontSize:"0.875rem", color:"var(--fg-muted)", lineHeight:1.6 }}>Certified fine jewellery — BIS-hallmarked gold &amp; platinum, IGI/GIA-certified diamonds. Crafted to be worn for a lifetime.</p>
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:"0.875rem", marginBottom:"0.75rem" }}>Shop</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                  {[["Rings","/rings"],["Engagement Rings","/engagement-rings"],["Necklaces","/necklaces"],["Earrings","/earrings"],["Bangles","/bangles"],["Gifts","/gifts"]].map(([l,h])=>(
                    <Link key={h} href={h} style={{ fontSize:"0.875rem", color:"var(--fg-muted)", textDecoration:"none" }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:"0.875rem", marginBottom:"0.75rem" }}>Collections</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                  {[["Engagement Rings","/c/best-diamond-engagement-rings"],["Everyday Gold","/c/everyday-gold-under-200"],["White Gold & Diamond","/c/best-white-gold-diamond-jewellery"]].map(([l,h])=>(
                    <Link key={h} href={h} style={{ fontSize:"0.875rem", color:"var(--fg-muted)", textDecoration:"none" }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:"0.875rem", marginBottom:"0.75rem" }}>The Aurelia Promise</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                  {["BIS Hallmark & Certification","Transparent Price Breakup","Lifetime Exchange","30-Day Returns","Book an Appointment"].map((t)=>(
                    <span key={t} style={{ fontSize:"0.875rem", color:"var(--fg-muted)", cursor:"pointer" }}>{t}</span>
                  ))}
                </div>
                <div style={{ marginTop:"1rem", display:"flex", gap:"0.5rem" }}>
                  <span className="badge badge-green">🔒 Insured shipping</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop:"1px solid var(--border)", padding:"1rem", textAlign:"center", fontSize:"0.8rem", color:"var(--fg-subtle)" }}>
              © 2026 Aurelia Fine Jewellery. All rights reserved.
            </div>
          </footer>

          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
