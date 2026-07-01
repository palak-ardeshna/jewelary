// Central place for site-wide constants. The canonical origin drives every
// absolute URL we emit (schema.org JSON-LD, canonical tags, sitemap, robots).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Aurelia";
export const SITE_TAGLINE = "Fine Jewellery";
export const SITE_DESCRIPTION =
  "Aurelia — certified fine jewellery. BIS-hallmarked gold, platinum and IGI/GIA-certified diamonds. Rings, necklaces, earrings, bangles and bridal jewellery with a transparent price breakup, lifetime exchange and 30-day returns.";

// Announcement bar content — a single source (Setting/CMS row in the full-stack
// build). Deliberately service- & trust-led, never discount countdowns.
export const ANNOUNCEMENTS: string[] = [
  "Complimentary insured shipping across India",
  "Every piece BIS-hallmarked · IGI / GIA-certified diamonds",
  "Transparent price breakup · Lifetime exchange",
  "Cash on Delivery available · 30-day returns",
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
