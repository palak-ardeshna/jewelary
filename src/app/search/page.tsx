"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchProducts } from "@/data/store";
import { ProductCard } from "@/components/ProductCard";

// Static export can't read query strings at build time, so search runs
// entirely client-side off the static product data.
function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const results = searchProducts(query);

  return (
    <div className="animate-fade-up">
      <h1 style={{ fontSize:"1.5rem", fontWeight:800, marginBottom:"1rem", letterSpacing:"-0.02em" }}>
        {query ? `Results for "${query}"` : "Search Products"}
      </h1>

      {query && (
        <p style={{ color:"var(--fg-muted)", marginBottom:"1.5rem", fontSize:"0.9rem" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} found
        </p>
      )}

      {!query ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--fg-muted)" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
          <p>Type something in the search bar above</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--fg-muted)" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>😕</div>
          <p style={{ fontWeight:600, fontSize:"1.1rem" }}>No results for "{query}"</p>
          <p style={{ marginTop:"0.5rem", fontSize:"0.875rem" }}>Try: jackets, kurti, sneakers, wallet, tee</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding:"4rem 1rem", textAlign:"center", color:"var(--fg-muted)" }}>Loading…</div>}>
      <SearchResults />
    </Suspense>
  );
}
