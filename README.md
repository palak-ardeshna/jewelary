# Trendora — E-commerce SEO storefront

A Next.js storefront scaffold built around **buyer-intent SEO** with **safe
programmatic collections**. It implements the parts of the 2026 e-commerce SEO
plan that actually move rankings, while deliberately avoiding the parts that
trigger Google's scaled-content-abuse / core-update penalties.

**No database.** All data is a static in-memory store in
[`src/data/store.ts`](src/data/store.ts), so the app runs with just
`npm install && npm run dev`. The query helpers there mimic a DB API, so swapping
in Prisma/Drizzle later means editing one file, not the routes.

## What's here

| Page type | Route | Ranks for | Notes |
|-----------|-------|-----------|-------|
| Home | `/` | brand | Internal-linking hub |
| Category | `/men-jackets` | "men's jackets" | Evergreen hub, unique copy |
| Subcategory | `/men-jackets/winter-jackets` | "winter jackets" | Verified parent chain or 404 |
| Product | `/products/urban-edge-puffer-jacket` | transactional | Product + AggregateRating schema |
| Collection | `/c/best-men-winter-jackets` | "best X under ₹Y" | **Programmatic + indexability guard** |

## The indexability guard (the important bit)

The plan's risky idea is "generate thousands of color × price × category pages."
That pattern is exactly what Google demotes now. So here, a collection is
**generated** freely but only **indexed** when it clears a quality bar in
[`src/lib/collections.ts`](src/lib/collections.ts):

- `MIN_PRODUCTS_FOR_INDEX` (3) — enough live inventory to be useful
- `MIN_INTRO_CHARS` (120) — real, unique editorial copy

Pages that fail render with `<meta name="robots" content="noindex, follow">`
**and** are excluded from `sitemap.xml`. The store includes one deliberately thin
collection (`/c/best-olive-jackets-under-500`) so you can see the guard fire.

This gives the "thousands of pages" upside without the doorway-page downside.

## Schema automation

Every page emits correct schema.org JSON-LD via
[`src/lib/schema-org.ts`](src/lib/schema-org.ts): Organization + WebSite
(site-wide), BreadcrumbList (all pages), Product + Offer + AggregateRating
(products), ItemList (categories & indexable collections).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Then check:
- `http://localhost:3000/c/best-men-winter-jackets` → indexable, has ItemList JSON-LD
- `http://localhost:3000/c/best-olive-jackets-under-500` → noindex banner + reasons
- `http://localhost:3000/sitemap.xml` → thin collection is absent

Optionally set the canonical origin (used for absolute URLs in JSON-LD / sitemap):

```bash
NEXT_PUBLIC_SITE_URL=https://trendora.example npm run build
```

## Deliberately NOT included (and why)

- **AdSense on blog pages** — tiny revenue, and "made-for-ads" signals hurt a
  domain you want ranking for commercial terms. Money is product margin + affiliate.
- **Location permutation pages** ("best hoodies in Gujarat") — pure doorway pages,
  zero unique value, highest penalty risk.
- **Mass auto-publish** — the guard means quality gates indexing, not volume.

## Next steps to productionise

1. Replace [`src/data/store.ts`](src/data/store.ts) with a real DB (Prisma + Postgres).
2. Auth + cart + checkout (Stripe/Razorpay).
3. Google Merchant Center product feed (`/feed.xml`) from the same Product data.
4. Image pipeline → CDN + `next/image`.
5. Admin UI to write collection intros (so editors, not code, gate indexing).
# E-commerce
# jewelary
