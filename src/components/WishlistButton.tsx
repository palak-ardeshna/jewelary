"use client";
import { useState, useEffect } from "react";
import { Icon } from "@/components/Icon";

export function WishlistButton({ productId, variant = "card" }: { productId: string, variant?: "card" | "pdp" }) {
  const [liked, setLiked] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("aurelia_wishlist");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.includes(productId)) {
          setLiked(true);
        }
      } catch (e) {}
    }
  }, [productId]);

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const saved = localStorage.getItem("aurelia_wishlist");
    let list: string[] = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch(e) {}
    }
    if (!Array.isArray(list)) list = [];
    
    if (list.includes(productId)) {
      list = list.filter((id) => id !== productId);
      setLiked(false);
    } else {
      list.push(productId);
      setLiked(true);
    }
    localStorage.setItem("aurelia_wishlist", JSON.stringify(list));
  }

  if (!mounted) return null; // Hydration mismatch prevention

  if (variant === "card") {
    return (
      <button 
        onClick={toggleWishlist}
        style={{
          position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 10,
          background: "var(--surface)", border: "none", borderRadius: "50%",
          width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "transform 0.2s, opacity 0.2s",
          opacity: 0.9
        }}
        aria-label="Add to Wishlist"
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "0.9"; }}
      >
        <Icon name="heart" size={16} fill={liked ? "var(--error)" : "none"} style={{ color: liked ? "var(--error)" : "var(--fg)", transition: "all 0.2s" }} />
      </button>
    );
  }

  // PDP variant
  return (
    <button 
      onClick={toggleWishlist}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none",
        cursor: "pointer", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em",
        fontWeight: 600, color: "var(--fg-muted)", transition: "color 0.2s", padding: 0
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; }}
    >
      <Icon name="heart" size={18} fill={liked ? "var(--error)" : "none"} style={{ color: liked ? "var(--error)" : "currentColor", transition: "all 0.2s" }} />
      {liked ? "Saved to Wishlist" : "Add to Wishlist"}
    </button>
  );
}
