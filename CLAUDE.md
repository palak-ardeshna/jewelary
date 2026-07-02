# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repo.

## Project

**Trendora** — a Next.js 15 (App Router, React 19) e-commerce SEO storefront.
Buyer-intent SEO with *safe programmatic collections* and automated schema.org
JSON-LD. **No database** — all data is a static in-memory store.

## Commands

```bash
npm install
npm run dev      # dev server → http://localhost:3000
npm run build    # static export → ./out  (output: "export")
npm run lint     # next lint
```

There is no test suite. Verify changes by running `npm run dev` and checking the
routes below, or `npm run build` to confirm the static export succeeds.

## Architecture

- **Static, DB-free data layer** — [`src/data/store.ts`](src/data/store.ts) holds
  all products/categories/collections and exposes DB-like query helpers. To move
  to a real DB later, swap this one file; routes stay unchanged.
- **Routing** (`src/app/`, App Router):
  - `/` home · `/[category]` · `/[category]/[sub]` · `/products/[slug]` ·
    `/c/[slug]` programmatic collections · plus `cart`, `checkout`, `wishlist`,
    `account`, `search`.
  - `robots.ts` and `sitemap.ts` are generated.
- **Indexability guard** — [`src/lib/collections.ts`](src/lib/collections.ts).
  Collections are always *generated* but only *indexed* when they clear a quality
  bar (`MIN_PRODUCTS_FOR_INDEX`, `MIN_INTRO_CHARS`). Failing pages emit
  `<meta name="robots" content="noindex, follow">` and are excluded from the
  sitemap. This is the core design constraint — do not weaken it.
- **Schema.org** — [`src/lib/schema-org.ts`](src/lib/schema-org.ts) builds all
  JSON-LD; rendered via [`src/components/JsonLd.tsx`](src/components/JsonLd.tsx).
- **Site config** — [`src/lib/site.ts`](src/lib/site.ts). Canonical origin from
  `NEXT_PUBLIC_SITE_URL` (used for absolute URLs in JSON-LD / sitemap).

## Deployment

Configured for **static export** ([`next.config.mjs`](next.config.mjs):
`output: "export"`, `trailingSlash: true`, `images.unoptimized`). `npm run build`
writes a fully static site to `./out/` for upload to shared hosting
(Hostinger/Apache/LiteSpeed). Images are served as-is (no Next optimizer).

## Conventions

- TypeScript throughout; path alias `@/*` → `src/*` (see `tsconfig.json`).
- Tailwind CSS v4 (`@tailwindcss/postcss`), global styles in
  [`src/app/globals.css`](src/app/globals.css).
- Use the [`Icon`](src/components/Icon.tsx) component for iconography (consistent
  across the app).
- Match existing component style; keep SEO/schema behavior intact when editing
  pages.

## Do / Don't

- **Do** keep the indexability guard and schema output correct on every page type.
- **Don't** add doorway-style pages (e.g. location permutations), mass
  auto-publish, or anything that trips Google's scaled-content-abuse signals —
  see README "Deliberately NOT included".
