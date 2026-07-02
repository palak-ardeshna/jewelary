// Pure cross-sell resolver (server-safe). Given the current product, returns the
// partner products per the admin's strategy. No client APIs — usable in RSC.
import { products, getProductBySlug, getRelatedProducts } from "@/data/store";
import type { Product } from "@/data/store";
import { engagementConfig } from "./config";

export function resolveCrossSell(currentSlug: string): { heading: string; items: Product[] } | null {
  const cfg = engagementConfig.crossSell;
  if (!cfg?.targeting.enabled || !engagementConfig.masterEnabled) return null;

  const current = getProductBySlug(currentSlug);
  if (!current) return null;

  let items: Product[] = [];

  if (cfg.strategy === "curated") {
    const slugs = cfg.curated?.[currentSlug] ?? [];
    items = slugs.map((s) => getProductBySlug(s)).filter((p): p is NonNullable<typeof p> => !!p);
  } else if (cfg.strategy === "same-collection" && current.collectionLine) {
    items = products.filter(
      (p) => p.slug !== currentSlug && p.inStock && p.collectionLine === current.collectionLine,
    );
  }

  // Fallback to category relations so the rail is never empty when data is thin.
  if (items.length < cfg.maxItems) {
    const related = getRelatedProducts(current.id, current.categoryId, cfg.maxItems);
    for (const r of related) {
      if (r.slug !== currentSlug && !items.some((i) => i.slug === r.slug)) items.push(r);
    }
  }

  items = items.slice(0, cfg.maxItems);
  if (!items.length) return null;
  return { heading: cfg.heading, items };
}
