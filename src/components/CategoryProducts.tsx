import Link from "next/link";
import type { Product } from "@/lib/catalog-types";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";

const METALS = ["Yellow Gold","White Gold","Rose Gold","Platinum","Silver"];

// Presentational filter bar + results. The server page now does the filtering
// (reads ?color=&maxPrice=&sort= and queries the DB) and passes the results in;
// the filter controls are just links that change the URL and re-render server-side.
export function CategoryProducts({
  products, path, color, maxPrice, sort,
}: {
  products: Product[]; path: string; color?: string; maxPrice?: string; sort?: string;
}) {
  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | undefined> = { color, maxPrice, sort, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `${path}${qs ? `?${qs}` : ""}`;
  };

  const activeCount = [color, maxPrice, sort].filter(Boolean).length;

  return (
    <>
      {/* ── Filter bar ──
          Native <details> so it collapses into a tap-to-open panel on phones
          (no client JS needed — this is a server component) while CSS forces it
          permanently open and inline as a bar on tablet/desktop. */}
      <details className="filter-details" style={{ marginBottom:"1.5rem", background:"var(--surface)", border:"1px solid var(--border)" }}>
        <summary className="filter-summary" style={{ listStyle:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem", padding:"0.9rem 1rem", fontSize:"0.85rem", fontWeight:600 }}>
          <span style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <Icon name="menu" size={16} /> Filter &amp; Sort
            {activeCount > 0 && <span style={{ background:"var(--primary)", color:"#fff", fontSize:"0.7rem", minWidth:20, height:20, borderRadius:99, display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"0 0.35rem" }}>{activeCount}</span>}
          </span>
          <span className="filter-chevron" aria-hidden style={{ transition:"transform var(--dur-2) var(--ease-out)" }}>▾</span>
        </summary>

        <div className="filter-body" style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem", padding:"0 1rem 1rem" }}>
          {/* Sort */}
          <div className="filter-group" style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--fg-muted)" }}>Sort:</span>
            {[["price_asc","Price ↑"],["price_desc","Price ↓"],["rating","Top Rated"]].map(([val,label])=>(
              <Link key={val} href={buildUrl({ sort: sort === val ? undefined : val })} style={{
                padding:"0.4rem 0.85rem", borderRadius:99, fontSize:"0.8rem", fontWeight:600, textDecoration:"none",
                background: sort === val ? "var(--primary)" : "var(--bg)",
                color: sort === val ? "#fff" : "var(--fg)",
                border: sort === val ? "none" : "1.5px solid var(--border)",
              }}>{label}</Link>
            ))}
          </div>

          {/* Price */}
          <div className="filter-group" style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--fg-muted)" }}>Max Price:</span>
            {[[150,"Under ₹150"],[200,"Under ₹200"],[250,"Under ₹250"]].map(([val,label])=>(
              <Link key={val} href={buildUrl({ maxPrice: maxPrice === String(val) ? undefined : String(val) })} style={{
                padding:"0.4rem 0.85rem", borderRadius:99, fontSize:"0.8rem", fontWeight:600, textDecoration:"none",
                background: maxPrice === String(val) ? "var(--accent)" : "var(--bg)",
                color: maxPrice === String(val) ? "#fff" : "var(--fg)",
                border: maxPrice === String(val) ? "none" : "1.5px solid var(--border)",
              }}>{label}</Link>
            ))}
          </div>

          {/* Metal */}
          <div className="filter-group" style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--fg-muted)" }}>Metal:</span>
            {METALS.map((c) => (
              <Link key={c} href={buildUrl({ color: color === c ? undefined : c })} style={{
                padding:"0.4rem 0.85rem", borderRadius:99, fontSize:"0.8rem", fontWeight:600, textDecoration:"none",
                background: color === c ? "#111827" : "var(--bg)",
                color: color === c ? "#fff" : "var(--fg)",
                border: color === c ? "none" : "1.5px solid var(--border)",
              }}>{c}</Link>
            ))}
          </div>

          {/* Clear */}
          {activeCount > 0 && (
            <Link href={path} style={{ marginLeft:"auto", fontSize:"0.8rem", color:"var(--error)", textDecoration:"none", fontWeight:600, display:"flex", alignItems:"center", gap:"0.3rem", alignSelf:"center" }}>
              <Icon name="x" size={13} /> Clear filters
            </Link>
          )}
        </div>
      </details>

      {/* Results */}
      <p style={{ fontSize:"0.875rem", color:"var(--fg-muted)", marginBottom:"1rem" }}>
        {products.length} product{products.length !== 1 ? "s" : ""} found
      </p>

      <style>{`
        .filter-summary::-webkit-details-marker { display: none; }
        .filter-details[open] .filter-chevron { transform: rotate(180deg); }
        /* Tablet & up: behave as an always-open inline bar, hide the toggle. */
        @media (min-width: 769px) {
          .filter-summary { display: none !important; }
          .filter-body { padding: 1rem !important; }
          .filter-details { display: block; }
          .filter-details:not([open]) .filter-body { display: flex; }
        }
      `}</style>

      {products.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--fg-muted)" }}>
          <div style={{ marginBottom:"1rem", color:"var(--fg-subtle)", display:"flex", justifyContent:"center" }}><Icon name="search" size={44} strokeWidth={1.25} /></div>
          <p style={{ fontWeight:600, fontSize:"1.1rem" }}>No products match your filters</p>
          <Link href={path} style={{ display:"inline-block", marginTop:"1rem", color:"var(--primary)", textDecoration:"none", fontWeight:600 }}>Clear filters</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </>
  );
}
