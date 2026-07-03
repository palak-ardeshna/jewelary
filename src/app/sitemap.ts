import type { MetadataRoute } from "next";
import { getAllCategories, getInStockProducts } from "@/data/store";
import { absUrl } from "@/lib/site";
import { indexableCollectionSlugs } from "@/lib/collections";

// Generated per-request now (dynamic backend). Still the second half of the
// indexability guard: it lists ONLY pages we want ranked. Collections that
// failed the quality bar are excluded here as well as carrying noindex — belt
// and suspenders, so a thin page is never even advertised to Google.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, inStock, indexableSlugs] = await Promise.all([
    getAllCategories(),
    getInStockProducts(),
    indexableCollectionSlugs(),
  ]);

  const byId = new Map(categories.map((c) => [c.id, c]));

  const entries: MetadataRoute.Sitemap = [
    { url: absUrl("/"), changeFrequency: "daily", priority: 1 },
  ];

  for (const c of categories) {
    // Reconstruct the canonical nested path for subcategories.
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    const path = parent ? `/${parent.slug}/${c.slug}` : `/${c.slug}`;
    entries.push({ url: absUrl(path), changeFrequency: "weekly", priority: 0.8 });
  }

  for (const p of inStock) {
    entries.push({ url: absUrl(`/products/${p.slug}`), changeFrequency: "weekly", priority: 0.6 });
  }

  for (const slug of indexableSlugs) {
    entries.push({ url: absUrl(`/c/${slug}`), changeFrequency: "weekly", priority: 0.7 });
  }

  return entries;
}
