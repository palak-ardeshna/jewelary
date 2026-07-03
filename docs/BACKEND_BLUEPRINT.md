# Aurelia — Production Backend Blueprint

> **Purpose.** A directly-implementable backend architecture for the Aurelia
> fine-jewellery platform, reverse-engineered from the current codebase. This
> document assumes the reader has read [`ARCHITECTURE.md`](./ARCHITECTURE.md)
> (two-track model, Phases 1–3) and does **not** repeat it. It goes deeper on
> **Phases 4–8**: the concrete backend, API surface, service/repository layers,
> RBAC, caching, jobs, performance, and the flow diagrams — the "Track B"
> ([`ROADMAP.md`](./ROADMAP.md) Phases 6–9) that has never been built.
>
> Every decision states **why**. Where the current code makes an assumption that
> breaks under a real backend, it is called out explicitly with a `file:line`
> reference, not glossed over.

---

## 0. Grounding — what actually exists today (reverse-engineered)

This is the honest current state, verified by reading the code, not the docs.

### 0.1 The data layer is a single in-memory module

[`src/data/store.ts`](../src/data/store.ts) holds **26 products, 9 categories,
2 brands, 8 reviews, 4 collections** as TypeScript literals. Every "query" is a
synchronous `Array.filter/.sort`. There is **no DB, no async, no I/O**. The
canonical model is [`prisma/schema.prisma`](../prisma/schema.prisma) (43 models)
— it is **not run at runtime**; `store.ts` mirrors a *tiny subset* of it (≈15
Product fields vs. the schema's full variant/pricing/inventory graph).

**The repository contract is real and worth preserving.** Routes import only
query helpers (`getProductBySlug`, `findProductsByFilter`, `searchProducts`…),
never the arrays. That is the seam the whole migration hinges on.

### 0.2 Commerce is 100% client-side and trust-the-client

| Concern | Where it lives today | Risk when money is real |
|---|---|---|
| Cart | React context + `localStorage["trendora_cart"]` ([CartProvider.tsx:32](../src/components/CartProvider.tsx#L32)) | Line prices come from client props ([AddToCartButton.tsx:28-32](../src/components/AddToCartButton.tsx#L28-L32)); user can edit localStorage freely |
| Totals | Computed in browser, in paise ([CartProvider.tsx:76-77](../src/components/CartProvider.tsx#L76-L77)) | Subtotal, ₹199 free-ship threshold, ₹49 delivery all client-authored |
| Checkout | 4-step wizard, **fake COD**, `setTimeout(1600)` then writes `localStorage["aurelia_orders"]` ([checkout/page.tsx:62-85](../src/app/checkout/page.tsx#L62-L85)) | No gateway, no charge, no server order. Order `total` is attacker-controlled |
| Stock | `inStock` only disables a button ([AddToCartButton.tsx:35](../src/components/AddToCartButton.tsx#L35)) | Nothing decrements inventory; quantities unbounded |
| Auth | None. Account is a hard-coded "Guest User" placeholder ([account/page.tsx:24-32](../src/app/account/page.tsx#L24-L32)) | Orders/wishlist are device-local, tied to no identity |
| Admin | Edits **engagement config only**, persisted to `localStorage["aurelia_eng:config"]` per-browser; gate is `NEXT_PUBLIC_ADMIN_*` creds inlined in the bundle + a `sessionStorage` flag ([adminAuth.ts:14-15](../src/lib/engagement/adminAuth.ts#L14-L15)) | Credentials ship in plaintext JS; bypass by setting one sessionStorage key |
| Search | Client-side `.filter` over the whole shipped catalog ([search/page.tsx](../src/app/search/page.tsx), [store.ts:445](../src/data/store.ts#L445)) | Entire catalog shipped to browser; no relevance, no pagination |

### 0.3 Two real bugs found (fix regardless of backend work)

1. **cart/page.tsx renders every price 100× too large.** Its local `fmt()`
   ([cart/page.tsx:7-9](../src/app/cart/page.tsx#L7-L9)) formats paise directly
   without `/100`, unlike every other formatter (`CartDrawer`, `checkout`,
   `lib/site.formatPrice` all divide by 100). `₹199` shows as `₹19,900`.
2. **Order-success ID mismatch.** [checkout/success/page.tsx:8](../src/app/checkout/success/page.tsx#L8)
   generates a *fresh* random `AUR…` id and ignores the `?id=` param, so the
   confirmation ID never matches the order saved to `localStorage`.

These belong in Track B's server flow anyway (server owns order numbers and
price formatting), but the cart display bug should be patched now.

### 0.4 What is genuinely good and must be kept

- **Repository seam** ([store.ts](../src/data/store.ts)) — the migration lever.
- **Indexability guard** ([collections.ts](../src/lib/collections.ts)) — generate
  every permutation, index only those with ≥3 live products and ≥120 chars of
  unique intro. Belt-and-suspenders: `noindex` meta **and** sitemap exclusion
  **and** dropped `ItemList` JSON-LD. This is the anti-doorway-page moat.
- **Schema.org automation** ([schema-org.ts](../src/lib/schema-org.ts)) — Org +
  WebSite site-wide, Breadcrumb everywhere, Product+Offer+AggregateRating on PDP,
  ItemList on indexable listings.
- **Config-driven engagement** ([src/lib/engagement/](../src/lib/engagement)) —
  every popup/bar/toast/rail is a data row with targeting/frequency/A-B, funneled
  through one `track()` sink. This is the right shape; it just needs a server
  home for config + events.
- **Money discipline** — integer paise, integer milligrams. Never floats. Keep.

---

## Phase 2 — Feature inventory (complete)

**Customer** — browse home/category/subcategory/PDP/collection; client search;
filter+sort (color/price/sort); cart (add/update/remove, size variants);
wishlist; 4-step checkout (fake COD); order history (localStorage); account
placeholder; recently-viewed; social-proof toasts; free-ship progress bar;
sticky add-to-cart; gift-wrap upsell; cross-sell/related rails; welcome/exit
popups with email capture (nothing persisted).

**Admin** — engagement-config editor only (popups, bars, upsells, rails,
targeting, A/B, analytics sink). No product/order/customer management exists.

**Shared** — schema.org JSON-LD; sitemap/robots; indexability guard; site config
(`SITE_URL`, announcements); Icon system; design tokens.

**Future (schema-anticipated, unbuilt)** — variants/SKUs, composed `PriceBreakup`,
inventory/warehouses/stock movements, real auth+RBAC, orders/payments/refunds,
shipping zones/tax/returns, coupons/gift-cards/rewards/referrals, appointments
(try-at-home/video), CMS/blog/builders, notifications (email/SMS/WhatsApp),
AI Center, analytics warehouse, multi-currency/locale.

**Missing (needed for production, absent from both code and schema)** —
`OrderStatusHistory`, `WebhookEvent` (idempotent inbox), `Outbox` (reliable
dispatch), `CouponRedemption` (per-user enforcement), `InventoryReservation`
(cart holds with TTL), `IdempotencyKey` (order create), search index, rate-limit
store, verified-purchase constraint on reviews. Addressed in Phase 3.

---

## Phase 3 — Database: improvements to the canonical schema

The existing 43-model schema is strong (composed pricing, variants,
certification, jewellery attributes, RBAC skeleton, audit/activity logs). The
following are **corrections and additions** required before it is production-safe.
Rationale given for each.

### 3.1 Money type safety

- `Int` paise caps at **₹21,474,836** (2^31−1 paise). A single high-jewellery
  bridal order can exceed this. **Change all monetary aggregate fields**
  (`Order.*Paise`, `Payment.amountPaise`, `Transaction.amountPaise`,
  `PriceBreakup.*`) **to `BigInt`.** Line-item unit prices can stay `Int`.
  *Why:* silent 32-bit overflow on a luxury cart is a catastrophic, hard-to-test
  failure.

### 3.2 Missing tables (add)

```prisma
// Immutable order-status timeline — replaces the single Order.status for audit.
model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    OrderStatus
  note      String?
  actorId   String?     // admin or system
  createdAt DateTime    @default(now())
  @@index([orderId, createdAt])
}

// Idempotent webhook inbox — dedupe Razorpay/Stripe retries.
model WebhookEvent {
  id          String   @id @default(cuid())
  provider    PaymentProvider
  eventId     String   // provider's event id
  signature   String
  payload     Json
  processedAt DateTime?
  createdAt   DateTime @default(now())
  @@unique([provider, eventId])   // the dedupe guarantee
}

// Transactional outbox — reliable notification/analytics dispatch.
model OutboxEvent {
  id          String   @id @default(cuid())
  aggregate   String   // "order", "payment"...
  aggregateId String
  type        String   // "order.confirmed"...
  payload     Json
  dispatchedAt DateTime?
  attempts    Int      @default(0)
  createdAt   DateTime @default(now())
  @@index([dispatchedAt])
}

// Per-user coupon usage — enforces Coupon.perUserLimit (usedCount alone can't).
model CouponRedemption {
  id       String   @id @default(cuid())
  couponId String
  coupon   Coupon   @relation(fields: [couponId], references: [id], onDelete: Cascade)
  userId   String?
  orderId  String
  createdAt DateTime @default(now())
  @@unique([couponId, orderId])
  @@index([couponId, userId])
}

// Inventory reservation with TTL — cart holds that auto-release.
model InventoryReservation {
  id          String   @id @default(cuid())
  variantId   String
  variant     ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  quantity    Int
  cartId      String?
  orderId     String?
  expiresAt   DateTime // released by a sweeper job
  createdAt   DateTime @default(now())
  @@index([variantId])
  @@index([expiresAt])
}

// Idempotency for POST /orders and payment intents.
model IdempotencyKey {
  key        String   @id
  scope      String   // "order.create"...
  response   Json?    // cached response to replay on retry
  createdAt  DateTime @default(now())
  @@index([createdAt])
}
```

### 3.3 Relation / constraint fixes

- **Anonymous wishlist.** `WishlistItem.userId` is required, but the storefront
  has anonymous wishlists today. Mirror `Cart`'s pattern: add
  `sessionId String?` and make `userId` nullable, with
  `@@unique([sessionId, productId])`. *Why:* pre-auth users must keep wishlists;
  merge into the account on login.
- **Verified-purchase reviews.** Add `orderId String?` to `Review` and
  `@@unique([userId, productId])`. *Why:* one review per customer per product,
  and `isVerified` should be derivable from a real order, not a manual flag.
- **`PriceBreakup` XOR.** It has both `productId?` and `variantId?`. Add a DB
  `CHECK` (via raw migration) that exactly one is non-null. *Why:* Prisma can't
  express XOR; without it a breakup can attach to both or neither.
- **`Product.gender`** is a free `String`. Promote to an enum
  (`WOMEN MEN UNISEX KIDS`). *Why:* free-text kills faceted filtering and clean
  schema.org `audience`.
- **Non-negative money / valid rating.** Raw-migration `CHECK` constraints:
  `*Paise >= 0`, `Review.rating BETWEEN 1 AND 5`, `quantity > 0`. *Why:* the app
  layer will have bugs; the DB is the last line of defense.

### 3.4 Indexes (add — the schema under-indexes hot paths)

```prisma
// Product: category listings + status filter (the PLP query)
@@index([status, categoryId])
@@index([categoryId, createdAt])           // "new arrivals"
// Order: customer history + admin queues
@@index([userId, createdAt])
@@index([status, createdAt])
// Collection: sitemap generation reads indexable often
@@index([indexable])
// AnalyticsEvent: already indexed on name/createdAt — add (userId) and
// consider native Postgres range partitioning by createdAt at scale.
```

### 3.5 Full-text search (currently client `.filter`)

Add a `tsvector` column to `Product` (name+description+metal+gemstone) with a
GIN index and a trigger to maintain it, **or** — recommended at catalog scale —
externalize to **Meilisearch/Typesense** (typo tolerance, faceting, instant
search) fed by the same Product repository. *Why:* shipping the whole catalog to
the browser ([search/page.tsx](../src/app/search/page.tsx)) does not scale past a
few hundred SKUs and gives no relevance ranking.

### 3.6 Scalability posture

- `AnalyticsEvent`, `ActivityLog`, `AuditLog`, `Notification` are append-heavy →
  **range-partition by `createdAt`** (monthly) once past ~10M rows; archive cold
  partitions to object storage (the `Backup` model already anticipates this).
- Read replicas for catalog reads; primary for writes. The repository layer
  routes reads/writes (see Phase 4).

**Self-review — Phase 3:** ✅ Money overflow closed (BigInt); idempotency +
outbox + reservation close the three classic e-commerce correctness holes
(double-charge, lost notification, oversell); per-user coupon and verified-review
constraints enforce business rules at the DB. Open item: multi-currency stored as
`rateToBase ×1e6` — confirm rounding policy (banker's rounding) is centralized in
one money module before go-live.

---

## Phase 4 — Backend architecture

### 4.1 The one decision: modular monolith on Next.js Route Handlers + Server Actions

**Recommendation: a modular monolith inside the existing Next.js app** (Node
runtime on Track B host), **not** a separate NestJS service — *initially*.

*Why:* the repository seam already lives in the Next app; Server Components can
call the domain layer directly (zero network hop for reads); one deploy, one
auth context, shared types. A modular monolith with clean module boundaries can
be extracted into services later if a module (e.g. Search, AI Center) needs
independent scaling. Premature microservices here would add ops cost with no
throughput benefit at this stage.

**When to split out a service:** AI Center (long-running, different scaling and
cost profile) and Search (Meilisearch is already a separate process) are the
natural first extractions.

### 4.2 Clean Architecture layering (dependency rule: `app → core → data`)

```
src/
  app/                      # Next routes = THIN controllers (auth, parse, call use-case, respond)
    api/                    # Route Handlers (webhooks, REST for TanStack Query, feeds)
    (storefront)/ (admin)/  # Server Components call use-cases directly
  core/                     # DOMAIN — framework-agnostic, no Next, no Prisma
    catalog/ pricing/ cart/ order/ payment/ inventory/ promo/ seo/
      <module>/
        entities.ts         # value objects, invariants (Money, PriceBreakup calc)
        use-cases/          # PlaceOrder, RecomputeCart, ApplyCoupon, ReserveStock
        ports.ts            # repository INTERFACES the use-cases depend on
  data/
    store.ts                # KEEP: the interface (in-memory today)
    repositories/           # Prisma implementations of core ports.ts
  server/                   # infra: auth, payments, jobs, email, ai, cache, logger
  lib/                      # cross-cutting: money, site config, schema-org, validation
```

- **`core` never imports Prisma or Next.** It depends on `ports.ts` interfaces.
  `data/repositories` implement them with Prisma. This is what already lets
  `store.ts` swap invisibly — formalize it into ports per module.
- **Routes/actions are thin:** authenticate → validate DTO (Zod) → call one
  use-case → map result to HTTP. No business logic in controllers.

### 4.3 Validation layer

**Zod** schemas at every boundary (route body, search params, server-action
input). Infer TS types from the schema so DTO and validation never drift. Reject
early with a typed error → 422. *Why:* the current checkout validation is trivial
regex, client-only ([checkout/page.tsx:33-46](../src/app/checkout/page.tsx#L33-L46));
server-side schema validation is non-negotiable.

### 4.4 Auth + RBAC

- **Better Auth** (or Auth.js) for sessions, email/password + social + OTP
  (phone is a first-class India signal). Sessions in the existing `Session`
  table; short-lived JWT access + rotating refresh, HttpOnly SameSite cookies.
- **RBAC** off the existing `Role`/`Permission`/`RolePermission` models.
  Permission keys are `group.action` (`product.create`, `order.refund`). A single
  `authorize(user, "order.refund")` guard in the use-case layer (not the
  controller) — *why:* Server Components and jobs must enforce the same rule, so
  it lives below the HTTP layer. Use **CASL** if row-level rules appear (e.g.
  "customer can read only their own orders").
- **Replace the demo admin gate entirely.** [adminAuth.ts](../src/lib/engagement/adminAuth.ts)
  ships credentials in the client bundle — delete it on Track B; admin sits
  behind real sessions + `role in (OWNER, ADMIN, MANAGER)`.

### 4.5 Caching (multi-tier)

| Tier | Use | Invalidation |
|---|---|---|
| **Next ISR / `revalidateTag`** | PLP, PDP, collection, category HTML | tag per entity (`product:<id>`, `category:<slug>`); admin mutation calls `revalidateTag` |
| **Redis (Upstash)** | hot reads (product-by-slug, gold rate, cart, coupon lookup), rate-limit counters, sessions | write-through on mutation; TTL on rate feed |
| **HTTP/CDN** | static assets, images | content hash |

*Why tags over time-based:* jewellery prices move with the gold rate; a repricing
job must instantly bust affected PDPs, which `revalidateTag('gold-rate')` does
cleanly.

### 4.6 File storage / media

**Cloudflare R2** (or S3) + **UploadThing/presigned PUT** for admin uploads.
Serve via CDN. On the static Track-A host, keep `images.unoptimized` and
pre-optimize (AVIF/WebP, responsive sizes) in CI; on Track B use `next/image`.
Store only the key/URL in `Media`; never proxy bytes through the app.
*Why:* jewellery needs high-res zoom + 360° — object storage + CDN is the only
sane path; the app server must not stream images.

### 4.7 Background jobs

**BullMQ on Redis.** Queues: `payments` (webhook processing), `notifications`
(email/SMS/WhatsApp from the Outbox), `inventory` (reservation-expiry sweeper),
`pricing` (gold-rate repricing), `search` (index sync), `ai` (generations),
`sitemap` (regenerate on catalog change). *Why BullMQ:* the reservation sweeper
and outbox dispatcher are the reliability backbone — they need retries, delays,
and dead-letter queues, which Redis-backed BullMQ gives natively.

### 4.8 Notifications / email

**Resend** (transactional email) + **MSG91/Gupshup** (India SMS/WhatsApp). Driven
by the `MessageTemplate` model (handlebars vars) and the **Outbox pattern**:
use-cases write an `OutboxEvent` in the *same transaction* as the state change; a
dispatcher job sends and marks `dispatchedAt`. *Why outbox:* guarantees "order
confirmed ⇒ email queued" atomically — no lost confirmations, no phantom emails on
rollback.

### 4.9 Logging / error handling / monitoring

- **pino** structured logs (JSON), request-id correlation.
- **Sentry** for exceptions (client + server); **OpenTelemetry** traces across
  route → use-case → Prisma → external calls.
- **Typed error taxonomy** in `core`: `DomainError` (422 business rule),
  `NotFoundError` (404), `AuthError` (401/403), `ConflictError` (409, e.g.
  idempotency/oversell). One error-mapping middleware converts them to HTTP.
- Health/readiness endpoints; uptime + payment-webhook-failure alerts.

**Self-review — Phase 4:** ✅ Modular monolith keeps the proven repository seam
and avoids premature distribution while leaving clean extraction points.
Authorization lives below HTTP so SC/jobs/routes share one rule. Outbox +
idempotent webhook inbox + reservation sweeper form a coherent reliability story.
Risk: Server Actions + Route Handlers can duplicate logic — mitigated by both
calling the *same* use-case; controllers stay thin.

---

## Phase 5 — API design (critical flows in full; rest tabulated)

Convention: REST under `/api/*` for client (TanStack Query) + webhooks;
**Server Actions** for mutations initiated by Server Components (cart, checkout,
wishlist) to avoid a network round-trip and get progressive enhancement. All
money in paise; all list endpoints cursor-paginated.

### 5.1 `POST /api/cart/items` (add to cart) — the trust boundary

- **Method/Input:** `{ productId, variantId, size?, quantity }`. **Never accept a
  price from the client** (fixes [AddToCartButton.tsx:28-32](../src/components/AddToCartButton.tsx#L28-L32)).
- **Validation:** Zod; `quantity 1..maxPerOrder`; variant belongs to product;
  product `ACTIVE`.
- **Business rules:** server looks up the **current** `PriceBreakup.finalPaise`;
  checks `Inventory.onHand − reserved ≥ quantity`; creates an
  `InventoryReservation` (TTL 15 min); upserts `CartItem` with server
  `unitPaise` snapshot.
- **DB flow:** `Product/Variant → PriceBreakup → Inventory (SELECT … FOR UPDATE)
  → InventoryReservation → CartItem` in one transaction.
- **Output:** full recomputed cart (items, subtotal, applicable shipping/tax
  hint). **Errors:** 404 product, 409 out-of-stock, 422 invalid qty.
- **Permissions:** public (session or user). **Caching:** cart is per-session, no
  shared cache; invalidate the session's cart tag.
- **Frontend:** optimistic add via TanStack Query mutation; rollback on 409.

### 5.2 `POST /api/checkout` (create order) — server recompute + idempotency

- **Input:** `{ cartId, shippingAddressId, billingAddressId?, couponCode?,
  giftCardCode?, paymentProvider }` + header `Idempotency-Key`.
- **Business rules (the core of a real backend):**
  1. Reload cart from DB; **recompute every line price from the catalog** —
     ignore any client totals.
  2. Re-validate stock against live `Inventory` (reservations still valid).
  3. Apply coupon (check `isActive`, window, `minOrderPaise`, `perUserLimit` via
     `CouponRedemption`, scope) and gift card (balance).
  4. Compute shipping (`ShippingZone/Rate`, `freeAbovePaise`) and tax (`TaxRate`
     ppm — GST 3% metal / making split for jewellery).
  5. Create `Order` (status `PENDING`) + `OrderItem` **snapshots**
     (name/sku/price frozen) + `OrderStatusHistory` + `Payment` (`CREATED`) +
     `OutboxEvent(order.created)`, all in **one transaction**, keyed by
     `IdempotencyKey` (retry replays the cached response).
- **Output:** `{ orderNumber, payment: { provider, clientToken/orderId } }` to
  open the gateway. **Errors:** 409 stock/price-changed (return diff so UI can
  confirm), 422 coupon invalid, 402 gift-card insufficient.
- **Permissions:** session owner. **Caching:** none (write).
- **Frontend:** Server Action from the checkout wizard; on success redirect to
  gateway, not to a fake success page.

### 5.3 `POST /api/webhooks/razorpay` (+ `/stripe`) — idempotent capture

- **Input:** raw body + signature header. **Validation:** verify HMAC signature
  first (reject 400 on mismatch); dedupe via `WebhookEvent unique(provider,
  eventId)`.
- **Business rules:** on `payment.captured` → `Payment.CAPTURED` +
  `Transaction(CHARGE, rawPayload)` + `Order.CONFIRMED` +
  `OrderStatusHistory` + convert reservations to committed stock decrement +
  `CouponRedemption` + reward accrual + `OutboxEvent(order.confirmed)`. On
  `failed` → release reservations, `Order.CANCELLED`.
- **Output:** 200 fast (ack); real work via the `payments` queue. **Permissions:**
  none (signature is the auth). *Why signature-first + dedupe:* providers retry
  aggressively; without both you double-capture and oversell.

### 5.4 Catalog & the rest (representative)

| Endpoint | Method | Auth | Cache | Notes |
|---|---|---|---|---|
| `/api/products` | GET | public | ISR tag `products` | cursor page, facets (metal/purity/gem/price/gender) |
| `/api/products/[slug]` | GET | public | ISR tag `product:<id>` | full graph; SC reads repo directly |
| `/api/search?q=` | GET | public | short Redis TTL | Meilisearch; typo-tolerant, faceted |
| `/api/collections/[slug]` | GET | public | ISR tag | runs indexability guard server-side |
| `/api/wishlist` | GET/POST/DELETE | session | per-session | anon (sessionId) → merge on login |
| `/api/orders` / `/[number]` | GET | owner or `order.read` | none | customer history / admin |
| `/api/admin/products` | POST/PATCH | `product.*` | busts ISR tag | audit-logged, `revalidateTag` |
| `/api/admin/orders/[id]/refund` | POST | `order.refund` | — | gateway refund + `Transaction(REFUND)` + audit |
| `/api/admin/engagement/config` | GET/PUT | `settings.write` | Redis | replaces localStorage override |
| `/api/gold-rate` | GET | public | Redis TTL 5m | feeds repricing + PDP breakup |
| `/feed.xml` | GET | public | ISR | Google Merchant Center product feed |

Every admin mutation writes an `AuditLog` (before/after JSON) and calls
`revalidateTag`. Every list endpoint is cursor-based (never `OFFSET` at scale).

**Self-review — Phase 5:** ✅ The three money-critical endpoints (add-to-cart,
checkout, webhook) all recompute server-side and are idempotent; client prices are
never trusted. Coupon/stock/tax rules live in use-cases, reused by REST and
Server Actions. Gap to close in build: define the 409 "price/stock changed" diff
payload shape so the UI can show "the gold rate changed, confirm new total" — a
real jewellery UX need.

---

## Phase 6 — Frontend integration strategy

| Feature | Rendering | Data strategy | Why |
|---|---|---|---|
| Home / PLP / PDP / collection | **Server Components + ISR** | repo called directly server-side; `revalidateTag` | SEO-critical, cacheable, no client JS for content |
| Category filter/sort | **SC with searchParams** (server-filter) | replace client `CategoryProducts` filter with server query | today it ships whole catalog + filters in browser ([CategoryProducts.tsx](../src/components/CategoryProducts.tsx)) |
| Search | Client + **TanStack Query** → Meilisearch API | debounced, instant, faceted | can't build-time; needs relevance + pagination |
| Cart / wishlist | Client islands + **Server Actions** + optimistic | mutation with rollback | instant UX, server owns truth |
| Checkout | Client wizard → **Server Action** per step-commit | server validates + creates order | no client money math |
| Order history / account | **SC** (authenticated) | per-user server fetch | replaces localStorage orders |
| Engagement widgets | Client, config from **`/api/engagement/config`** (SWR-cached) | server config + server events | replaces localStorage-only config |
| Admin | Client app behind session; **TanStack Query** mutations | REST + optimistic + `revalidateTag` | real CRUD with cache busting |

Principles: **Server Components for anything indexable**; **Server Actions for
mutations from SCs** (progressive enhancement, no manual fetch); **TanStack Query
for client-driven, frequently-refetched data** (search, admin lists, cart badge)
with optimistic updates + query invalidation; **cursor pagination / infinite
scroll** on PLP and search; **`revalidateTag`** as the single cache-coherence
mechanism between admin writes and storefront reads.

**Self-review — Phase 6:** ✅ Content stays server-rendered (SEO intact),
mutations get optimistic UX without trusting the client, and one invalidation
model (tags) links admin writes to storefront freshness. Migration is incremental:
each client island (`CartProvider`, search, filter) swaps to a Server Action /
API without touching the routes — same seam the repo already relies on.

---

## Phase 7 — Performance review & fixes

| Issue | Where | Fix |
|---|---|---|
| **Whole catalog shipped to client** | search + category filter run in browser | server-side Meilisearch/query; ship only the page |
| **N+1 on order/PDP graphs** | future Prisma reads | Prisma `include`/`select` for exactly-needed fields; DataLoader for batched review/media loads |
| **Overfetch** | `getProductBySlug` returns full graph even for cards | `select` narrow projections for PLP cards vs. PDP |
| **`OFFSET` pagination** | any large list | cursor (keyset) pagination on `(createdAt, id)` |
| **Unbounded cart quantity** | [CartProvider.tsx:69-72](../src/components/CartProvider.tsx#L69-L72) | server `maxPerOrder` clamp |
| **Image weight** | `unoptimized`, Unsplash placeholders | R2 + responsive AVIF/WebP; `next/image` on Track B; real product photography |
| **Repricing storms** | gold-rate change touches many PDPs | batch reprice job + single `revalidateTag('gold-rate')` |
| **Analytics table bloat** | append-heavy `AnalyticsEvent` | partition by month; async ingestion via queue, never inline |
| **Bundle** | client engagement + confetti | dynamic-import below-the-fold widgets; keep engagement config fetch out of critical path |

Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1; catalog reads served from
ISR/Redis; DB primary reserved for writes with read replicas for catalog.

**Self-review — Phase 7:** ✅ The dominant cost (shipping the catalog to the
browser) is eliminated by server search/filter; keyset pagination and narrow
projections prevent the two classic Prisma scaling traps (OFFSET, over-select);
image pipeline moves off the app server. Verify with a load test on the
checkout+webhook path (the only write-heavy, correctness-critical flow) before
launch.

---

## Phase 8 — Flow diagrams

### 8.1 Request flow (read)
```
Browser ─▶ CDN ─▶ Next (SC/ISR) ─▶ [cache hit? serve] ─▶ use-case ─▶ repo(Prisma) ─▶ Postgres(replica)
                                        └─ Redis hot-read ─┘
```

### 8.2 Authentication flow
```
Login ─▶ Better Auth verify ─▶ create Session ─▶ HttpOnly access(JWT)+refresh cookie
Request ─▶ middleware reads session ─▶ load roles/permissions (Redis-cached)
        ─▶ use-case authorize(user, "perm.key") ─▶ allow / 403
Refresh ─▶ rotate refresh, mint new access ; anon cart+wishlist merged into user on login
```

### 8.3 Order flow
```
Cart ─▶ POST /checkout (Idempotency-Key)
  ├─ reload cart from DB
  ├─ RECOMPUTE prices from catalog (ignore client)
  ├─ revalidate stock (reservations)
  ├─ apply coupon + gift card + shipping + tax
  └─ TX: Order(PENDING)+Items(snapshot)+StatusHistory+Payment(CREATED)+Outbox(order.created)
        ─▶ return gateway token
Gateway ─▶ webhook(captured) ─▶ verify sig ─▶ dedupe(WebhookEvent)
        └─ TX: Payment(CAPTURED)+Transaction(CHARGE)+Order(CONFIRMED)+StatusHistory
                +commit stock decrement+CouponRedemption+reward accrual+Outbox(order.confirmed)
Outbox dispatcher ─▶ email/SMS/WhatsApp (confirmation)
```

### 8.4 Payment flow
```
CREATED ─▶ (gateway) AUTHORIZED ─▶ CAPTURED ─▶ [refund?] ─▶ REFUNDED / PARTIALLY_REFUNDED
   │                                   │
   └─▶ FAILED ─▶ release reservations ─┘ (Order CANCELLED)
Every transition: Transaction row (rawPayload) + idempotent on provider eventId
```

### 8.5 Inventory flow
```
add-to-cart ─▶ Reservation(TTL 15m), onHand−reserved gate
checkout ─▶ reservation extended to order
capture ─▶ StockMovement(SALE), reserved→committed, onHand decremented
expiry sweeper (BullMQ) ─▶ delete stale reservations, free stock
return/cancel ─▶ StockMovement(RETURN/RELEASE), onHand restored
reorderLevel breached ─▶ low-stock notification
```

### 8.6 Admin flow
```
Admin login (real session) ─▶ RBAC gate (OWNER/ADMIN/MANAGER)
mutate (product/order/coupon/engagement-config)
  ─▶ Zod validate ─▶ use-case ─▶ TX write ─▶ AuditLog(before/after) ─▶ revalidateTag(...)
  ─▶ storefront ISR refreshed on next request
```

### 8.7 Customer flow
```
Discover (SEO SC pages) ─▶ PDP (certification/breakup/360) ─▶ wishlist/appointment
 ─▶ cart (reserved) ─▶ checkout (server recompute) ─▶ pay ─▶ confirmation email
 ─▶ order tracking ─▶ delivery ─▶ review (verified) / return
```

---

## 9. Migration sequence (Track A → Track B, no rewrite)

1. **Stand up infra:** Node host (Vercel/Railway) + Neon Postgres + Upstash Redis
   + R2. `prisma migrate` the (improved) schema.
2. **Formalize ports:** extract `core/*/ports.ts` interfaces from today's
   `store.ts` signatures; add `data/repositories` Prisma implementations. Swap
   `store.ts` bodies. **Routes/components unchanged** — the seam holds.
3. **Auth + RBAC** (Better Auth) → delete the demo admin gate.
4. **Server cart + checkout + webhooks** (Server Actions/Route Handlers) →
   retire localStorage cart/orders; server owns price/stock/order-number.
5. **Admin Business OS** (products/orders/inventory/coupons + engagement config to
   DB) → retire localStorage config override.
6. **Search** (Meilisearch) → retire client `.filter`.
7. **Jobs, notifications, analytics warehouse, AI Center** (Roadmap 8–9).

Track A can keep serving the static storefront throughout; Track B comes online
module by module behind the same repository interface.

---

## 10. Consolidated production-readiness verdict

| Dimension | Verdict | Blocking items before launch |
|---|---|---|
| Data model | ✅ (with §3 changes) | BigInt money, idempotency/outbox/reservation tables, XOR + non-negative constraints |
| Architecture | ✅ | ports.ts per module; authorization below HTTP |
| Security | ⚠️ | server price recompute, real auth+RBAC, signed idempotent webhooks, delete client-cred admin gate, rate limiting |
| Payments | ⚠️ | replace fake COD with Razorpay/Stripe + webhook capture; refund path |
| Performance | ✅ | server search/filter, keyset pagination, image pipeline |
| SEO | ✅ | keep indexability guard + schema; add product feed; emit `image` in Product JSON-LD even for placeholder-resolved images |
| Correctness (existing) | 🔧 | fix cart/page 100× price bug; server-owned order numbers |

**The non-negotiables** (any one missing = do not launch with real money):
server-side price/stock recompute at checkout, signed + idempotent payment
webhooks, real authentication, and audit logging on admin mutations. Everything
else is additive on top of the repository seam this codebase already gets right.
