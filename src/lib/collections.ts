// Programmatic collection engine.
//
// This is the single most important file for not getting the domain penalised.
// The 2024–2025 Google "scaled content abuse" / core updates specifically demote
// mass-generated near-duplicate permutation pages (color × price × category ×
// location "doorway" pages). So the rule here is blunt and deliberate:
//
//   We will GENERATE every permutation, but we will only let Google INDEX the
//   ones that clear a quality bar — real inventory + unique editorial intro.
//   Everything else renders with <meta robots noindex> and is kept out of the
//   sitemap. The page still works for users; it just doesn't beg for ranking.
//
// This keeps the "thousands of pages" upside without the doorway-page downside.

import {
  collections,
  findProductsByFilter,
  getCollectionBySlug,
  type Product,
} from "@/data/store";

// ---- Tunable quality thresholds -------------------------------------------

// Minimum live (in-stock) products for a collection to deserve indexing.
// A "best black hoodies under ₹999" page with 1 product is thin by definition.
export const MIN_PRODUCTS_FOR_INDEX = 3;

// Minimum length of unique intro copy. Empty/boilerplate intro => noindex.
export const MIN_INTRO_CHARS = 120;

export interface ResolvedCollection {
  title: string;
  intro: string | null;
  products: Product[];
  /** True only when the page clears the quality bar below. */
  indexable: boolean;
  /** Human-readable reasons it failed the bar (for debugging / dashboards). */
  noindexReasons: string[];
}

// Decide indexability. Pure function so it can be unit-tested and reused by the
// sitemap generator without re-running the product query.
export function evaluateIndexability(input: {
  intro: string | null | undefined;
  productCount: number;
}): { indexable: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (input.productCount < MIN_PRODUCTS_FOR_INDEX) {
    reasons.push(
      `only ${input.productCount} live products (need ${MIN_PRODUCTS_FOR_INDEX})`,
    );
  }
  if (!input.intro || input.intro.trim().length < MIN_INTRO_CHARS) {
    reasons.push(
      `intro too thin (need ${MIN_INTRO_CHARS}+ chars of unique copy)`,
    );
  }
  return { indexable: reasons.length === 0, reasons };
}

// Load a collection by slug, run its filter, and attach the indexability verdict.
export function resolveCollection(slug: string): ResolvedCollection | null {
  const collection = getCollectionBySlug(slug);
  if (!collection) return null;

  const matched = findProductsByFilter(collection.filter);
  const { indexable, reasons } = evaluateIndexability({
    intro: collection.intro,
    productCount: matched.length,
  });

  return {
    title: collection.title,
    intro: collection.intro ?? null,
    products: matched,
    indexable,
    noindexReasons: reasons,
  };
}

// Return slugs of every collection that is currently safe to index — used by the
// sitemap so we never advertise a thin page to Google.
export function indexableCollectionSlugs(): string[] {
  return collections
    .filter((c) => {
      const count = findProductsByFilter(c.filter).length;
      return evaluateIndexability({ intro: c.intro, productCount: count })
        .indexable;
    })
    .map((c) => c.slug);
}
