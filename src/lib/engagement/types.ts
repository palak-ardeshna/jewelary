// ============================================================================
// Engagement system — configuration TYPES.
//
// This file is the *schema* of the Admin Panel. Every engagement feature on the
// storefront is driven by a row of this shape — nothing about a popup, banner,
// social-proof toast or upsell is hardcoded in a component. In the static build
// the "admin" is `config.ts` (edit-and-redeploy); in the full-stack build these
// same fields become CMS/DB columns and an authenticated dashboard writes them.
//
// Design rule: a component reads config → evaluates targeting/schedule/frequency
// at runtime → renders or stays silent. Turning a feature off is data, not code.
// ============================================================================

/** Devices a feature may target. Resolved client-side from viewport + UA hints. */
export type Device = "desktop" | "mobile" | "tablet";

/** Coarse audience buckets we can detect client-side without a backend. */
export type Audience =
  | "all"
  | "new" // no prior session / empty order history in localStorage
  | "returning" // has visited before
  | "cart-abandoner" // has items in cart but hasn't checked out
  | "vip"; // flagged in localStorage (loyalty) — set by other features

/** How a popup-style feature is triggered. */
export type TriggerType =
  | "immediate"
  | "timed" // after `delayMs`
  | "scroll" // after scrolling `scrollPercent` of the page
  | "exit-intent" // pointer leaves viewport toward the tab bar (desktop)
  | "idle"; // no interaction for `delayMs`

/**
 * Targeting + delivery rules shared by every feature. This is the part the
 * admin tweaks most: who sees it, where, when, and how often.
 */
export interface Targeting {
  /** Master on/off. */
  enabled: boolean;
  /** Audience buckets that may see it. Empty ⇒ everyone. */
  audiences?: Audience[];
  /** Devices that may see it. Empty ⇒ all devices. */
  devices?: Device[];
  /**
   * ISO-3166 alpha-2 country allow-list (e.g. ["IN","AE"]). Empty ⇒ all.
   * Requires a geo resolver (see runtime.resolveCountry) — no-ops to "allow" if
   * geo is unavailable in the static build, which we surface honestly.
   */
  countries?: string[];
  /** Schedule window. Omit a bound to leave it open. ISO 8601 strings. */
  startAt?: string;
  endAt?: string;
}

/** Frequency capping — how often a user may be shown / re-shown a feature. */
export interface Frequency {
  /** Max impressions before we stop showing it. 0 ⇒ unlimited. */
  maxImpressions?: number;
  /** Once dismissed, don't show again for this many hours. 0 ⇒ never re-show. */
  dismissForHours?: number;
  /** Show at most once per this many hours regardless of dismissal. */
  minHoursBetween?: number;
  /** Once the goal is converted (e.g. subscribed), never show again. */
  hideAfterConvert?: boolean;
}

/** An A/B experiment: named variants with integer weights. */
export interface Experiment {
  /** Stable experiment key; also the localStorage assignment key. */
  key: string;
  variants: { id: string; weight: number; overrides?: Record<string, unknown> }[];
}

/** Visual + copy design for a popup. Kept declarative so the admin owns it. */
export interface PopupDesign {
  layout: "center-modal" | "bottom-sheet" | "corner-card" | "full-banner";
  eyebrow?: string;
  heading: string;
  body?: string;
  imageUrl?: string;
  primaryCta: { label: string; href?: string };
  secondaryCta?: { label: string; href?: string };
  /** Show an email capture field. */
  emailCapture?: boolean;
  /** Entry animation utility (maps to CSS in engagement.css). */
  animation?: "fade-scale" | "slide-up" | "slide-right" | "fade";
  /** Accent theming — defaults to the site gold. */
  accent?: string;
  dark?: boolean;
}

/** An offer/coupon a feature can grant. */
export interface Offer {
  code: string;
  label: string; // "10% off your first order"
  kind: "percent" | "amount" | "free-shipping" | "gift";
  value?: number; // percent or paise, depending on kind
  /** Minimum cart subtotal (paise) for the offer to apply. */
  minSubtotalPaise?: number;
  expiresAt?: string;
}

/** A single popup feature (welcome, newsletter, VIP, exit offer, …). */
export interface PopupConfig {
  id: string;
  kind:
    | "welcome"
    | "newsletter"
    | "exit-offer"
    | "vip"
    | "first-order"
    | "festival"
    | "new-collection"
    | "birthday";
  targeting: Targeting;
  frequency: Frequency;
  trigger: { type: TriggerType; delayMs?: number; scrollPercent?: number };
  design: PopupDesign;
  offer?: Offer;
  experiment?: Experiment;
}

/** Free-shipping / unlock-next-discount progress bar (shown in cart). */
export interface ProgressBarConfig {
  id: string;
  targeting: Targeting;
  /** Ordered reward tiers by subtotal threshold (paise). */
  tiers: { atPaise: number; label: string; reward: string }[];
  /** Copy shown when a tier is unlocked. */
  unlockedLabel: string;
}

/** Sticky add-to-cart bar on product pages. */
export interface StickyAtcConfig {
  id: string;
  targeting: Targeting;
  /** Appear after scrolling past the main buy box (px). */
  showAfterPx: number;
}

/** Gift-wrap / premium packaging upsell in the cart. */
export interface UpsellConfig {
  id: string;
  targeting: Targeting;
  heading: string;
  body: string;
  pricePaise: number;
  icon?: string;
}

/** Cross-sell rail on the PDP (complete-the-look / frequently-bought). */
export interface CrossSellConfig {
  id: string;
  targeting: Targeting;
  heading: string;
  /** How partner products are chosen when no explicit map exists. */
  strategy: "same-collection" | "same-category" | "curated";
  /** Optional explicit product-slug → partner-slugs map for "curated". */
  curated?: Record<string, string[]>;
  maxItems: number;
}

/** Recently-purchased social-proof toast. */
export interface SocialProofConfig {
  id: string;
  targeting: Targeting;
  frequency: Frequency;
  /** Seconds each toast is visible. */
  visibleSeconds: number;
  /** Seconds between toasts. */
  intervalSeconds: number;
  /**
   * Admin-curated recent purchases (static build's honest stand-in for a live
   * order feed). Each references a real product slug; the component reads the
   * product from the store, so nothing is fabricated about the product itself.
   */
  events: { productSlug: string; city: string; minutesAgo: number }[];
}

/** Low-stock urgency indicator (only renders when real stock data exists). */
export interface LowStockConfig {
  id: string;
  targeting: Targeting;
  /** Show the indicator only at/below this units-remaining count. */
  thresholdUnits: number;
  label: string; // "Only {n} left in stock"
}

/** Recently-viewed rail. Purely client-side (localStorage), no PII. */
export interface RecentlyViewedConfig {
  id: string;
  targeting: Targeting;
  heading: string;
  maxItems: number;
}

/** Product rails driven by tags (trending / best-seller). */
export interface RailConfig {
  id: string;
  targeting: Targeting;
  heading: string;
  /** Products whose `tags` include this show up (e.g. "Best Seller"). */
  tag: string;
  maxItems: number;
}

/** The whole Admin Panel, as one object. */
export interface EngagementConfig {
  /** Global kill-switch — one flag silences the entire system. */
  masterEnabled: boolean;
  /** Analytics sink. "console" in dev; "dataLayer" pushes GA4/GTM events. */
  analytics: { sink: "console" | "dataLayer" | "none"; debug?: boolean };
  popups: PopupConfig[];
  progressBar?: ProgressBarConfig;
  stickyAtc?: StickyAtcConfig;
  giftWrapUpsell?: UpsellConfig;
  crossSell?: CrossSellConfig;
  socialProof?: SocialProofConfig;
  lowStock?: LowStockConfig;
  recentlyViewed?: RecentlyViewedConfig;
  rails: RailConfig[];
}
