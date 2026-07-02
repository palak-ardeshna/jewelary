// Central place for site-wide constants. The canonical origin drives every
// absolute URL we emit (schema.org JSON-LD, canonical tags, sitemap, robots).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Aurelia";
export const SITE_TAGLINE = "Fine Jewellery";
export const SITE_DESCRIPTION =
  "Aurelia — design-led fine jewellery. 18K solid gold, platinum, and brilliant hand-set stones. Made to be worn. Built to last. Meant to be inherited.";

// Announcement bar content — a single source (Setting/CMS row in the full-stack
// build). Deliberately service- & trust-led, never discount countdowns.
export const ANNOUNCEMENTS: string[] = [
  "Complimentary insured shipping across India",
  "18k solid gold & platinum · hand-set brilliant stones",
  "Transparent pricing · Lifetime exchange",
  "Cash on Delivery available · 30-day easy returns",
];

export function absUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPrice(priceInPaise: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100);
}
