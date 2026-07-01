# Aurelia — Fine Jewellery Platform · Architecture Blueprint

> **Status:** Phase 1–3 locked (Research · Architecture · Database).
> **Scope of this document:** the honest, buildable architecture for a luxury
> jewellery eCommerce platform, given the current deployment constraint
> (**static export to Hostinger shared hosting**). It defines what ships today,
> and how every module upgrades to a full-stack backend later **without a
> rewrite**.

---

## 0. The one constraint that shapes everything

The live site is a **Next.js `output: "export"` static build** uploaded to
Hostinger shared hosting (see [`next.config.mjs`](../next.config.mjs) and the
`lftp` deploy in git history). Shared hosting serves **static files only** — no
Node process, no Postgres socket, no Redis, no server actions at runtime.

That collides with the requested stack (PostgreSQL + Prisma + Redis + Better
Auth + Razorpay/Stripe server webhooks + an Admin Business OS). Both cannot be
literally true at once. The resolution this architecture commits to:

| Layer | Today (static, Hostinger) | Later (full-stack, no rewrite) |
|---|---|---|
| **Domain model** | `prisma/schema.prisma` is the *canonical* model; TS interfaces in `src/data/store.ts` mirror it 1:1 | Same schema, now `prisma migrate` against Postgres |
| **Data access** | Pure functions in `store.ts` (`getProductBySlug`, `findProductsByFilter`, …) read an in-memory dataset | Same function signatures, bodies swapped to Prisma queries — routes never change |
| **Content** | Data lives in typed TS at build time | Data lives in Postgres, edited via Admin |
| **Cart / Checkout** | Client-side (`localStorage`) cart, checkout hands off to a hosted payment link | Server cart + Razorpay/Stripe server orders + webhooks |
| **Auth** | None (or client-only wishlist) | Better Auth / Auth.js + RBAC |
| **Admin / AI / Analytics** | Not runnable on static host | Deployed as the full-stack app |

**The single rule that makes this work:** *routes and components depend only on
the `store.ts` query API, never on the data source.* Swapping in Prisma means
editing **one file**, exactly as the original README promised. This is the
[Repository pattern](https://martinfowler.com/eaaCatalog/repository.html) — the
data layer is an interface, the source is an implementation detail.

### Two-track delivery

- **Track A — Storefront (static, ships now):** brand, design system, catalogue,
  PDP, collections, SEO/schema, client cart, wishlist. This is what Hostinger
  serves.
- **Track B — Business OS (full-stack, ships when a Node host + Postgres exist):**
  same Prisma schema, Admin panel, auth, payments, AI Center, analytics.
  Recommended host: **Vercel/Railway + Neon/Supabase Postgres + Upstash Redis**.

Track A is a strict subset of Track B's data model, so migrating is additive.

---

## 1. Brand & product positioning (Phase 1 — Research)

**Aurelia — Fine Jewellery.** India-first (INR, `en-IN`), multi-currency-ready.
Positioning between **CaratLane/Tanishq** (trust, certification, BIS hallmark,
India retail) and **Mejuri/Pandora** (modern DTC UX, everyday luxury) with
**Cartier/Tiffany** cues in the visual language (restraint, negative space,
serif display, gold-on-ivory).

Competitive takeaways baked into the architecture:

- **Trust is the conversion lever in jewellery**, not discounts. → First-class
  fields for *hallmark, certification (IGI/GIA/BIS), metal purity, gemstone
  grading, hallmarking, buyback/exchange policy*. Surfaced on the PDP and in
  `Product` schema.org.
- **Price is a function of live metal rate + making charge + stone value + GST.**
  → Price is *composed*, not a single number (see `PriceBreakup` in the schema),
  so a future admin can reprice the whole catalogue when the gold rate moves.
- **High-consideration purchase** → strong PDP (certification, 360°, try-at-home,
  appointment booking), wishlist, gifting, EMI messaging.
- **SEO is buyer-intent + local** ("diamond engagement rings under ₹50000",
  "22k gold jhumka"). → Keep the existing programmatic-collection engine and its
  indexability guard — it is *ideal* for jewellery long-tail.

---

## 2. System context (C4 level 1)

```
            ┌──────────────────────────────────────────────────────────┐
            │                        Shoppers                           │
            └───────────────┬───────────────────────────┬──────────────┘
                            │ HTTPS                      │ HTTPS
              ┌─────────────▼─────────────┐  ┌───────────▼───────────────┐
              │  TRACK A · Storefront     │  │  TRACK B · Business OS     │
              │  Next.js static export    │  │  Next.js (Node runtime)    │
              │  → Hostinger (Apache)     │  │  → Vercel/Railway          │
              │  • catalogue, PDP, SEO    │  │  • Admin, AI, Analytics    │
              │  • client cart/wishlist   │  │  • Auth (RBAC), Orders     │
              └─────────────┬─────────────┘  └───────┬──────────┬────────┘
                            │ payment link           │ Prisma   │ webhooks
                            ▼                         ▼          ▼
                 ┌────────────────┐        ┌───────────────┐ ┌──────────────┐
                 │ Razorpay hosted│        │ PostgreSQL    │ │ Razorpay/    │
                 │ checkout page  │        │ (Neon)        │ │ Stripe/PayPal│
                 └────────────────┘        └───────┬───────┘ └──────────────┘
                                                   │
                                    ┌──────────────┼───────────────┐
                                    ▼              ▼               ▼
                                 Redis (Upstash)  S3/UploadThing  Claude API
                                 cache/sessions   media           AI Center
```

Track A can call Razorpay's **hosted payment page / payment link** (a plain URL,
no server) so a real purchase is possible even on static hosting. Order capture,
fulfilment, and webhooks are Track B.

---

## 3. Repository & module structure (feature-based, Clean Architecture)

Target structure (Track A folders exist now; Track B folders are added when the
backend lands — the boundary is deliberate):

```
prisma/
  schema.prisma                 # canonical domain model (source of truth)
docs/
  ARCHITECTURE.md  ROADMAP.md
src/
  app/                          # Next.js App Router (routes = thin controllers)
    (storefront)/               # Track A route group
      page.tsx  [category]/  products/[slug]/  c/[slug]/  cart/  checkout/  search/
    (admin)/                    # Track B — Business OS (added later)
    api/                        # Track B — route handlers + webhooks
  core/                         # ← domain layer, framework-agnostic
    catalog/  pricing/  cart/  seo/     # entities, value objects, use-cases
  data/
    store.ts                    # repository API (in-memory now → Prisma later)
    repositories/               # Track B — Prisma-backed implementations
  lib/                          # cross-cutting: site config, schema-org, money
  components/                   # UI (design-system primitives + features)
  server/                       # Track B — actions, auth, payments, ai, jobs
```

**Dependency rule:** `app → core → data`. `core` never imports Next.js or
Prisma. `app` never imports Prisma directly — only through `data`. This is what
lets the data source swap invisibly.

Naming/style conventions follow the existing repo: money is integer **paise**
(`priceInPaise`), never floats; slugs are the public identifier; query helpers
return `*WithRelations` shapes; schema.org objects are plain objects.

---

## 4. Data architecture (Phase 3 summary — full model in `schema.prisma`)

The Prisma schema models **43 entities** across nine domains. Highlights specific
to *luxury jewellery* (beyond a generic store):

- **Composed pricing** — `PriceBreakup` (metal value = rate × net weight, making
  charge, stone value, wastage, GST) instead of one opaque price. A gold-rate
  change reprices the catalogue.
- **Jewellery attributes** — `metal`, `purity` (14K/18K/22K/PT950/S925),
  `grossWeight`/`netWeight` (grams), `Gemstone` (type, carat, cut, clarity,
  colour, count), `Certification` (IGI/GIA/BIS hallmark, cert number, URL),
  `size` (ring size, chain length, bangle size).
- **Variants** — a design in multiple metals/purities/sizes = `ProductVariant`
  with its own SKU, weight, price breakup, inventory.
- **Trust & post-sale** — `Hallmark`, buyback/exchange via `Return`, lifetime
  `warranty`, `Appointment` (try-at-home / video call), `GiftCard`.
- **Commerce spine** — users/roles/permissions, cart, order, payment,
  transaction, coupon, shipping, tax, address, review, wishlist, reward points,
  referral, notification, activity/audit logs, media, SEO, navigation, homepage
  sections, theme settings, CMS pages, blog, countries/currencies/languages.

Every table carries `id`, `createdAt`, `updatedAt`; soft-delete via
`deletedAt` where business history matters (orders, products); `slug` unique
where public.

---

## 5. Cross-cutting concerns

- **SEO / schema.org** — keep `src/lib/schema-org.ts`; extend Product schema with
  jewellery-specific fields (material, gemstone). Keep the **indexability guard**
  in `src/lib/collections.ts` (noindex thin permutation pages) — critical for a
  long-tail jewellery catalogue.
- **Money** — always integer paise; a single `formatPrice` in `lib/site.ts`;
  multi-currency via a `Currency` table + display-time conversion (never store
  converted amounts).
- **Security** — Track B: RBAC (`Role`/`Permission`), signed payment webhooks
  with idempotency keys, server-side price recomputation at checkout (never
  trust client cart totals), audit log on every admin mutation, PII minimisation.
  Track A: no secrets in the static bundle; payment handled by hosted page.
- **Performance** — static HTML + CDN is already fast; `next/image` with
  `unoptimized` on static host (pre-optimise assets in CI); lazy-load PDP media;
  Redis cache + ISR once on Node host.
- **Accessibility** — WCAG 2.2 AA target: semantic landmarks, visible focus
  (already in `globals.css`), colour-contrast-checked luxury palette, keyboard
  cart/drawer, `alt` on every product image.

---

## 6. End-of-phase reviews (Phases 1–3)

| Review | Verdict | Notes / actions taken |
|---|---|---|
| **Architecture** | ✅ Pass | Repository boundary makes static→full-stack additive. Dependency rule documented. |
| **UX** | ✅ Pass (design system is Phase 4) | Jewellery PDP needs certification/spec block — added to Track A now. |
| **Security** | ⚠️ Deferred to Track B | Static site holds no secrets; checkout via hosted page. Server-side price recompute is a hard requirement flagged for Phase 6. |
| **Performance** | ✅ Pass | Static + CDN. Image pre-optimisation flagged (unoptimized loader). |
| **SEO** | ✅ Pass | Programmatic-collection engine + indexability guard retained; schema extended for jewellery. |
| **Accessibility** | ⚠️ Track | Palette contrast verified; full audit scheduled Phase 10. |
| **Business** | ✅ Pass | Composed pricing + certification model matches how jewellery is actually sold/priced in India. |

**Open risks carried forward:** (1) no server-side price validation until Track B
— acceptable while checkout is a hosted link; (2) gold-rate feed is manual until
an admin/integration exists; (3) real product photography required to hit the
Cartier-level bar (Unsplash placeholders are a stand-in).

---

## 7. What ships in this repo now vs. next

**Shipped in Phase 1–3 (this session):** this document, `ROADMAP.md`, the full
`prisma/schema.prisma`, and the **jewellery rebuild of Track A's data + brand**
(catalogue, categories, collections, site identity, luxury design tokens, PDP
spec block) — all building green under `next build` / static export.

**Next (Phase 4 → 5):** full luxury design-system component library
(shadcn/ui + Framer Motion), refined homepage/collection/PDP layouts, filters,
wishlist, gifting, appointment CTA. See `ROADMAP.md`.
