# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repo.

## Project

**Aurelia** — a Next.js 15 (App Router, React 19) fine-jewellery e-commerce SEO
storefront (npm package name still `trendora`). Buyer-intent SEO with *safe
programmatic collections* and automated schema.org JSON-LD, plus a config-driven
customer-engagement layer.

**Now DB-backed & dynamic** (catalog Track B). Data lives in a **Prisma + SQLite**
database ([`prisma/dev.prisma`](prisma/dev.prisma), file `prisma/dev.db`). The
storefront renders dynamically from the DB and a real, session-authenticated
**admin panel** at `/admin` does live CRUD on products/categories/collections.
The DB **auto-seeds on server start** from [`src/server/seed-data.ts`](src/server/seed-data.ts)
via [`src/instrumentation.ts`](src/instrumentation.ts). The full canonical Postgres
model still lives in [`prisma/schema.prisma`](prisma/schema.prisma) as the source
of truth; `dev.prisma` is the pragmatic catalog subset that runs. Details in
[`docs/DYNAMIC_BACKEND.md`](docs/DYNAMIC_BACKEND.md).

## Commands

```bash
npm install      # postinstall generates the Prisma client
npm run dev      # db:push (predev) → dev server → http://localhost:3000 (auto-seeds)
npm run build    # prisma generate → next build (dynamic, Node runtime)
npm run lint     # next lint
npm run db:studio  # inspect the SQLite data
npm run db:reset   # wipe + recreate the DB (re-seeds on next start)
```

There is no test suite. Verify changes by running `npm run dev` and checking the
routes below, or `npm run build` to confirm the build succeeds.

## Architecture

- **Repository data layer (DB-backed)** — [`src/data/store.ts`](src/data/store.ts)
  exposes async query helpers over Prisma/SQLite; routes/components import only
  those helpers, never Prisma directly. This is the seam that kept the swap to a
  real DB to essentially one file. Public catalog types live in the client-safe
  [`src/lib/catalog-types.ts`](src/lib/catalog-types.ts) (so client components can
  type catalog data without pulling Prisma into the browser bundle). The Prisma
  client singleton is [`src/server/db.ts`](src/server/db.ts). SQLite has no
  arrays/JSON, so list/object fields (sizes, tags, gemstones, certifications) are
  stored as JSON strings and (de)serialised in the repository. Money is integer
  *paise*; weights integer *milligrams* — never floats.
- **Client data access** — client components fetch catalog data via `/api/catalog`
  and `/api/search` (see [`src/lib/catalog-client.ts`](src/lib/catalog-client.ts));
  they must NOT import the server repository.
- **Routing** (`src/app/`, App Router; catalog pages are `dynamic = "force-dynamic"`):
  - `/` home · `/[category]` · `/[category]/[sub]` · `/products/[slug]` ·
    `/c/[slug]` programmatic collections · plus `cart`, `checkout`,
    `checkout/success`, `wishlist`, `account`, `account/orders`, `search`.
  - `/admin` — **real** session-authed admin (catalog CRUD). Auth is scrypt-hashed
    passwords + an HMAC-signed HttpOnly cookie ([`src/server/auth.ts`](src/server/auth.ts));
    route protection is [`src/middleware.ts`](src/middleware.ts) (Edge, returns a
    hard 307 to `/admin/login`). The old engagement-config editor lives at
    `/admin/engagement`. Mutations are server actions in
    [`src/app/admin/actions.ts`](src/app/admin/actions.ts).
  - `robots.ts` and `sitemap.ts` are generated.
- **Engagement system** — config-driven conversion layer under
  [`src/lib/engagement/`](src/lib/engagement) (config, targeting, A/B, analytics)
  and [`src/components/engagement/`](src/components/engagement) (popups, social-
  proof toasts, sticky add-to-cart, free-shipping bar, upsells, product rails).
  Nothing is hardcoded in components — every unit is a row in one settings object
  evaluated client-side at runtime. See [`docs/engagement.md`](docs/engagement.md).
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

Now a **dynamic Node app** (Prisma/SQLite) — `output: "export"` has been removed
([`next.config.mjs`](next.config.mjs)). `npm run build` produces a standard Next
server build; run with `npm start` (needs a Node host, not static shared hosting).
`images.unoptimized` is kept. For production, point Prisma at Postgres (the
canonical [`prisma/schema.prisma`](prisma/schema.prisma)) and set a strong
`SESSION_SECRET`. See [`docs/DYNAMIC_BACKEND.md`](docs/DYNAMIC_BACKEND.md).

## Conventions

- TypeScript throughout; path alias `@/*` → `src/*` (see `tsconfig.json`).
- Tailwind CSS v4 (`@tailwindcss/postcss`), global styles in
  [`src/app/globals.css`](src/app/globals.css).
- Use the [`Icon`](src/components/Icon.tsx) component for iconography (consistent
  across the app).
- Match existing component style; keep SEO/schema behavior intact when editing
  pages.
- Deeper docs live in [`docs/`](docs/): `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`,
  `engagement.md`, `ROADMAP.md`.

## Do / Don't

- **Do** keep the indexability guard and schema output correct on every page type.
- **Don't** add doorway-style pages (e.g. location permutations), mass
  auto-publish, or anything that trips Google's scaled-content-abuse signals —
  see README "Deliberately NOT included".
