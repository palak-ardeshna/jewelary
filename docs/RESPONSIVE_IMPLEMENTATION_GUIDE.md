# Aurelia — Responsive Implementation Guide

**Rebuild the storefront pixel-perfect across all breakpoints.**

> This document is reverse-engineered from the **actual codebase** (`src/app/globals.css`, `src/components/*`, `src/app/**/page.tsx`) — not from screenshots. Every token, breakpoint, and grid below is what the site really ships today. Where the current code is *thinner* than the 8-breakpoint spec you requested (it mostly uses 2–3 breakpoints), that gap is called out explicitly under **Optimization Suggestions** so you know what to *add*, not just what exists.

---

## 0. TL;DR — what's really there vs. what the spec asks for

| Aspect | Current implementation | This guide's target |
|---|---|---|
| Breakpoints actually coded | `1024px`, `768px`, `560px`, `380px` (+ `900/860` in admin) | 8 tiers: 320 / 375 / 414 / 768 / 1024 / 1280 / 1440 / 1920 |
| Container | `--container: 1400px`, pad `3rem → 1.25rem` | Fluid max-widths per tier (below) |
| Styling method | **Inline `style={{}}` + a few `<style>` blocks + `globals.css`** | Migrate to Tailwind tokens (§14) |
| Radius | `0` everywhere (sharp ultra-luxury) | Keep `0` — it's a brand decision |
| Product grid | 4 → 3 (≤1024) → 2 (≤768) | 4 → 3 → 2 → 2, never 1 (below) |
| Type scale | `clamp()` steps (fluid) | Keep + formalize (§8/§14) |

**The single most important fact:** the current code is *fluid-first* via `clamp()` for type and `%/vw` for layout, but *coarse* on layout breakpoints. Most "responsive bugs" will live between `768px` and `1024px` (tablet) where the grid jumps 2→3 with no intermediate handling, and below `380px` where fixed pixel paddings get tight.

---

## 1. Design System (extracted from `globals.css`)

### 1.1 Color hierarchy

| Token | Value | Role |
|---|---|---|
| `--primary` | `#1c1917` (onyx) | Headings, primary buttons, logo |
| `--primary-light` | `#292524` | Button hover |
| `--primary-dark` | `#0c0a09` | Deepest ink |
| `--accent` / `--gold` | `#C9A96E` (champagne) | Accent, CTAs, eyebrows |
| `--accent-dark` / `--gold-dark` | `#B5935A` | Accent text on light |
| `--gold-soft` | `#E3D1B5` | Overlays on imagery |
| `--secondary` | `#1C352D` (forest) | Rare luxe contrast |
| `--bg` | `#ffffff` | Page ground |
| `--surface` | `#faf8f5` (warm ivory) | Section fills, cards |
| `--surface-2` | `#f4efe8` | Image placeholders, chips |
| `--fg` | `#1c1917` | Body text |
| `--fg-muted` | `#57534e` | Secondary text |
| `--fg-subtle` | `#8a847e` | Tertiary / placeholder |
| `--border` | `#e9e3d9` | Hairlines |
| `--border-strong` | `#d8cfc0` | Inputs, dividers |
| `--success` | `#2C5E43` | In-stock, free shipping |
| `--error` | `#8C2A1E` | Errors, remove |
| `--warning` | `#8B6617` | noindex / caution |

### 1.2 Spacing system (NOT strictly 8pt — it's a rem scale)

The code uses a rem ladder, not a pure 8pt grid. Map it:

| Token | rem | px | 8pt equivalent |
|---|---|---|---|
| `--space-1` | 0.25 | 4 | ½ |
| `--space-2` | 0.5 | 8 | 1× |
| `--space-3` | 0.75 | 12 | 1.5× |
| `--space-4` | 1 | 16 | 2× |
| `--space-5` | 1.5 | 24 | 3× |
| `--space-6` | 2 | 32 | 4× |
| `--space-7` | 3 | 48 | 6× |
| `--space-8` | 4 | 64 | 8× |
| `--space-9` | 6 | 96 | 12× |
| `--space-10` | 8 | 128 | 16× |
| `--space-12` | 12 | 192 | 24× |
| `--section-gap` | `clamp(6rem, 12vw, 10rem)` | 96–160 | fluid |

> **Optimization:** 4/12px steps break a strict 8pt grid. If you want true 8pt, snap `--space-3` (12) and `--space-7` (48 ✓) — only the 12px is off-grid; keep it for hairline gaps or drop it.

### 1.3 Breakpoints

**Coded today:**

```css
@media (max-width: 1024px) { /* tablet: hide desktop nav, grid → 2/3 col */ }
@media (max-width: 768px)  { /* mobile: container pad 1.25rem, header 64px, grid 2col */ }
@media (max-width: 560px)  { /* checkout: single-col fields, stacked nav */ }
@media (max-width: 380px)  { /* checkout: tighten step rail */ }
@media (min-width: 768px)  { /* PDP/cart/checkout: 2-col + sticky */ }
```

**Target 8-tier system (adopt these as Tailwind screens):**

| Name | Min width | Device | Container max | Side padding | Product cols |
|---|---|---|---|---|---|
| `xs` | 320 | Small phone | 100% | 16px (1rem) | 2 |
| (default) | 375 | iPhone | 100% | 20px (1.25rem) | 2 |
| `sm` | 414 | Large phone | 100% | 20px | 2 |
| `md` | 768 | Tablet portrait | 720px | 24px (1.5rem) | 2→3* |
| `lg` | 1024 | Small laptop | 960px | 32px (2rem) | 3 |
| `xl` | 1280 | Desktop | 1200px | 48px (3rem) | 4 |
| `2xl` | 1440 | Large desktop | 1400px (`--container`) | 48px | 4 |
| `3xl` | 1920 | Wide | 1400px (capped) | auto-centered | 4 |

\* At `768px` the current grid is 2-col; consider 3-col from `~900px`. See §5.

### 1.4 Grid system

- **Master container:** `.container { max-width: 1400px; margin: 0 auto; padding: 0 3rem; }` → `0 1.25rem` at ≤768.
- **Page main:** `<main>` in `SiteChrome` = `max-width: var(--container); padding: 1.5rem 1.25rem 4rem`.
- **Product grid:** `.product-grid` = `grid; gap: 2rem 1.5rem; repeat(4,1fr)` → 3 (≤1024) → 2 + `gap 1.5rem 1rem` (≤768).
- **Full-bleed sections** (hero, featured band, newsletter) escape the container with `margin-left/right: calc(-50vw + 50%); width: 100vw`.

### 1.5 Border radius

| Token | Value | Note |
|---|---|---|
| `--radius-sm` / `--radius` / `--radius-lg` | **`0`** | Deliberate sharp-edge luxury. **Do not round.** Only exceptions in code: `border-radius:99px` on out-of-stock pill + filter chips, and `50%` on trust-icon circles / checkout step dots. |

### 1.6 Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 4px 12px rgba(0,0,0,.03)` | Rare, subtle lift |
| `--shadow` | `0 8px 24px rgba(0,0,0,.05)` | Cards on hover (unused mostly) |
| `--shadow-lg` | `0 24px 48px rgba(0,0,0,.08)` | Drawers / modals |

> The brand leans on **borders + motion (translateY), not shadows.** Cards lift with `transform: translateY(-4px)` on hover, no shadow.

### 1.7 Motion tokens

| Token | Value |
|---|---|
| `--dur-1…5` | 150 / 300 / 500 / 700 / 1000 ms |
| `--ease-out` | `cubic-bezier(.215,.61,.355,1)` |
| `--ease-luxe` | `cubic-bezier(.22,1,.36,1)` |
| `--ease-in-out` | `cubic-bezier(.645,.045,.355,1)` |

Keyframes: `fadeUp`, `slideInRight`, `fadeIn`, `toastIn`, `spin`, `shimmer`. Scroll-reveal via `[data-reveal]` → `.is-in`. **All motion is killed under `prefers-reduced-motion`** (already handled globally — keep this).

---

## 2. Typography scale

Font families: **Display** = `var(--font-cormorant)` (Cormorant, serif); **Body** = Inter.

| Class | Family | Weight | Size (`clamp`) | Line height | Letter-spacing | Use |
|---|---|---|---|---|---|---|
| `.t-display` | Display | 300 | `clamp(3.5rem, 8vw, 5.5rem)` | 1.1 | 0.04em | Hero H1 |
| `.t-h1` | Display | 400 | `clamp(2.8rem, 6vw, 4rem)` | 1.1 | 0.02em | Page H1 |
| `.t-h2` | Display | 400 | `clamp(2rem, 4vw, 2.8rem)` | 1.2 | 0.02em | Section H2 |
| `.t-h3` | Display | 500 | `clamp(1.4rem, 2.5vw, 1.7rem)` | 1.3 | — | Sub-head |
| `.t-lead` | Body | 400 | `clamp(1.1rem, 1.8vw, 1.3rem)` | 1.8 | — | Lead paragraph |
| `.eyebrow` | Body | 600 | `0.68rem` | — | 0.28em, uppercase, gold | Kicker label |
| body | Body | 400 | `1rem` | ~1.6 | — | Default |

Typography is **already fluid** via `clamp()`, so it scales continuously 320→1920 with no per-breakpoint overrides needed. The one manual override: home hero H1 becomes `clamp(2.8rem,10vw,4rem)` at ≤768 to avoid overflow.

> **Optimization:** define an explicit **min font-size floor of 16px** for all body/input text (iOS zooms on `<16px` inputs). Inputs are `0.9rem` (14.4px) → they trigger iOS zoom-on-focus. Bump inputs to `16px` on mobile.

---

## 3. Global chrome

### 3.1 Header (`src/components/Header.tsx`)

**Purpose:** persistent navigation + utility icons + cart; transparent over the home hero, frosted after scroll.

**Behavior:**
- `position: sticky; top: 0; z-index: 40`.
- **Scroll effect:** `scrollY > 20` → background `rgba(255,255,255,.95)` + `backdrop-filter: blur(12px)` + bottom border. Above the fold on `/` it's transparent with **white text**; everywhere else dark text.
- **Height:** `80px` desktop → `64px` at ≤768 (`.hdr-inner`).
- **Layout:** 3-zone flex — left (nav links 1–3 / hamburger), center (logo, `flex:1 text-align:center`), right (nav links 4–6 + search/heart/user/cart icons).

**Responsive rule (the important one):**
```css
@media (max-width: 1024px) { .hdr-nav { display: none; } .desktop-only{display:none} .mobile-only{display:flex} }
```
So **tablet + mobile both use the hamburger.** Desktop icons (search/wishlist/account) are `desktop-only` → hidden ≤1024; only the hamburger + cart remain. Wishlist/account move *inside* the mobile menu.

**Mobile menu:** full-viewport overlay (`position:fixed; inset:0; z-index:50`), slides from top (`translateY(-100%) → 0`), lists all 6 nav links as `.t-h2`, with Wishlist + Profile pinned to the bottom.

| Breakpoint | Nav | Icons visible | Logo size | Header height |
|---|---|---|---|---|
| ≥1025 | Inline (3 left, 3 right) | search, heart, user, cart | 1.8rem | 80px |
| 768–1024 | Hamburger | hamburger, cart | 1.8rem | 80px |
| ≤768 | Hamburger | hamburger, cart | 1.5rem | 64px |

**Optimization:** there is **no search input in the header** — search is an icon linking to `/search`. Consider an expanding search field ≥1280. Also the sticky header offset (`top: 104px`) is hard-coded in PDP for the 80px header — if you change header height, update PDP sticky offset.

### 3.2 Announcement bar (`AnnouncementBar`) — scrolls away above the sticky header.

### 3.3 Footer (`src/components/SiteChrome.tsx`)

**Purpose:** newsletter capture + trust signals + link columns + legal.

**Structure (top→bottom):**
1. **Top band** — `flex; flex-wrap: wrap; justify-content: space-between; gap: 3rem`. Left: newsletter (max 400px, email + Subscribe). Right: 2-col grid ("The Aurelia Standard" / "Trust & Assurance").
2. **Link band** — `grid; repeat(auto-fit, minmax(180px, 1fr)); gap: 3rem; padding: 4rem 0`. Columns: Brand blurb · Shop · Collections · Client Care.
3. **Legal bar** — centered `© {year}`, `padding: 1.5rem`.

**Responsive:** the top band `flex-wrap` and the link band `auto-fit minmax(180px)` mean **it collapses automatically** — no explicit footer breakpoints. On phones the newsletter stacks above the trust grid; link columns reflow 4→2→1 as width allows.

> **Optimization:** the requested **mobile accordion** footer does not exist — columns just stack full-height, making the footer very tall on phones. Add `<details>`-based accordions below `768px` (see §12 checklist). No social links or payment-method icons are present today — add both if the brief requires them.

---

## 4. Home page (`src/app/page.tsx`)

**Purpose:** brand-first conversion funnel — cinematic hero → trust → browse paths → featured product proof → newsletter.

### Section order & objective

| # | Section | Objective | Layout |
|---|---|---|---|
| 1 | Cinematic Hero | Emotional brand hook + primary CTA | Full-bleed `100vw`, `height:85vh; min-height:600px`, bg image + gradient, centered copy |
| 2 | Brand Pillars | Trust (hallmark, pricing, exchange, shipping) | `grid auto-fit minmax(220px,1fr)`, 4 icon+text, top/bottom hairline |
| 3 | Shop by Category | Navigation to top categories | `grid repeat(4,1fr) gap 1.5rem`, `aspect-ratio 4/5` image cards w/ gradient label |
| 4 | Modern Heirlooms (Featured) | Product proof | Full-bleed ivory band, header + "Shop All", `.product-grid` (4 items) |
| 5 | The Gift Edit | Price-anchored discovery (< ₹20k) | Centered header, `.product-grid`, "View All Gifts" |
| 5b | Engagement rails | Best-sellers / trending (config-driven) | `<ProductRail>` horizontal |
| 6 | Testimonials | Social proof | `grid repeat(3,1fr) gap 2rem`, quote cards |
| 7 | Newsletter | Email capture (10% off) | Full-bleed onyx band, `max-width:600`, inline email + Subscribe |

### Responsive rules (home)

```css
/* Coded today */
@media (max-width:1024px){ .product-grid{ grid-template-columns: repeat(2,1fr) !important; } }
@media (max-width:768px){
  .hero-section{ margin-top: calc(-1.5rem - 64px); padding-top: 64px; }
  h1.t-display{ font-size: clamp(2.8rem,10vw,4rem); }
}
```

**Gaps to fix per breakpoint:**

| Section | 320–414 (mobile) | 768 (tablet) | 1024 (laptop) | 1280–1920 (desktop) |
|---|---|---|---|---|
| Hero height | Reduce to `70vh` / `min 520px` — 85vh is too tall on landscape phones | 80vh | 85vh | 85vh, cap image focal point |
| Category grid | `repeat(2,1fr)` **(currently stays `repeat(4,1fr)` — WILL squash!)** | 2 | 4 | 4 |
| Pillars | 1–2 col (auto-fit ok) | 2 | 4 | 4 |
| Testimonials | **1 col (currently forced `repeat(3,1fr)` — squashes!)** | 1–2 | 3 | 3 |
| Newsletter form | **Stack input + button vertically** (currently `flex row` → button cramped) | row | row | row |

> ⚠️ **Three hard-coded desktop grids do NOT have mobile overrides:** Shop-by-Category (`repeat(4,1fr)`), Testimonials (`repeat(3,1fr)`), and the two inline newsletter forms (`flex` row). These are the top responsive defects on the home page. Add:
> ```css
> @media (max-width:768px){
>   .home-cat-grid{ grid-template-columns: repeat(2,1fr) !important; }
>   .home-testimonials{ grid-template-columns: 1fr !important; }
>   .home-newsletter form, footer form{ flex-direction: column !important; }
> }
> ```
> (Add the class names to the corresponding `<div>`/`<section>` — they're currently inline-styled with no hooks.)

---

## 5. Category / Collection pages (`[category]`, `[category]/[sub]`, `c/[slug]`)

**Purpose:** filtered product listing for a category or a programmatic SEO collection.

**Structure:** Breadcrumbs → centered header (H1 `t-display 3rem` + description) → subcategory pills (`btn-outline`, `flex-wrap`, centered) → `<CategoryProducts>` (filter bar + result count + `.product-grid`).

### Filters & sorting (`CategoryProducts.tsx`)

- **Server-side filtering** — filter controls are `<Link>`s that rewrite the URL (`?color=&maxPrice=&sort=`); the server re-queries. No client JS state.
- **Filter bar:** `flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem; background: surface; border`. Groups: Sort (Price ↑/↓, Top Rated) · Max Price (Under ₹150/200/250) · Metal (5 chips) · Clear (pushed right via `margin-left:auto`).
- **Active chip:** filled (`--primary` for sort/metal, `--accent` for price); inactive = bordered pill (`border-radius:99px`).
- **No pagination / no infinite scroll** — the full filtered set renders at once.

**States:** empty → centered search icon + "No products match your filters" + Clear link. Loading → route-level (`RouteProgress`).

### Responsive rules (category)

| Element | Mobile (≤768) | Tablet (768–1024) | Desktop (≥1024) |
|---|---|---|---|
| Product grid | 2 col | 2 col (→ 3 recommended ≥900) | 3 (≤1024) / 4 (≥1280) |
| Filter bar | Wraps to multiple rows (ok) — but chips get tall; consider a **"Filters" drawer/`<details>`** below 640 | Wraps | Single row |
| H1 | `t-display 3rem` fine; ensure it fits ≤360 (may need `clamp(2rem,9vw,3rem)`) | 3rem | 3rem |
| Subcat pills | Wrap, centered | Wrap | Row |

> **Optimization:** the filter bar has **no responsive treatment** — on a 320px phone the Metal group alone is 5 pills + label and wraps into a tall stack. Convert the whole bar into a collapsible **"Filter & Sort" sheet** on `<768px` (a bottom sheet is the e-commerce convention). Add pagination or infinite scroll if collections exceed ~40 items (currently unbounded → long DOM on mobile).
>
> There is **no sidebar** — filters are a horizontal bar, so "sidebar responsiveness" is N/A. If you introduce a left sidebar on desktop (`≥1024`), collapse it to the sheet below `lg`.

---

## 6. Product Detail Page (`src/app/products/[slug]/page.tsx`)

**Purpose:** convert — imagery + spec + trust + add-to-cart.

**Structure:** Breadcrumbs → `AdSlot productTop` → **2-col grid** (`.pdp-grid`) → Reviews → Cross-sell rail → Related rail → `AdSlot productBottom` → RecentlyViewed → sticky add-to-cart bar.

### The 2-column grid — the core responsive rule

```css
/* Default: single column (mobile-first) */
.pdp-grid { display:grid; gap:4rem; grid-template-columns:1fr; }

@media (min-width:768px){
  .pdp-grid { grid-template-columns: 1fr 1fr; align-items:start; }
  .pdp-image-col { position: sticky; top: 104px; } /* 80px header + 24px */
}
```

- **Gallery:** single image, `aspect-ratio: 4/5`, `object-fit: cover`, `priority` loaded. **No thumbnails, no zoom, no carousel** in current code.
- **Sticky gallery:** image column sticks at `top:104px` **≥768 only**; scrolls normally on mobile.
- **Details column** (`flex-column gap:2rem`): brand/tags eyebrow → H1 (`t-display 2.5rem`) → certification badges → star row → price (current 1.5rem + strikethrough MRP + discount badge) → stock badge + `LowStock` → description → **Specifications table** (label/value rows) → **AddToCart (with size chips)** → Wishlist → **TrustBadges** (2×2 grid).
- **Sticky Add-to-Cart** (`StickyAddToCart`): appears on scroll (mobile-focused reconversion bar).

### PDP responsive matrix

| Element | 320–414 | 768 | 1024 | 1280–1920 |
|---|---|---|---|---|
| Layout | 1 col, image first | 2 col 1fr/1fr, sticky image | 2 col | 2 col (image can be 55/45) |
| Gallery aspect | 4/5 full width | 4/5 half | 4/5 | 4/5, cap image height ~720px |
| H1 | `2.5rem` — reduce to `clamp(1.8rem,7vw,2.5rem)` | 2.5rem | 2.5rem | 2.5rem |
| Spec table | label/value rows (ok) | rows | rows | rows |
| Trust badges | 2×2 (ok) — verify labels don't clip ≤340 | 2×2 | 2×2 | 2×2 or 1×4 |
| Sticky ATC bar | Show (primary) | Show | Optional | Optional |
| Reviews | 1 col | 1 col | 1 col | consider 2 col |
| Related/Cross-sell | `.product-grid` → 2 col | 2 | 3 | 4 |

**Requested-but-missing PDP features** (add for a complete build):

| Feature | Status | Action |
|---|---|---|
| Thumbnail strip | ❌ single image | Add gallery array; thumbnails below (mobile) / left rail (desktop ≥1024) |
| Image zoom | ❌ | Add hover-zoom (desktop) / pinch (mobile) |
| Variant selection | ⚠️ size chips only (`.size-chip`) | Add metal/color variants if catalog supports |
| Quantity selector | ❌ on PDP (only in cart) | Add qty stepper near ATC |
| Delivery info | ⚠️ trust badges only | Add pincode → ETA |
| FAQ | ❌ | Add accordion section |
| Reviews | ✅ list (rating + author + body) | Add sort/pagination if many |

---

## 7. Cart (`src/app/cart/page.tsx`)

**Purpose:** review line items + summary + proceed.

**Structure:** H1 → 2-col grid (`.cart-grid`): items list (image 110×130, name, size, price, qty stepper −/+, remove) + **sticky Order Summary** (subtotal, delivery, free-ship nudge, total, checkout CTA, trust list).

```css
.cart-grid { grid-template-columns: 1fr; }              /* mobile: stack, summary below */
@media(min-width:768px){ .cart-grid{ grid-template-columns: 1fr 340px; } }
.summary { position: sticky; top: 100px; }              /* desktop */
```

**Free-shipping logic:** `delivery = totalPrice >= 19900 ? 0 : 4900` (paise) → "Add ₹X more for free delivery".

**Empty state:** centered bag icon + "Your cart is empty" + "Start Shopping →".

| Element | Mobile | Tablet/Desktop |
|---|---|---|
| Grid | 1 col (items, then summary) | `1fr 340px`, sticky summary |
| Line item | image 110×130 + flex info (qty controls wrap) | same |
| Qty stepper | 28×28 buttons — bump to **44×44 touch target** on mobile | 28×28 ok |
| Summary | full-width block after items | 340px sticky card |

> **Optimization:** qty `−/+` buttons are 28px — below the 44px touch minimum. On `≤768` set `min-width/height: 44px`. Consider making the summary a **sticky bottom bar** on mobile (total + Checkout) instead of a block the user must scroll past all items to reach.

---

## 8. Checkout (`src/app/checkout/page.tsx`)

**Purpose:** 4-step guided COD checkout — mobile-first, already the most responsive page.

**Steps:** 1 Contact · 2 Shipping · 3 Payment (COD only) · 4 Review. Progress indicator with numbered dots (done = gold check, active = onyx). Per-step validation; Enter advances.

**Layout:** `.checkout-grid` = `1fr` → `1fr 340px` (≥768) with sticky summary (`top: 5.5rem`).

**This page's responsive CSS is the model to copy elsewhere:**
```css
@media(min-width:768px){ .checkout-grid{ grid-template-columns:1fr 340px; } .checkout-summary{ position:sticky; top:5.5rem; } }
@media(max-width:560px){
  .step-label{ display:none; }                 /* dots only */
  .field-grid{ grid-template-columns:1fr; }    /* single-col fields */
  .checkout-nav{ flex-direction:column-reverse; align-items:stretch; }
  .checkout-nav > button{ width:100%; margin-left:0; }
}
@media(max-width:380px){ .step-rail{ margin:0 0.4rem; } }  /* fit 4 dots */
```

| Element | ≤380 | 381–560 | 561–767 | ≥768 |
|---|---|---|---|---|
| Step indicator | dots only, tight rails | dots only | dots + labels | dots + labels |
| Field grid | 1 col | 1 col | 2 col | 2 col |
| Nav buttons | stacked full-width | stacked | inline | inline |
| Summary | below form | below | below | sticky 340px right |
| Card padding | `clamp(1.15rem,4vw,1.75rem)` (fluid ✓) | — | — | 1.75rem |

**States:** field errors inline (red, `0.78rem`); placing-order = spinner + disabled; empty cart → redirect to `/cart`.

> This page needs the least work. Only add: real payment methods (currently COD-only radio), coupon field (absent), and address autocomplete.

---

## 9. Secondary pages (quick reference)

| Page | Purpose | Layout | Responsive notes |
|---|---|---|---|
| `/search` | Query results | Search field + `.product-grid` | Grid inherits 4→2 |
| `/wishlist` | Saved items (localStorage) | `.product-grid` + empty state | Same grid |
| `/account` | Profile stub | Centered card | Single col |
| `/account/orders` | Order history (localStorage) | List cards (`OrdersClient`) | Stack on mobile |
| `/checkout/success` | Confirmation + confetti | Centered, order id | Single col |

---

## 10. Reusable component inventory

| Component | File | Responsive behavior |
|---|---|---|
| `Header` | `components/Header.tsx` | Sticky, scroll-frost, hamburger ≤1024 |
| `SiteChrome` (footer + main) | `components/SiteChrome.tsx` | auto-fit footer, container main |
| `AnnouncementBar` | `components/AnnouncementBar.tsx` | Scrolls away |
| `ProductCard` | `components/ProductCard.tsx` | `aspect-ratio 1/1`, 2-line clamp name, wishlist heart, badges, hover zoom `scale(1.05)` |
| `.product-grid` | `globals.css` | 4→3→2 |
| `CategoryProducts` | `components/CategoryProducts.tsx` | Wrapping filter bar |
| `Breadcrumbs` | `components/Breadcrumbs.tsx` | Wraps |
| `Icon` | `components/Icon.tsx` | `size` prop (px) — use 14/16/20/24 |
| `SmartImage` | `components/SmartImage.tsx` | `fill` + `sizes`, unoptimized |
| `AddToCartButton` / `WishlistButton` | — | Size chips, variant `card`/`pdp` |
| `CartButton` / `CartDrawer` | — | Slide-in drawer (`slideInRight`) |
| Buttons | `globals.css` | `.btn-primary/accent/outline/ghost` + `-lg/-sm/-block`, min-height 48px ≤768 |
| Badges | `globals.css` | `.badge-neutral/dark/gold` |
| Engagement | `components/engagement/*` | Toasts, sticky ATC, free-ship bar, rails, popups |

### Button variants

| Class | Fill | Border | Text | Use |
|---|---|---|---|---|
| `.btn-primary` | onyx | — | white | Primary CTA |
| `.btn-accent` | white→onyx hover | onyx | onyx→white | Secondary CTA (checkout) |
| `.btn-outline` | transparent | border-strong | fg | Tertiary ("Shop All") |
| `.btn-ghost` | glass on dark | white 20% | white | On imagery |
| Modifiers | `.btn-lg` (1.25/2.75rem) · `.btn-sm` (0.75/1.5rem) · `.btn-block` (100%) | | | |

All buttons: `text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.75rem; padding: 1.1rem 2.2rem`; **min-height 48px + reduced padding ≤768** (already coded). Radius `0`.

### Input variants

`.input` — full-width, `padding 0.85/1.25rem`, `1px border-strong`, focus → `border: primary`. **min-height 48px ≤768.** ⚠️ font-size `0.9rem` → raise to 16px on mobile (iOS zoom).

---

## 11. The 8-breakpoint master table (adopt verbatim)

| Property | 320 | 375 | 414 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|---|
| Container max | 100% | 100% | 100% | 720 | 960 | 1200 | 1400 | 1400 |
| Side padding | 16 | 20 | 20 | 24 | 32 | 48 | 48 | auto |
| Product cols | 2 | 2 | 2 | 2 | 3 | 4 | 4 | 4 |
| Grid gap | 12/16 | 16 | 16 | 20 | 24 | 24/32 | 32 | 32 |
| Section gap | 48 | 56 | 64 | 80 | 96 | 128 | 160 | 160 |
| Header height | 64 | 64 | 64 | 64 | 80 | 80 | 80 | 80 |
| Nav | burger | burger | burger | burger | inline | inline | inline | inline |
| H1 (`t-display`) | ~2.8r | 3r | 3.2r | 4r | 4.5r | 5r | 5.5r | 5.5r |
| Body | 16 | 16 | 16 | 16 | 16 | 16 | 16 | 16 |
| Button pad | .8/1.5 | .8/1.5 | .8/1.5 | .8/1.5 | 1.1/2.2 | 1.1/2.2 | 1.1/2.2 | 1.1/2.2 |
| PDP layout | 1col | 1col | 1col | 2col | 2col | 2col | 2col | 2col |
| Cart/Checkout | 1col | 1col | 1col | +340 | +340 | +340 | +340 | +340 |
| Filters | sheet | sheet | sheet | sheet | bar | bar | bar | bar |
| Footer cols | 1 | 1 | 2 | 2 | 4 | 4 | 4 | 4 |

*(`r` = rem; type is `clamp()`-driven so intermediate values interpolate automatically.)*

---

## 12. Responsive implementation checklist

- [ ] Add the 8 Tailwind screens (§14) and stop hard-coding `768/1024` inline.
- [ ] **Home:** add mobile overrides for Shop-by-Category (→2col), Testimonials (→1col), newsletter forms (→column). *(Top 3 defects.)*
- [ ] **Hero:** reduce to `70vh/520px` on short/landscape phones.
- [ ] **Category filters:** convert horizontal bar → bottom-sheet `<768`.
- [ ] **Cart:** qty steppers → 44px touch targets; consider sticky mobile total bar.
- [ ] **Footer:** add `<details>` accordions `<768`; add social + payment icons.
- [ ] **Inputs:** 16px font-size on mobile (kill iOS zoom).
- [ ] **PDP:** add thumbnails + zoom + qty; keep sticky offset in sync with header height.
- [ ] Verify no horizontal scroll (`overflow-x: clip` is global — keep; audit full-bleed `100vw` sections for scrollbar-gutter overflow).
- [ ] Test `320px` (smallest) and `landscape phone` explicitly — the two most-missed viewports.
- [ ] Respect `prefers-reduced-motion` (already global — don't regress).
- [ ] Touch targets ≥44px; focus-visible rings intact.

## 13. Mobile-first development checklist

1. Write base styles for **320px first**, no media query.
2. Layer **`min-width`** queries up (the codebase mixes `max-width` and `min-width` — standardize on `min-width` / mobile-first for new work; PDP/cart/checkout already do this correctly).
3. Grids: default `1fr` (or `repeat(2,1fr)` for products) → widen up.
4. Never let a desktop `repeat(N,1fr)` ship without a mobile fallback (the home page's current bug).
5. Fluid type via `clamp()` — avoid per-breakpoint font sizes.
6. Images: `SmartImage fill` + accurate `sizes`; `aspect-ratio` to prevent CLS.
7. Sticky elements: offset = header height + padding (single source of truth).
8. Test order: 320 → 375 → 414 → 768 → 1024 → 1280 → 1440 → 1920.

---

## 14. React + Tailwind implementation guide

The current app is **inline-styles + `globals.css`**. To rebuild pixel-perfect in Tailwind, port the tokens into `@theme` (Tailwind v4, already the installed version) so class names map 1:1 to the CSS variables above.

### 14.1 `globals.css` — `@theme` mapping (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #1c1917;
  --color-primary-light: #292524;
  --color-accent: #C9A96E;
  --color-accent-dark: #B5935A;
  --color-gold-soft: #E3D1B5;
  --color-secondary: #1C352D;
  --color-bg: #ffffff;
  --color-surface: #faf8f5;
  --color-surface-2: #f4efe8;
  --color-fg: #1c1917;
  --color-fg-muted: #57534e;
  --color-fg-subtle: #8a847e;
  --color-border: #e9e3d9;
  --color-border-strong: #d8cfc0;
  --color-success: #2C5E43;
  --color-error: #8C2A1E;

  /* Breakpoints — the 8-tier system */
  --breakpoint-xs: 20rem;    /* 320 */
  --breakpoint-sm: 25.875rem;/* 414 */
  --breakpoint-md: 48rem;    /* 768 */
  --breakpoint-lg: 64rem;    /* 1024 */
  --breakpoint-xl: 80rem;    /* 1280 */
  --breakpoint-2xl: 90rem;   /* 1440 */
  --breakpoint-3xl: 120rem;  /* 1920 */

  /* Radius — sharp luxury */
  --radius-sm: 0px; --radius: 0px; --radius-lg: 0px;

  /* Fonts */
  --font-display: var(--font-cormorant), Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Fluid type */
  --text-display: clamp(3.5rem, 8vw, 5.5rem);
  --text-h1: clamp(2.8rem, 6vw, 4rem);
  --text-h2: clamp(2rem, 4vw, 2.8rem);
  --text-h3: clamp(1.4rem, 2.5vw, 1.7rem);
  --text-lead: clamp(1.1rem, 1.8vw, 1.3rem);
}
```

### 14.2 Component patterns

**Container:**
```tsx
<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 xl:px-12">
```

**Product grid (4→3→2, never 1):**
```tsx
<div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
```

**Product card:**
```tsx
<a className="group block">
  <div className="relative aspect-square overflow-hidden bg-surface-2">
    <Image fill sizes="(max-width:640px)50vw,(max-width:1024px)33vw,25vw"
      className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" />
  </div>
  <div className="p-3">
    <p className="line-clamp-2 text-sm font-semibold leading-tight">{name}</p>
    <p className="text-base font-medium">{price}</p>
  </div>
</a>
```

**Button (primary):**
```tsx
<button className="inline-flex min-h-12 items-center justify-center gap-3 border border-transparent
  bg-primary px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white
  transition-colors duration-500 hover:bg-primary-light active:scale-[.98] md:px-9">
```

**PDP 2-col + sticky (mobile-first):**
```tsx
<div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-start">
  <div className="md:sticky md:top-[104px]"> {/* gallery */} </div>
  <div className="flex flex-col gap-8"> {/* details */} </div>
</div>
```

**Cart/checkout summary:**
```tsx
<div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_340px]">
  <div>{/* items / steps */}</div>
  <div className="h-fit md:sticky md:top-[100px]">{/* summary */}</div>
</div>
```

**Header nav responsive:**
```tsx
<nav className="hidden lg:flex ...">{/* desktop links */}</nav>
<button className="flex lg:hidden ...">{/* hamburger */}</button>
```

**Input (16px on mobile → no iOS zoom):**
```tsx
<input className="min-h-12 w-full border border-border-strong bg-transparent px-5 py-3
  text-base outline-none focus:border-primary" />
```

**Footer accordion (mobile) → columns (desktop):**
```tsx
<details className="border-b border-border md:border-0 [&_summary]:md:pointer-events-none" open>
  <summary className="cursor-pointer py-4 font-semibold uppercase md:mb-5 md:cursor-default">Shop</summary>
  <ul className="flex flex-col gap-3 pb-4 md:pb-0">{/* links */}</ul>
</details>
```

### 14.3 Migration order (lowest-risk path)

1. Port tokens to `@theme` (above) — no visual change.
2. Rebuild `ProductCard`, buttons, inputs as Tailwind (highest reuse).
3. Rebuild grids (`product-grid`, footer, home sections) — **fixes the home-page defects in the process**.
4. Rebuild page shells (PDP, cart, checkout) keeping the exact sticky offsets.
5. Delete inline `style={{}}` blocks as each component is ported.
6. Regression-test the 8 breakpoints per §12.

---

## 15. Accessibility notes (global)

- Skip link (`.skip-link`) → `#main` — present, keep.
- `:focus-visible` ring (`1px solid primary, offset 2px`) — present.
- `prefers-reduced-motion` — globally honored; scroll-reveal, hover zoom, and all transitions collapse.
- Contrast: `--fg-muted` was deliberately darkened to `#57534e` for AA. Keep white-on-hero text over the gradient scrim (already there).
- **To add:** `aria-current` on active nav (currently a border only), `aria-live` on cart count, focus trap in the mobile menu + cart drawer, 44px touch targets (cart steppers fail this today).

---

*Grounded in the live codebase as of this branch. The three home-page grid defects (§4), the filter bar (§5), and the cart touch targets (§7) are the highest-impact fixes; everything else is largely already responsive via `clamp()` + `min-width` queries.*
