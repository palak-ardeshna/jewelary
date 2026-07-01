"use client";
import { useCart } from "./CartProvider";
import Link from "next/link";

export function CartButton() {
  const { totalItems, setDrawerOpen } = useCart();
  return (
    <button
      onClick={() => setDrawerOpen(true)}
      aria-label="Open cart"
      style={{
        position:"relative", background:"none", border:"none", cursor:"pointer",
        padding:"0.5rem", borderRadius:"var(--radius-sm)", display:"flex",
        alignItems:"center", gap:"0.25rem", color:"var(--fg)",
        transition:"color 0.15s",
      }}
    >
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {totalItems > 0 && (
        <span style={{
          position:"absolute", top:-2, right:-2, background:"var(--accent)", color:"#fff",
          borderRadius:"50%", width:18, height:18, fontSize:"0.65rem", fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{totalItems > 9 ? "9+" : totalItems}</span>
      )}
    </button>
  );
}
