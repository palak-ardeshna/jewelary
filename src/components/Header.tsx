"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "@/components/Icon";
import { CartButton } from "@/components/CartButton";

const NAV_LINKS = [
  ["Rings", "/rings"],
  ["Necklaces", "/necklaces"],
  ["Earrings", "/earrings"],
  ["Bangles", "/bangles"],
  ["Bridal", "/c/best-diamond-engagement-rings"],
  ["Gifts", "/gifts"],
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header style={{
        position:"sticky", top:0, zIndex:40,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all var(--dur-3) var(--ease-out)",
        color: (pathname === "/" && !scrolled && !mobileMenuOpen) ? "#fff" : "var(--fg)"
      }}>
        <div className="hdr-inner">
          <div className="hdr-left">
            <button className="mobile-only" onClick={() => setMobileMenuOpen(true)} style={{ background:"none", border:"none", color:"inherit", cursor:"pointer", padding:"0.5rem" }}>
              <Icon name="menu" size={24} />
            </button>
            <nav className="hdr-nav desktop-only">
              {NAV_LINKS.slice(0, 3).map(([label, href]) => (
                <Link key={label} href={href} className="hdr-nav-link" style={{ 
                  color:"inherit", 
                  borderBottom: pathname === href ? "1px solid currentColor" : "1px solid transparent"
                }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          
          <Link href="/" className="hdr-logo" style={{ color:"inherit", display:"flex", flexDirection:"column", alignItems:"center", overflow: "visible" }}>
            <span className="font-display hdr-logo-name" style={{ letterSpacing:"0.04em", lineHeight:1 }}>Aurelia</span>
            <span style={{ fontSize:"0.55rem", letterSpacing:"0.4em", textTransform:"uppercase", fontWeight:600, color:(pathname === "/" && !scrolled && !mobileMenuOpen) ? "rgba(255,255,255,0.8)" : "var(--accent-dark)", marginTop:"0.2rem", whiteSpace: "nowrap" }}>
              Fine Jewellery
            </span>
          </Link>

          <div className="hdr-right">
            <nav className="hdr-nav desktop-only">
              {NAV_LINKS.slice(3).map(([label, href]) => (
                <Link key={label} href={href} className="hdr-nav-link" style={{ 
                  color:"inherit",
                  borderBottom: pathname === href ? "1px solid currentColor" : "1px solid transparent"
                }}>
                  {label}
                </Link>
              ))}
            </nav>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <Link href="/search" className="hdr-action desktop-only" style={{ color:"inherit", display:"flex", textDecoration:"none" }}>
                <Icon name="search" size={20} />
              </Link>
              <Link href="/wishlist" className="hdr-action desktop-only" style={{ color:"inherit", display:"flex", textDecoration:"none" }}>
                <Icon name="heart" size={20} />
              </Link>
              <Link href="/account" className="hdr-action desktop-only" style={{ color:"inherit", display:"flex", textDecoration:"none" }}>
                <Icon name="user" size={20} />
              </Link>
              <div style={{ color:"inherit" }}>
                <CartButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div style={{
        position:"fixed", inset:0, zIndex:50, background:"var(--bg)", color:"var(--fg)",
        transform: mobileMenuOpen ? "translateY(0)" : "translateY(-100%)",
        opacity: mobileMenuOpen ? 1 : 0,
        transition: "transform var(--dur-4) var(--ease-luxe), opacity var(--dur-4) var(--ease-luxe)",
        visibility: mobileMenuOpen ? "visible" : "hidden",
        display:"flex", flexDirection:"column"
      }}>
        <div className="hdr-inner" style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="hdr-left">
            <button onClick={() => setMobileMenuOpen(false)} style={{ background:"none", border:"none", color:"var(--fg)", cursor:"pointer", padding:"0.5rem" }}>
              <Icon name="x" size={28} />
            </button>
          </div>
          <Link href="/" className="hdr-logo" onClick={() => setMobileMenuOpen(false)} style={{ color:"var(--primary)", display:"flex", flexDirection:"column", alignItems:"center", overflow: "visible" }}>
            <span className="font-display hdr-logo-name" style={{ letterSpacing:"0.04em", lineHeight:1 }}>Aurelia</span>
            <span style={{ fontSize:"0.55rem", letterSpacing:"0.4em", textTransform:"uppercase", fontWeight:600, color:"var(--accent-dark)", marginTop:"0.2rem", whiteSpace: "nowrap" }}>
              Fine Jewellery
            </span>
          </Link>
          <div className="hdr-right">
            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="hdr-action" style={{ color:"inherit", display:"flex", textDecoration:"none", padding:"0.5rem" }}>
              <Icon name="search" size={20} />
            </Link>
          </div>
        </div>
        <nav style={{ padding:"3rem 2rem", display:"flex", flexDirection:"column", gap:"2rem", flex:1, overflowY:"auto" }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="t-h2" style={{ color:"var(--primary)", textDecoration:"none" }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop:"auto", paddingTop:"2rem", borderTop:"1px solid var(--border)" }}>
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display:"flex", alignItems:"center", gap:"1rem", textDecoration:"none", color:"var(--fg-muted)", fontSize:"1.1rem", marginBottom:"1rem" }}>
              <Icon name="heart" size={20} /> Wishlist
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} style={{ display:"flex", alignItems:"center", gap:"1rem", textDecoration:"none", color:"var(--fg-muted)", fontSize:"1.1rem" }}>
              <Icon name="user" size={20} /> My Profile
            </Link>
          </div>
        </nav>
      </div>
      
      <style>{`
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
