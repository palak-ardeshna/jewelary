# Aurelia — Design System

> Direction: **Apple × Cartier × Tiffany × Mejuri.** Editorial, cinematic,
> restrained. Luxury is signalled by *space, type, and motion* — never by
> discount badges. Inspired-by (not copied-from) the category logic and
> product-naming conventions common to the Indian fine-jewellery D2C space;
> the visual identity is entirely original.
>
> This is the single source of truth for tokens. Values map 1:1 to the CSS
> custom properties in `src/app/globals.css` and to `ThemeSetting` rows in
> `prisma/schema.prisma` (so a future Theme Builder edits them from the admin).

---

## 1. Brand principles

1. **Quiet confidence.** One focal element per view. Whitespace is a feature.
2. **Material honesty.** Show metal, purity, carat, certification, and a
   transparent price breakup — trust is the luxury-jewellery conversion lever.
3. **Editorial, not retail.** Copy and imagery read like a magazine, not a flyer.
4. **Motion with intent.** Slow, eased, purposeful. Never bouncy, never busy.
5. **Everything themeable.** No hardcoded colour/size in components — only tokens.

---

## 2. Colour system

Warm-neutral luxury palette: onyx ink on warm ivory, a single muted champagne-gold
accent. Cinematic sections invert to near-black.

| Token | Hex | Role |
|---|---|---|
| `--onyx` / `--primary` | `#1C1917` | Ink: headings, logo, primary buttons |
| `--onyx-800` | `#2A2420` | Cinematic section base |
| `--onyx-600` | `#57534E` | Secondary ink |
| `--ivory` / `--bg` | `#FFFFFF` | Page ground |
| `--surface` | `#FAF8F5` | Warm ivory surface |
| `--surface-2` | `#F2EDE6` | Recessed surface, image bg |
| `--gold` / `--accent` | `#B08D4F` | Champagne gold — CTAs, highlights, hairlines |
| `--gold-dark` | `#8F6F39` | Gold hover/active |
| `--gold-soft` | `#D9C3A0` | Gold on dark, subtle fills |
| `--fg` | `#1C1917` | Body text |
| `--fg-muted` | `#78716C` | Secondary text |
| `--fg-subtle` | `#A8A29E` | Tertiary / captions |
| `--border` | `#E9E3D9` | Hairline dividers |
| `--border-strong` | `#D8CFC0` | Inputs, emphasis borders |
| `--success` | `#4D7C5A` | In stock, confirmations |
| `--warning` | `#A9761F` | Low stock |
| `--error` | `#A3412F` | Errors, validation |

**Rules:** exactly **one** accent (gold). Never pure black (`#000`) for text — use
onyx. Discount/sale red is deliberately absent from the core palette; a single
muted `--error`-adjacent tone is the only "urgency" colour, used sparingly.
Contrast: body text ≥ 7:1, muted ≥ 4.5:1 (WCAG AAA/AA verified on ivory).

**Dark/cinematic mode:** `--onyx-800` ground, `--ivory` text, `--gold-soft` accent —
used for hero, editorial breaks, and the footer.

---

## 3. Typography

Two families. A high-contrast serif for display/editorial voice; a neutral grotesque
for UI and body.

| Family | Token | Use |
|---|---|---|
| **Cormorant Garamond** (serif) | `--font-display` | H1–H3, hero, price, editorial pull-quotes |
| **Inter** (sans) | `--font-inter` | Body, UI, labels, buttons, captions |

### Type scale (1.25 major-third, 16px base)

| Step | Size | Line | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| Display | `clamp(2.5rem, 6vw, 4rem)` | 1.05 | 500 | +0.01em | Hero |
| H1 | `2.25rem` | 1.15 | 500 | 0 | Page title |
| H2 | `1.9rem` | 1.2 | 500 | 0 | Section |
| H3 | `1.375rem` | 1.3 | 600 | 0 | Card/subsection |
| Body-lg | `1.125rem` | 1.7 | 400 | 0 | Lede |
| Body | `1rem` | 1.65 | 400 | 0 | Default |
| Small | `0.875rem` | 1.5 | 400 | 0 | Meta |
| Caption | `0.75rem` | 1.4 | 500 | +0.02em | Captions |
| **Eyebrow** | `0.72rem` | 1 | 600 | **+0.22em**, uppercase | Section kickers, gold |

Display/H1–H2 use `--font-display` (serif). Everything else Inter. Numerals in
prices use serif for editorial weight; spec tables use Inter tabular.

---

## 4. Spacing, radius, shadow, layout tokens

**Spacing** — 4px base, `--space-*`: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
Section vertical rhythm: `96px` desktop / `56px` mobile. Card padding `24px`.

**Radius** — restrained (fine jewellery reads sharper than apps):
`--radius-sm 4px · --radius 6px · --radius-lg 8px · --radius-pill 999px`.
Images and cards use `--radius-lg`; buttons `--radius`; chips `--radius-pill`.

**Shadow** — soft, warm-tinted (never grey):
- `--shadow-sm` `0 1px 2px rgb(28 25 23 / .04)`
- `--shadow` `0 4px 12px -2px rgb(28 25 23 / .08)`
- `--shadow-lg` `0 18px 40px -12px rgb(28 25 23 / .16)`
- `--shadow-cinematic` `0 40px 80px -24px rgb(28 25 23 / .28)` (hero cards, modals)

**Grid** — 12 columns, `24px` gutter desktop / `16px` mobile.
Containers: `--container: 1200px` (commerce), `--container-wide: 1440px` (editorial
full-bleed). Product grids: `repeat(auto-fill, minmax(220px, 1fr))` desktop,
**2-up** below 640px.

**Breakpoints** — `sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

**Z-index** — `header 30 · dropdown 40 · overlay 50 · drawer 60 · toast 70 · modal 80`.

---

## 5. Motion

**Durations** — `--dur-1 120ms` (micro), `--dur-2 200ms` (hover), `--dur-3 320ms`
(enter), `--dur-4 500ms` (reveal), `--dur-5 800ms` (hero/cinematic).

**Easing** — `--ease-out cubic-bezier(.16,1,.3,1)` (default enter),
`--ease-in-out cubic-bezier(.65,0,.35,1)` (move), `--ease-luxe cubic-bezier(.22,1,.36,1)`
(image/scale reveals).

**Rules**
- **One focal motion per view.** Reveal-on-scroll: fade + 12px rise, `--dur-4`,
  stagger 60ms, once.
- **Product image hover:** scale `1.04`, `--dur-3`, `--ease-luxe`; optional crossfade
  to the second (dual-angle) image.
- **Buttons:** background `--dur-2`; press scale `0.98`.
- **Page transitions:** cross-fade `--dur-3`; shared-element on PDP image (blueprint).
- **`prefers-reduced-motion`:** disable transforms/scroll-reveal; keep opacity only.

---

## 6. Component states (canonical)

Every interactive component defines all of: **default, hover, active/pressed,
focus-visible, disabled, loading**. Plus, for data views: **empty, error**.

- **Focus-visible:** `2px solid --gold`, `2px` offset, `--radius-sm`. Always visible
  for keyboard; never removed.
- **Loading:** skeleton with warm shimmer (`--surface-2` → `--border`), never spinners
  for content; buttons show an inline progress glyph and disable.
- **Empty:** centred, `--fg-muted`, one line of guidance + one primary action
  (e.g. empty cart → "Start with the Signature Selection").
- **Error:** inline, `--error`, `0.78rem`, below the field; forms never lose input.

---

## 7. Component specs (summary)

| Component | Spec highlights |
|---|---|
| **Announcement bar** | Onyx ground, gold hairline under, rotating *service/trust* messages (free insured shipping · certification · COD · exchange), `--dur-5` crossfade. Never a countdown/discount. Dismissible. |
| **Navbar** | Sticky, ivory `+ blur`, hairline bottom. Serif wordmark + eyebrow tagline. Desktop: category links + mega menu. Mobile: logo+cart row, full-width search, scrollable category strip. |
| **Mega menu** | Full-width panel, 4 columns: categories · collections · a featured product card · an editorial tile. Slides `--dur-3`, `--ease-out`. |
| **Hero** | Cinematic onyx or full-bleed lifestyle image, eyebrow + serif display headline + one primary + one ghost CTA. No carousel by default (one strong story > rotating banners). |
| **Product card** | Square image (`--radius-lg`), dual-angle crossfade on hover, name (serif), metal + purity caption, price (serif), certification micro-badge. Quiet: no loud discount badge — a small "•NN% " only if MRP set. Wishlist heart top-right. |
| **Collection card** | Editorial: large image, eyebrow, serif title, one-line intro, "Explore →". |
| **Buttons** | `primary` (onyx), `gold` (accent CTA), `ghost` (hairline). `44px` min touch, `--radius`, press `0.98`. |
| **Badges/chips** | Pill, `0.7rem`, tracked. Trust chips use gold-on-surface, not colour-loud. |
| **Filters** | Metal, price band, gemstone, gender, sort. Chips on desktop; a bottom-sheet drawer on mobile. Reflect to URL (`?metal=&maxPrice=&sort=`) for SEO + shareability. |
| **PDP gallery** | Vertical thumbnails + main image; zoom on hover/tap; slots for 360°/video/AR + lifestyle shots. |
| **Sticky purchase panel** | Name, price, certification, size selector, Add to Bag, insured-shipping line; sticks on desktop scroll, becomes a fixed bottom bar on mobile. |
| **Reviews** | Verified badge, rating distribution, photo reviews, most-helpful sort. |
| **Footer** | Cinematic onyx, serif wordmark, The Aurelia Promise (hallmark/price-breakup/exchange/returns), shop + collections columns, newsletter, socials. |
| **Newsletter** | Editorial band, single email field, gold CTA, privacy line. |
| **Trust section** | Row of icon+label: BIS hallmark · IGI/GIA certified · transparent price breakup · lifetime exchange · insured shipping. |

---

## 8. Mapping to the build

- **Tokens** live in `src/app/globals.css` `:root` and are mirrored by
  `ThemeSetting` (`prisma/schema.prisma`) so the **Theme Builder** edits them from
  the admin — nothing is hardcoded in components.
- **Content** (announcement messages, homepage sections, nav, footer) is defined in
  one place per the repository pattern (`src/lib/site.ts` today → `HomepageSection`
  / `NavigationItem` / `Setting` tables when the backend lands). See
  `ARCHITECTURE.md §0` for the static→full-stack swap.
- **Every page & component** listed in the request is specified above and in
  `ROADMAP.md` (Phase 4 design system, Phase 5 storefront, Phase 7 admin). The
  AR/360/video viewers and admin builders are Track B (need the Node backend).
