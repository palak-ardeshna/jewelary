"use client";
// Recently-viewed rail + a headless view tracker. `ProductViewTracker` records
// the current product slug (localStorage, no PII) on mount; `RecentlyViewed`
// renders the capped, most-recent-first list, excluding the product you're on.
import { useEffect, useState } from "react";
import { products } from "@/data/store";
import { useEngagementConfig } from "@/lib/engagement/useEngagementConfig";
import { getRecentlyViewed, pushRecentlyViewed } from "@/lib/engagement/runtime";
import { track } from "@/lib/engagement/analytics";
import { ProductCard } from "@/components/ProductCard";

export function ProductViewTracker({ slug }: { slug: string }) {
  useEffect(() => { pushRecentlyViewed(slug); track("recently_viewed", "view", { slug }); }, [slug]);
  return null;
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const config = useEngagementConfig();
  const cfg = config.recentlyViewed;
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => { setSlugs(getRecentlyViewed()); }, []);

  if (!cfg?.targeting.enabled || !config.masterEnabled) return null;

  const items = slugs
    .filter((s) => s !== excludeSlug)
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, cfg.maxItems);

  if (items.length < 2) return null; // not worth a rail for a single item

  return (
    <section style={{ marginTop: "3rem" }}>
      <h2 className="font-display" style={{ fontSize: "1.6rem", marginBottom: "1.25rem" }}>{cfg.heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
