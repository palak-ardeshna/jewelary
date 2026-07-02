# Customer Engagement & Conversion System

A config-driven engagement layer for the Aurelia storefront. **Nothing is
hardcoded in components** — every popup, bar, toast, upsell and rail is a row in
one settings object and evaluates its own targeting / schedule / frequency / A-B
rules at runtime.

## Architecture (why it's built this way)

The storefront is a **static export** (`output: "export"`, no server, no DB), so
the engagement system is 100% client-evaluated with a static config as the
"admin panel". This keeps it deployable on the existing Apache/LiteSpeed hosting
with zero backend.

| Concern | Static build (today) | Full-stack build (later) |
|---|---|---|
| Admin control | Edit `src/lib/engagement/config.ts` → redeploy | Authenticated dashboard writes the same shape to DB/CMS |
| Frequency / dismissal | `localStorage` per browser | Server-side per user + localStorage |
| A/B testing | Sticky per-browser weighted assignment | Server-assigned, cross-device |
| Analytics | `console` or GTM `dataLayer` push | Warehouse + reporting |
| Country targeting | Only enforced if a geo code is present (CDN header/cookie); otherwise "allow" | Edge geo header, always enforced |

**Files**

- `src/lib/engagement/types.ts` — the admin-panel schema (all config types).
- `src/lib/engagement/config.ts` — the single source of truth (the "admin panel").
- `src/lib/engagement/runtime.ts` — targeting, schedule, frequency, A-B, device,
  audience, recently-viewed (client-safe, SSR-degrading).
- `src/lib/engagement/analytics.ts` — the one event sink (`eng_<feature>_<action>`).
- `src/lib/engagement/crosssell.ts` — pure server-safe cross-sell resolver.
- `src/components/engagement/*` — the widgets.
- `src/components/engagement/engagement.css` — animations (respects reduced-motion).

## Global controls (every feature)

`config.masterEnabled` is a kill-switch for the whole system. Each feature then has:

- **`targeting`** — `enabled`, `audiences` (`new` / `returning` / `cart-abandoner`
  / `vip` / `all`), `devices` (`desktop` / `mobile` / `tablet`), `countries`
  (ISO-2 allow-list), `startAt` / `endAt` (ISO schedule window).
- **`frequency`** (popups/toasts) — `maxImpressions`, `dismissForHours`,
  `minHoursBetween`, `hideAfterConvert`.
- **`experiment`** (optional) — named weighted variants with design overrides.

Every widget is **dismissible** and **silent when it has no real data**.

---

## Cluster 1 — Popups & Offers

Engine: `PopupManager` + `LuxuryPopup`. All popups share one shell; the admin
row decides kind, trigger, design, offer and experiment. At most **one popup
shows at a time**, chosen by config order (priority).

### Welcome / first-order popup (`welcome-first-order`)
- **Purpose:** Convert first-time visitors to subscribers with a first-order code.
- **Trigger timing:** Timed, 6s after load (`trigger.delayMs`).
- **Target audience:** `new` visitors, all devices/countries.
- **UI placement:** Center modal, dimmed blurred overlay.
- **Animation:** `fade-scale` in.
- **Conversion goal:** Email capture + coupon reveal (`WELCOME10`).
- **Admin settings:** copy, image, accent, dark mode, delay, offer code/value,
  impressions cap (2), 72h dismissal, `hideAfterConvert`, A/B copy variants.
- **DB requirements:** `Popup`, `Offer`, `Experiment`, `Impression`, `Conversion`,
  `Subscriber(email)`.
- **Analytics:** `eng_popup_impression|dismiss|convert` with `id`, `kind`, `variant`.

### Exit-intent cart save (`exit-save-cart`)
- **Purpose:** Recover abandoning carts before the tab closes.
- **Trigger timing:** Exit-intent (pointer leaves viewport top), desktop only.
- **Target audience:** `cart-abandoner` (has cart items).
- **UI placement:** Center modal. **Animation:** `fade-scale`.
- **Conversion goal:** Return-to-cart click; free gift-wrap incentive.
- **Admin settings:** enable, 24h dismissal, 6h min-between, offer, CTA href.
- **DB:** `Popup`, `Offer`, `CartEvent`. **Analytics:** `eng_popup_*`.

### Newsletter — The Society Letter (`newsletter-society`)
- **Purpose:** Grow the list from engaged returning readers.
- **Trigger timing:** Scroll depth ≥ 60%.
- **Target audience:** `returning`.
- **UI placement:** Bottom-right corner card (non-blocking). **Animation:** `slide-up`.
- **Conversion goal:** Subscribe. **Admin:** 7-day dismissal, `hideAfterConvert`.
- **DB:** `Subscriber`, `Popup`. **Analytics:** `eng_popup_*`.

### Exclusive VIP invite (`vip-invite`) — *off by default*
- **Purpose:** Recruit loyalty/VIP members.
- **Trigger timing:** Idle 30s. **Audience:** `returning`.
- **UI placement:** Dark center modal. **Animation:** `fade-scale`.
- **Conversion goal:** VIP request (sets local `vip` flag → unlocks VIP audience).
- **Admin:** `enabled:false` today; 1 impression, 30-day dismissal.
- **DB:** `Member`, `Popup`. **Analytics:** `eng_popup_*`.

> Festival / new-collection / birthday popups are already valid `kind`s in the
> schema — add a row with a schedule window (and, for birthday, a date match in
> the full-stack build) to enable them. No code changes needed.

---

## Cluster 2 — Cart & Conversion

### Free-shipping / unlock-reward progress bar (`free-shipping-bar`)
- **Purpose:** Raise average order value toward reward thresholds.
- **Trigger timing:** Always visible in cart when items > 0; updates live.
- **Target audience:** All. **UI placement:** Top of the cart drawer.
- **Animation:** Fill grows (`eng-progress-fill`, reduced-motion safe).
- **Conversion goal:** Push subtotal to the next tier (₹150 free shipping, ₹300 gift wrap).
- **Admin settings:** ordered `tiers` (threshold paise + label + reward).
- **DB:** `RewardTier`. **Analytics:** `eng_progressbar_unlock` per tier crossed.

### Sticky add-to-cart (`pdp-sticky-atc`)
- **Purpose:** Keep the buy action reachable through long PDPs.
- **Trigger timing:** Appears after scrolling `showAfterPx` (520px).
- **Target audience:** All. **UI placement:** Fixed bottom bar (PDP only).
- **Animation:** `slide-up`. If a size is required it smooth-scrolls to `#buybox`.
- **Conversion goal:** Add-to-cart. **Admin:** enable, scroll threshold.
- **DB:** none (reads product). **Analytics:** `eng_sticky_atc_add_to_cart`.

### Luxury gift-wrap upsell (`cart-gift-wrap`)
- **Purpose:** Premium packaging attach-rate.
- **Trigger timing:** Shown in cart when items > 0.
- **Target audience:** All. **UI placement:** Toggle card under cart items.
- **Animation:** state highlight. **Conversion goal:** Add a paid service line item.
- **Admin settings:** heading, body, price paise, icon.
- **DB:** `ServiceProduct`. **Analytics:** `eng_giftwrap_add_to_cart|dismiss`.

### Complete the look / cross-sell (`pdp-complete-the-look`)
- **Purpose:** Cross-sell matching pieces; raise items-per-order.
- **Trigger timing:** Rendered on the PDP (server-side).
- **Target audience:** All. **UI placement:** Rail below the buy box.
- **Animation:** inherits card hover. **Conversion goal:** Add companion products.
- **Admin settings:** `strategy` (`same-collection` / `same-category` / `curated`),
  optional `curated` slug map, `maxItems`. Falls back to category relations so
  it's never an empty shell.
- **DB:** `ProductRelation`. **Analytics:** product-card clicks.

---

## Cluster 3 — Social Proof

### Recently-purchased toasts (`recent-purchases`)
- **Purpose:** Trust + urgency via real-time purchase signals.
- **Trigger timing:** First at 4s, then every `intervalSeconds` (18s); visible `visibleSeconds` (6s).
- **Target audience:** All. **UI placement:** Bottom-left (clear of cart toast & popups).
- **Animation:** `eng-toast` slide/fade. **Conversion goal:** Click through to product.
- **Data integrity:** Each event references a **real product in the store**; the
  event list is admin-curated (honest static stand-in for a live order feed —
  no fake products, no random invention). Swap `config.socialProof.events` for a
  live `/orders` feed in the full-stack build.
- **Admin settings:** cadence, visibility, curated events (slug/city/minutesAgo).
- **DB:** `Order` / `OrderItem` (live feed). **Analytics:** `eng_socialproof_impression|click`.

### Low-stock indicator (`pdp-low-stock`)
- **Purpose:** Scarcity urgency — **only from real inventory**.
- **Trigger timing:** Rendered on PDP; shows only when `product.stockUnits` is a
  real number ≤ threshold (5). Silent otherwise — never a fabricated count.
- **Target audience:** All. **UI placement:** Next to the stock badge.
- **Animation:** none (static text). **Conversion goal:** Reduce hesitation.
- **Admin settings:** `thresholdUnits`, `label` (`{n}` interpolated).
- **DB:** `Inventory.units`. **Analytics:** n/a (add a view event if desired).

### Recently viewed (`recently-viewed`)
- **Purpose:** Re-surface interest; aid return-to-purchase.
- **Trigger timing:** `ProductViewTracker` records each PDP view (localStorage,
  no PII); rail renders when ≥ 2 items exist.
- **Target audience:** All. **UI placement:** Rail near PDP bottom (excludes current).
- **Animation:** card hover. **Conversion goal:** Re-engagement clicks.
- **Admin settings:** heading, `maxItems`.
- **DB:** none (client). **Analytics:** `eng_recently_viewed_view`.

### Best-seller / trending rails (`best-sellers`, `trending`)
- **Purpose:** Merchandise proven products; discovery.
- **Trigger timing:** Server-rendered on the home page.
- **Target audience:** All. **UI placement:** Home, before testimonials.
- **Animation:** card hover. **Conversion goal:** Click into high-intent products.
- **Data integrity:** driven by real product `tags` (`Best Seller`, `Trending`);
  renders nothing if no product carries the tag.
- **Admin settings:** `tag`, `heading`, `maxItems` (add rails by adding rows).
- **DB:** `Product.tags`. **Analytics:** product-card clicks.

---

## How to operate it

### Option A — the demo admin page (visual, per-browser)

Visit **`/admin`** (e.g. `http://localhost:3000/admin`). You'll hit a **login
screen** first; credentials come from env:

```bash
# .env.local (copy from .env.example)
NEXT_PUBLIC_ADMIN_USER=admin
NEXT_PUBLIC_ADMIN_PASS=aurelia2026
```

After sign-in you get a **sidebar dashboard** (grouped: General · Popups & Offers
· Cart & Conversion · Social Proof · Advanced). It's a visual editor over the
config: toggle any feature, edit copy/offers/timers/tiers, then **Save & preview**
— the live widgets on the storefront re-read your changes instantly in the same
browser. Session is held in `sessionStorage`; **Sign out** clears it.

> **Security note:** this is a **static export** — the login runs in the browser
> and the credentials are inlined into the JS bundle at build time. It keeps the
> demo out of casual reach but is **not real authentication**. For a genuinely
> protected, multi-user admin, use the full-stack option (API routes +
> server-side auth). The page is `noindex, nofollow`.

- Changes persist to **this browser's `localStorage` only** — not shared with real
  visitors (static build, no server). Ideal for demos and previewing.
- **Reset to defaults** clears the local override.
- **Copy config JSON** copies the edited config so you can paste values into
  `src/lib/engagement/config.ts` for a real (build-time) rollout.
- The page is `noindex, nofollow` and not linked from the storefront nav.
- Client widgets read the resolved config via `useEngagementConfig()`
  (`src/lib/engagement/useEngagementConfig.ts`); **server-rendered** features
  (best-seller/trending rails, low-stock, cross-sell) only change on rebuild —
  the admin flags these inline.

### Option B — the config file (real, build-time rollout)

1. Open `src/lib/engagement/config.ts` (the shipped source of truth).
2. Toggle `enabled`, edit copy/offers/timers/tiers, set `startAt`/`endAt` windows,
   restrict `devices`/`countries`/`audiences`, tune `frequency`, add A/B variants.
3. `npm run build` → redeploy `./out`. This is what every visitor sees.

Set `config.analytics.sink` to `"dataLayer"` to feed GA4/GTM
(`window.dataLayer`), `"console"` for local debugging, or `"none"` to silence.

## Honest limitations of the static build

- **Frequency & A/B are per-browser** (localStorage), not per-user across devices.
- **Country targeting is best-effort**: enforced only when a geo code has been
  written via `setCountry()` (e.g. from a CDN header/cookie bootstrap); otherwise
  it allows all. It never *wrongly* blocks.
- **Recently-purchased events are admin-curated**, not a live order stream.
- **No server-side reporting dashboard** — analytics are emitted to the sink; a
  reporting UI belongs to the full-stack track.

All of these become real by swapping the config source to the DB and the sink to
a warehouse — the component contracts don't change.
