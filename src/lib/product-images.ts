// Resolves a relevant Unsplash jewellery image from product-name keywords.
// Placeholder imagery only — replace with real product photography (Track B /
// Media library). All hosts here are images.unsplash.com (allow-listed in
// next.config.mjs). Priority: most-specific keyword first.

const BASE = "https://images.unsplash.com";
const Q = "?w=800&q=80&fit=crop&auto=format";

const KEYWORD_MAP: Array<[string[], string]> = [
  // ── Rings ────────────────────────────────────────────────────────────────
  [["solitaire ring", "engagement", "halo"],       "photo-1605100804763-247f67b3557e"], // diamond ring
  [["eternity", "band"],                            "photo-1603561591411-07134e71a2a9"], // wedding band
  [["signet", "kada", "cocktail"],                  "photo-1611085583191-a3b181a88401"], // gold ring
  [["ring"],                                         "photo-1605100804763-247f67b3557e"], // generic ring

  // ── Necklaces / Chains / Pendants ──────────────────────────────────────────
  [["tennis necklace", "riviera"],                  "photo-1599643478518-a784e5dc4c8f"], // diamond necklace
  [["bridal", "mangalsutra", "maharani"],           "photo-1601121141461-9d6647bca1ed"], // bridal gold set
  [["rope chain", "gold chain", "chain"],           "photo-1602751584552-8ba73aad10e1"], // gold chain
  [["solitaire pendant", "initial pendant", "heart pendant", "pendant"], "photo-1611652022419-a9419f74343d"], // pendant
  [["necklace"],                                     "photo-1599643478518-a784e5dc4c8f"], // generic necklace

  // ── Earrings ───────────────────────────────────────────────────────────────
  [["stud", "solitaire studs", "cz studs"],         "photo-1635767798638-3e25273a8236"], // diamond studs
  [["hoop"],                                         "photo-1630019852942-f89202989a59"], // gold hoops
  [["jhumka", "drop", "chandelier"],                "photo-1610694955371-d4a3e0ce4b52"], // ethnic earrings
  [["earring"],                                      "photo-1635767798638-3e25273a8236"], // generic earrings

  // ── Bracelets / Bangles ─────────────────────────────────────────────────────
  [["tennis bracelet"],                             "photo-1611591437281-460bfbe1220a"], // diamond bracelet
  [["bangle", "kada"],                              "photo-1611591437281-460bfbe1220a"], // gold bangles/bracelet
  [["bracelet", "chain bracelet"],                  "photo-1611591437281-460bfbe1220a"], // bracelet

  // ── Gemstone / Gifts ─────────────────────────────────────────────────────────
  [["emerald", "ruby", "sapphire", "gemstone"],     "photo-1602173574767-37ac01994b2a"], // gemstone jewellery
  [["silver", "gift"],                              "photo-1515562141207-7a88fb7ce338"], // silver jewellery
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
