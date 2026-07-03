"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchCatalog } from "@/lib/catalog-client";
import type { Product } from "@/lib/catalog-types";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { Icon } from "@/components/Icon";

// Search now runs server-side via /api/search; this component fetches results.
function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    let active = true;
    setLoading(true);
    searchCatalog(query).then((r) => { if (active) { setResults(r); setLoading(false); } });
    return () => { active = false; };
  }, [query]);

  return (
    <div className="animate-fade-up">
      <h1 style={{ fontSize:"1.5rem", fontWeight:800, marginBottom:"1rem", letterSpacing:"-0.02em" }}>
        {query ? `Results for "${query}"` : "Search Products"}
      </h1>

      {query && !loading && (
        <p style={{ color:"var(--fg-muted)", marginBottom:"1.5rem", fontSize:"0.9rem" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} found
        </p>
      )}

      {!query ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--fg-muted)" }}>
          <div style={{ marginBottom:"1rem", color:"var(--fg-subtle)", display:"flex", justifyContent:"center" }}><Icon name="search" size={44} strokeWidth={1.25} /></div>
          <p>Type something in the search bar above</p>
        </div>
      ) : loading ? (
        <ProductGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--fg-muted)" }}>
          <div style={{ marginBottom:"1rem", color:"var(--fg-subtle)", display:"flex", justifyContent:"center" }}><Icon name="search" size={44} strokeWidth={1.25} /></div>
          <p style={{ fontWeight:600, fontSize:"1.1rem" }}>No results for "{query}"</p>
          <p style={{ marginTop:"0.5rem", fontSize:"0.875rem" }}>Try: rings, diamond, gold chain, earrings, mangalsutra</p>
        </div>
      ) : (
        <div className="product-grid">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="animate-fade-in"><div className="skeleton" style={{ height:"1.75rem", width:"min(280px,60%)", marginBottom:"1.5rem", borderRadius:"var(--radius)" }} /><ProductGridSkeleton count={8} /></div>}>
      <SearchResults />
    </Suspense>
  );
}
