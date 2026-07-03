// Pure cross-sell resolver (server-safe). Given the current product, returns the
// partner products per the admin's strategy. Reads the repository (DB-backed).
import { getInStockProducts, getProductBySlug, getRelatedProducts } from "@/data/store";
import type { Product } from "@/data/store";
import { engagementConfig } from "./config";

export async function resolveCrossSell(
  currentSlug: string,
): Promise<{ heading: string; items: Product[] } | null> {
  const cfg = engagementConfig.crossSell;
  if (!cfg?.targeting.enabled || !engagementConfig.masterEnabled) return null;

  const current = await getProductBySlug(currentSlug);
  if (!current) return null;

  let items: Product[] = [];

  if (cfg.strategy === "curated") {
    const slugs = cfg.curated?.[currentSlug] ?? [];
    const resolved = await Promise.all(slugs.map((s) => getProductBySlug(s)));
    items = resolved.filter((p): p is NonNullable<typeof p> => !!p);
  } else if (cfg.strategy === "same-collection" && current.collectionLine) {
    const all = await getInStockProducts();
    items = all.filter(
      (p) => p.slug !== currentSlug && p.collectionLine === current.collectionLine,
    );
  }

  // Fallback to category relations so the rail is never empty when data is thin.
  if (items.length < cfg.maxItems) {
    const related = await getRelatedProducts(current.id, current.categoryId, cfg.maxItems);
    for (const r of related) {
      if (r.slug !== currentSlug && !items.some((i) => i.slug === r.slug)) items.push(r);
    }
  }

  items = items.slice(0, cfg.maxItems);
  if (!items.length) return null;
  return { heading: cfg.heading, items };
}
