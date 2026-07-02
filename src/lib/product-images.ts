// Resolves a relevant Unsplash jewellery image from product-name keywords.
// Placeholder imagery only — replace with real product photography (Track B /
// Media library). All hosts here are images.unsplash.com (allow-listed in
// next.config.mjs). Priority: most-specific keyword first.

const BASE = "https://images.unsplash.com";
const Q = "?w=800&q=80&fit=crop&auto=format";

const KEYWORD_MAP: Array<[string[], string]> = [
  // ── Rings ────────────────────────────────────────────────────────────────
  [["ring", "band", "signet", "kada", "cocktail"], "photo-1605100804763-247f67b3557e"], 

  // ── Necklaces / Chains / Pendants ──────────────────────────────────────────
  [["necklace", "mangalsutra", "chain", "pendant"], "photo-1599643478518-a784e5dc4c8f"], 

  // ── Earrings ───────────────────────────────────────────────────────────────
  [["earring", "stud", "hoop", "jhumka", "drop"], "photo-1630019852942-f89202989a59"], 

  // ── Bracelets / Bangles ─────────────────────────────────────────────────────
  [["bracelet", "bangle"], "photo-1611591437281-460bfbe1220a"], 

  // ── Generic / Fallback ─────────────────────────────────────────────────────────
  [["emerald", "ruby", "sapphire", "gemstone", "silver", "gift"], "photo-1515562141207-7a88fb7ce338"], 
];

/**
 * Resolves a relevant Unsplash image URL by matching keywords in the product
 * name. Falls back to a generic fine-jewellery image if nothing matches.
 */
export function getProductImageUrl(name: string): string {
  const lower = name.toLowerCase();
  for (const [keywords, photoId] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return `${BASE}/${photoId}${Q}`;
    }
  }
  // Generic fine-jewellery fallback
  return `${BASE}/photo-1515562141207-7a88fb7ce338${Q}`;
}

/**
 * Returns the product's explicit imageUrl if set, otherwise auto-resolves from
 * the product name.
 */
export function resolveProductImage(name: string, imageUrl?: string | null): string {
  if (imageUrl) return imageUrl;
  return getProductImageUrl(name);
}
