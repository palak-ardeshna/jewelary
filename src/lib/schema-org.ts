// Schema.org JSON-LD generators. Returning plain objects (not stringified) lets
// route components drop them into a <script type="application/ld+json"> tag.
// Centralising this is the "schema automation" the SEO plan calls for: every
// product/collection/category page gets correct structured data for free.

import { SITE_NAME, SITE_URL, absUrl } from "./site";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/logo.png"),
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export interface ProductSchemaInput {
  name: string;
  slug: string;
  description: string;
  priceInPaise: number;
  currency: string;
  inStock: boolean;
  imageUrl?: string | null;
  brandName?: string | null;
  reviews?: { rating: number }[];
}

export function productSchema(p: ProductSchemaInput): JsonLd {
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: absUrl(`/products/${p.slug}`),
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
    ...(p.brandName ? { brand: { "@type": "Brand", name: p.brandName } } : {}),
    offers: {
      "@type": "Offer",
      price: (p.priceInPaise / 100).toFixed(2),
      priceCurrency: p.currency,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absUrl(`/products/${p.slug}`),
    },
  };

  if (p.reviews && p.reviews.length > 0) {
    const avg =
      p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: p.reviews.length,
    };
  }

  return schema;
}

// ItemList for collection / category listing pages — tells Google the page is a
// curated set of products, which is how buyer-intent "best X" pages should appear.
export function itemListSchema(
  products: { name: string; slug: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}
