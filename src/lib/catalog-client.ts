// Browser-side catalog fetchers. Client components use these instead of the
// server repository. The full catalog is cached per page load (it's small and
// used by several widgets); search hits the API each time.
import type { Product } from "@/lib/catalog-types";

let catalogCache: Promise<Product[]> | null = null;

export function fetchCatalog(): Promise<Product[]> {
  if (typeof window === "undefined") return Promise.resolve([]);
  if (!catalogCache) {
    catalogCache = fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
  }
  return catalogCache;
}

export async function searchCatalog(q: string): Promise<Product[]> {
  const query = q.trim();
  if (!query) return [];
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return r.ok ? await r.json() : [];
  } catch {
    return [];
  }
}
