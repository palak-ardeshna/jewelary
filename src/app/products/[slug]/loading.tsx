import { ProductGridSkeleton } from "@/components/Skeletons";

// Product-detail loading state: mirrors the PDP two-column layout so the
// transition doesn't jump.
export default function ProductLoading() {
  return (
    <div className="animate-fade-in">
      {/* breadcrumb */}
      <div className="skeleton" style={{ height: "0.8rem", width: "260px", borderRadius: "var(--radius)", marginBottom: "1.5rem" }} />

      <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "1fr" }} className="pdp-grid">
        {/* gallery */}
        <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: "var(--radius-lg)" }} />
        {/* details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="skeleton" style={{ height: "0.75rem", width: "40%" }} />
          <div className="skeleton" style={{ height: "2rem", width: "80%" }} />
          <div className="skeleton" style={{ height: "1rem", width: "50%" }} />
          <div className="skeleton" style={{ height: "1.75rem", width: "45%", marginTop: "0.5rem" }} />
          <div className="skeleton" style={{ height: "5rem", width: "100%", marginTop: "0.5rem" }} />
          <div className="skeleton" style={{ height: "3rem", width: "100%", marginTop: "0.5rem" }} />
          <div className="skeleton" style={{ height: "3.25rem", width: "100%" }} />
        </div>
      </div>

      <div style={{ marginTop: "3rem" }}>
        <div className="skeleton" style={{ height: "1.25rem", width: "220px", marginBottom: "1rem", borderRadius: "var(--radius)" }} />
        <ProductGridSkeleton count={4} />
      </div>

      <style>{`@media (min-width: 768px) { .pdp-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
