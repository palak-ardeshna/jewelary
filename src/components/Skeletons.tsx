// Server-safe skeleton primitives (no hooks) — reused by route loading.tsx files
// and Suspense fallbacks. Uses the `.skeleton` shimmer defined in globals.css.

export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ overflow: "hidden", height: "100%" }} aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: 0 }} />
      <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="skeleton" style={{ height: "0.85rem", width: "88%" }} />
        <div className="skeleton" style={{ height: "0.65rem", width: "45%" }} />
        <div className="skeleton" style={{ height: "1rem", width: "38%", marginTop: "0.15rem" }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// A generic title + grid skeleton for full-page route transitions.
export function ListingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: "2rem", width: "min(260px, 60%)", marginBottom: "0.75rem", borderRadius: "var(--radius)" }} />
      <div className="skeleton" style={{ height: "1rem", width: "min(420px, 85%)", marginBottom: "1.75rem", borderRadius: "var(--radius)" }} />
      <ProductGridSkeleton count={count} />
    </div>
  );
}
