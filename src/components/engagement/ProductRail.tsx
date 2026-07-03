// Tag-driven product rail (best-sellers / trending / any admin-defined tag).
// Server component: filters the store by the configured tag. Renders nothing if
// the rail is disabled or no products carry the tag — no empty shells.
import { getProductsByTag } from "@/data/store";
import { engagementConfig } from "@/lib/engagement/config";
import { ProductCard } from "@/components/ProductCard";

export async function ProductRail({ id }: { id: string }) {
  const cfg = engagementConfig.rails.find((r) => r.id === id);
  if (!cfg?.targeting.enabled || !engagementConfig.masterEnabled) return null;

  const items = (await getProductsByTag(cfg.tag)).slice(0, cfg.maxItems);
  if (!items.length) return null;

  return (
    <section style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 className="font-display" style={{ fontSize: "1.8rem" }}>{cfg.heading}</h2>
        <span className="badge badge-gold" style={{ fontSize: "0.6rem" }}>{cfg.tag}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
