"use client";
import { Icon } from "@/components/Icon";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="animate-fade-up" style={{ padding: "4rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="t-display" style={{ fontSize: "3rem", fontWeight: 400, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>My Profile</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "1.1rem" }}>Welcome back to Aurelia.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        
        {/* Profile Details */}
        <div style={{ padding: "2.5rem 2rem", border: "1px solid var(--border)", background: "var(--surface)", height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ color: "var(--accent-dark)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Icon name="user" size={32} strokeWidth={1.5} />
            <h2 className="t-h2" style={{ fontSize: "1.5rem", margin: 0 }}>Account Details</h2>
          </div>
          <div style={{ color: "var(--fg-muted)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.8rem", lineHeight: 1.5 }}>
            <span style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-strong)", paddingBottom: "0.5rem" }}>
              <span>Name</span>
              <span style={{ color: "var(--fg)" }}>Guest User</span>
            </span>
            <span style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-strong)", paddingBottom: "0.5rem" }}>
              <span>Email</span>
              <span style={{ color: "var(--fg)" }}>guest@aurelia.com</span>
            </span>
            <span style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
              <span>Password</span>
              <span style={{ color: "var(--fg)" }}>********</span>
            </span>
          </div>
          <button className="btn-outline" style={{ marginTop: "auto", padding: "0.75rem", fontSize: "0.85rem", width: "100%" }}>Edit Details</button>
        </div>

        {/* Orders */}
        <Link href="/account/orders" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="profile-card" style={{ padding: "2.5rem 2rem", border: "1px solid var(--border)", background: "var(--surface)", height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem", transition: "all 0.3s ease", cursor: "pointer" }}>
            <div style={{ color: "var(--accent-dark)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <Icon name="bag" size={32} strokeWidth={1.5} />
              <h2 className="t-h2" style={{ fontSize: "1.5rem", margin: 0 }}>My Orders</h2>
            </div>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", margin: 0, lineHeight: 1.5 }}>
              View your complete order history, track recent purchases, and initiate returns or exchanges.
            </p>
            <div style={{ marginTop: "auto", color: "var(--primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              View History →
            </div>
          </div>
        </Link>

        {/* Wishlist */}
        <Link href="/wishlist" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="profile-card" style={{ padding: "2.5rem 2rem", border: "1px solid var(--border)", background: "var(--surface)", height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem", transition: "all 0.3s ease", cursor: "pointer" }}>
            <div style={{ color: "var(--accent-dark)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <Icon name="heart" size={32} strokeWidth={1.5} />
              <h2 className="t-h2" style={{ fontSize: "1.5rem", margin: 0 }}>My Wishlist</h2>
            </div>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", margin: 0, lineHeight: 1.5 }}>
              Access all your saved items and curated collections in one place. Ready when you are.
            </p>
            <div style={{ marginTop: "auto", color: "var(--primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              View Wishlist →
            </div>
          </div>
        </Link>

        {/* Cart */}
        <Link href="/cart" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="profile-card" style={{ padding: "2.5rem 2rem", border: "1px solid var(--border)", background: "var(--surface)", height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem", transition: "all 0.3s ease", cursor: "pointer" }}>
            <div style={{ color: "var(--accent-dark)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <Icon name="cart" size={32} strokeWidth={1.5} />
              <h2 className="t-h2" style={{ fontSize: "1.5rem", margin: 0 }}>My Cart</h2>
            </div>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", margin: 0, lineHeight: 1.5 }}>
              Review the exquisite pieces in your shopping bag before proceeding to checkout.
            </p>
            <div style={{ marginTop: "auto", color: "var(--primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Go to Checkout →
            </div>
          </div>
        </Link>

      </div>

      <style>{`
        .profile-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border-color: var(--border-strong);
        }
      `}</style>
    </div>
  );
}
