// ============================================================================
// Engagement system — the ADMIN PANEL, as data.
//
// This is the single source of truth for every engagement feature. Editing a
// value here is the static-build equivalent of toggling a switch in an admin
// dashboard: change it, redeploy, done — no component code changes. In the
// full-stack build this object is loaded from the DB/CMS instead of imported.
//
// Money is integer paise (INR), matching src/data/store.ts.
// ============================================================================

import type { EngagementConfig } from "./types";

export const engagementConfig: EngagementConfig = {
  masterEnabled: true,
  analytics: { sink: "console", debug: true },

  // ── Popups & offers ──────────────────────────────────────────────────────
  popups: [
    {
      id: "welcome-first-order",
      kind: "welcome",
      targeting: {
        enabled: true,
        audiences: ["new"],
        devices: [], // all
        countries: [], // all
      },
      frequency: { maxImpressions: 2, dismissForHours: 72, hideAfterConvert: true },
      trigger: { type: "timed", delayMs: 6000 },
      design: {
        layout: "center-modal",
        eyebrow: "The Aurelia Society",
        heading: "10% off your first heirloom",
        body: "Join for private access to new collections and a welcome offer on your first order.",
        primaryCta: { label: "Reveal my code" },
        secondaryCta: { label: "Maybe later" },
        emailCapture: true,
        animation: "fade-scale",
        accent: "#C9A96E",
        dark: false,
      },
      offer: { code: "WELCOME10", label: "10% off your first order", kind: "percent", value: 10 },
      experiment: {
        key: "welcome-copy",
        variants: [
          { id: "A-heirloom", weight: 1 },
          { id: "B-society", weight: 1, overrides: { heading: "An invitation to the Aurelia Society" } },
        ],
      },
    },
    {
      id: "exit-save-cart",
      kind: "exit-offer",
      targeting: { enabled: true, audiences: ["cart-abandoner"], devices: ["desktop"] },
      frequency: { dismissForHours: 24, minHoursBetween: 6 },
      trigger: { type: "exit-intent" },
      design: {
        layout: "center-modal",
        eyebrow: "Before you go",
        heading: "Your selections are reserved",
        body: "Complete your order in the next 15 minutes with complimentary gift wrapping.",
        primaryCta: { label: "Return to cart", href: "/cart" },
        secondaryCta: { label: "Keep browsing" },
        animation: "fade-scale",
      },
      offer: { code: "GIFTWRAP", label: "Free gift wrapping", kind: "gift" },
    },
    {
      id: "newsletter-society",
      kind: "newsletter",
      targeting: { enabled: true, audiences: ["returning"] },
      frequency: { dismissForHours: 168, hideAfterConvert: true },
      trigger: { type: "scroll", scrollPercent: 60 },
      design: {
        layout: "corner-card",
        eyebrow: "Editorial",
        heading: "The Society Letter",
        body: "New arrivals, styling notes and private events — a few times a season.",
        primaryCta: { label: "Subscribe" },
        emailCapture: true,
        animation: "slide-up",
      },
    },
    {
      id: "vip-invite",
      kind: "vip",
      targeting: { enabled: false, audiences: ["returning"] }, // off by default; admin can enable
      frequency: { maxImpressions: 1, dismissForHours: 720 },
      trigger: { type: "idle", delayMs: 30000 },
      design: {
        layout: "center-modal",
        eyebrow: "By invitation",
        heading: "Join Aurelia Private",
        body: "Early access to limited pieces, a dedicated advisor, and priority appointments.",
        primaryCta: { label: "Request access" },
        secondaryCta: { label: "Not now" },
        animation: "fade-scale",
        dark: true,
        accent: "#C9A96E",
      },
    },
  ],

  // ── Cart & conversion ────────────────────────────────────────────────────
  progressBar: {
    id: "free-shipping-bar",
    targeting: { enabled: true },
    tiers: [
      { atPaise: 15000, label: "Free insured shipping", reward: "free-shipping" },
      { atPaise: 30000, label: "Free gift wrapping", reward: "gift-wrap" },
    ],
    unlockedLabel: "Unlocked",
  },
  stickyAtc: {
    id: "pdp-sticky-atc",
    targeting: { enabled: true },
    showAfterPx: 520,
  },
  giftWrapUpsell: {
    id: "cart-gift-wrap",
    targeting: { enabled: true },
    heading: "Add luxury gift wrapping",
    body: "Signature box, ribbon and a handwritten note.",
    pricePaise: 9900,
    icon: "gift",
  },
  crossSell: {
    id: "pdp-complete-the-look",
    targeting: { enabled: true },
    heading: "Complete the look",
    strategy: "same-collection",
    maxItems: 4,
  },

  // ── Social proof ─────────────────────────────────────────────────────────
  socialProof: {
    id: "recent-purchases",
    targeting: { enabled: true },
    frequency: { minHoursBetween: 0 },
    visibleSeconds: 6,
    intervalSeconds: 18,
    // Admin-curated; each references a real product in the store.
    events: [
      { productSlug: "aurora-platinum-solitaire-ring", city: "Mumbai", minutesAgo: 8 },
      { productSlug: "celeste-halo-diamond-ring", city: "Bengaluru", minutesAgo: 21 },
      { productSlug: "luna-diamond-eternity-band", city: "Delhi", minutesAgo: 44 },
    ],
  },
  lowStock: {
    id: "pdp-low-stock",
    targeting: { enabled: true },
    thresholdUnits: 5,
    label: "Only {n} left — hallmarked to order",
  },
  recentlyViewed: {
    id: "recently-viewed",
    targeting: { enabled: true },
    heading: "Recently viewed",
    maxItems: 6,
  },
  rails: [
    { id: "best-sellers", targeting: { enabled: true }, heading: "Best sellers", tag: "Best Seller", maxItems: 8 },
    { id: "trending", targeting: { enabled: true }, heading: "Trending now", tag: "Trending", maxItems: 8 },
  ],
};
