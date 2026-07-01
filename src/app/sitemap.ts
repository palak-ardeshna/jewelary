import type { MetadataRoute } from "next";
import { categories, getInStockProducts } from "@/data/store";
import { absUrl } from "@/lib/site";
import { indexableCollectionSlugs } from "@/lib/collections";

// Emit a static sitemap.xml file during `output: export`.
export const dynamic = "force-static";

// The sitemap is the second half of the indexability guard: it lists ONLY pages
// we want ranked. Collections that failed the quality bar are excluded here as
// well as carrying noindex — belt and suspenders, so a thin page is never even
// advertised to Google.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: absUrl("/"), changeFrequency: "daily", priority: 1 },
  ];

  for (const c of categories) {
    // Reconstruct the canonical nested path for subcategories.
    const parent = c.parentId
      ? categories.find((p) => p.id === c.parentId)
      : undefined;
    const path = parent ? `/${parent.slug}/${c.slug}` : `/${c.slug}`;
    entries.push({
      url: absUrl(path),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const p of getInStockProducts()) {
    entries.push({
      url: absUrl(`/products/${p.slug}`),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const slug of indexableCollectionSlugs()) {
    entries.push({
      url: absUrl(`/c/${slug}`),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
