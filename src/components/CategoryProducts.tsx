"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProductsByCategoryId } from "@/data/store";
import { ProductCard } from "@/components/ProductCard";

const COLORS = ["Black","White","Blue","Grey","Green","Maroon","Olive","Beige","Pink","Natural"];

// Filter bar + results are rendered client-side so they react to the URL query
// string (?color=&maxPrice=&sort=) on a static host where the server can't.
export function CategoryProducts({ categoryId, path }: { categoryId: string; path: string }) {
  const params = useSearchParams();
  const color = params.get("color") ?? undefined;
  const maxPrice = params.get("maxPrice") ?? undefined;
  const sort = params.get("sort") ?? undefined;

  const products = getProductsByCategoryId(categoryId, {
    color: color || undefined,
    maxPriceInPaise: maxPrice ? parseInt(maxPrice) * 100 : undefined,
    sort,
  });

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | undefined> = { color, maxPrice, sort, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `${path}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {/* ── Filter bar ── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem", marginBottom:"1.5rem", padding:"1rem", background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
        {/* Sort */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--fg-muted)" }}>Sort:</span>
          {[["price_asc","Price ↑"],["price_desc","Price ↓"],["rating","Top Rated"]].map(([val,label])=>(
            <Link key={val} href={buildUrl({ sort: sort === val ? undefined : val })} style={{
              padding:"0.3rem 0.75rem", borderRadius:99, fontSize:"0.8rem", fontWeight:600, textDecoration:"none",
              background: sort === val ? "var(--primary)" : "var(--bg)",
              color: sort === val ? "#fff" : "var(--fg)",
              border: sort === val ? "none" : "1.5px solid var(--border)",
            }}>{label}</Link>
          ))}
        </div>

        {/* Price */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--fg-muted)" }}>Max Price:</span>
          {[[300,"Under ₹300"],[500,"Under ₹500"],[1000,"Under ₹1000"]].map(([val,label])=>(
            <Link key={val} href={buildUrl({ maxPrice: maxPrice === String(val) ? undefined : String(val) })} style={{
              padding:"0.3rem 0.75rem", borderRadius:99, fontSize:"0.8rem", fontWeight:600, textDecoration:"none",
              background: maxPrice === String(val) ? "var(--accent)" : "var(--bg)",
              color: maxPrice === String(val) ? "#fff" : "var(--fg)",
              border: maxPrice === String(val) ? "none" : "1.5px solid var(--border)",
            }}>{label}</Link>
          ))}
        </div>

        {/* Colour */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
          <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--fg-muted)" }}>Colour:</span>
          {COLORS.map((c) => (
            <Link key={c} href={buildUrl({ color: color === c ? undefined : c })} style={{
              padding:"0.3rem 0.75rem", borderRadius:99, fontSize:"0.8rem", fontWeight:600, textDecoration:"none",
              background: color === c ? "#111827" : "var(--bg)",
              color: color === c ? "#fff" : "var(--fg)",
              border: color === c ? "none" : "1.5px solid var(--border)",
            }}>{c}</Link>
          ))}
        </div>

        {/* Clear */}
        {(color || maxPrice || sort) && (
          <Link href={path} style={{ marginLeft:"auto", fontSize:"0.8rem", color:"var(--error)", textDecoration:"none", fontWeight:600, display:"flex", alignItems:"center" }}>
            ✕ Clear filters
          </Link>
        )}
      </div>

      {/* Results */}
      <p style={{ fontSize:"0.875rem", color:"var(--fg-muted)", marginBottom:"1rem" }}>
        {products.length} product{products.length !== 1 ? "s" : ""} found
      </p>

      {products.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--fg-muted)" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
          <p style={{ fontWeight:600, fontSize:"1.1rem" }}>No products match your filters</p>
          <Link href={path} style={{ display:"inline-block", marginTop:"1rem", color:"var(--primary)", textDecoration:"none", fontWeight:600 }}>Clear filters</Link>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </>
  );
}
