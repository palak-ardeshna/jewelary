"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { fetchCatalog } from "@/lib/catalog-client";
import type { Product } from "@/lib/catalog-types";

export function WishlistClient() {
  const [mounted, setMounted] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("aurelia_wishlist");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) setWishlist(list);
      } catch (e) {}
    }
    fetchCatalog().then(setCatalog);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "50vh" }} />; // skeleton
  }

  const likedProducts = catalog.filter(p => wishlist.includes(p.slug));

  if (likedProducts.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"6rem 1rem", color:"var(--fg-muted)" }}>
        <div style={{ marginBottom:"1rem", color:"var(--fg-subtle)" }}><Icon name="heart" size={56} strokeWidth={1.25} /></div>
        <h1 className="t-h2" style={{ fontSize:"2rem", fontWeight:400, marginBottom:"1rem" }}>Your wishlist is empty</h1>
        <p style={{ marginBottom:"2.5rem" }}>Save the items you love to find them easily later.</p>
        <Link href="/" className="btn-outline" style={{ textDecoration:"none", padding: "0.8rem 2rem", textTransform:"uppercase", letterSpacing:"0.1em" }}>Explore Collections</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="t-display" style={{ fontSize: "3rem", fontWeight: 400, marginBottom: "0.5rem" }}>Wishlist</h1>
      <p style={{ color: "var(--fg-muted)", marginBottom: "3rem" }}>{likedProducts.length} items saved.</p>
      
      <div className="product-grid">
        {likedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
