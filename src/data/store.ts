// ============================================================================
// Aurelia — Fine Jewellery · in-memory data store + DB-shaped query API.
//
// This is the REPOSITORY layer. Routes/components import only the query helpers
// below, never the raw arrays. That is the contract that lets us swap the data
// source to Prisma/Postgres later (Track B) by editing this one file — the
// signatures stay identical. The TS interfaces here mirror `prisma/schema.prisma`.
//
// Money is integer paise (INR). Optional jewellery attributes (metal, purity,
// gemstone, weight, certification) are additive, so every existing consumer of
// `Product` keeps working.
// ============================================================================

import { getProductImageUrl } from "@/lib/product-images";
// Local product photography (static import → optimised path, works on static export).
// Images analysed from src/assets/jewelary-img and matched to the product each depicts.
import mangalsutraImg from "@/assets/jewelary-img/Mediaa.jpg";       // gold mangalsutra, black beads, CZ halo
import mangalsutraLeafImg from "@/assets/jewelary-img/d.jpg";        // gold mangalsutra, leaf-vine + heart charm
import diamondNecklaceImg from "@/assets/jewelary-img/Media.jpg";    // delicate diamond drop necklace
import heartDropEarringsImg from "@/assets/jewelary-img/y.jpg";      // blue crystal heart-drop earrings
import pinkHaloRingImg from "@/assets/jewelary-img/rr.jpg";          // pink sapphire halo ring
import rubyBangleImg from "@/assets/jewelary-img/w.jpg";             // gold bangle, ruby flower cluster

export interface Brand { id: string; slug: string; name: string; }
export interface Category { id: string; slug: string; name: string; description?: string; parentId?: string; }
export interface Review { id: string; productId: string; rating: number; author: string; body: string; }

/** A gemstone set into a piece (subset of the Prisma `Gemstone` model). */
export interface Gemstone { type: string; caratWeight?: number; cut?: string; clarity?: string; count?: number; }

/** A trust certificate (subset of the Prisma `Certification` model). */
export interface Certification { body: string; number?: string; }

export interface Product {
  id: string; slug: string; name: string; description: string;
  priceInPaise: number; mrpInPaise?: number; currency: string;
  inStock: boolean; stockUnits?: number; color?: string; imageUrl?: string;
  categoryId: string; brandId?: string;
  rating?: number; reviewCount?: number; sizes?: string[];
  // ── Jewellery attributes (all optional; mirror the Prisma Product model) ──
  metal?: string;            // "18K Yellow Gold", "Platinum 950", "Sterling Silver"
  purity?: string;           // "18K", "22K", "PT950", "925"
  grossWeightG?: number;     // grams
  gemstones?: Gemstone[];
  certifications?: Certification[];
  collectionLine?: string;   // "Solitaire", "Everyday Gold", "Bridal Heritage"
  gender?: string;           // "Women" | "Men" | "Unisex"
  tags?: string[];           // "Best Seller", "Limited Stock", "New Arrival"
}

export interface CollectionFilter { categorySlug?: string; brandSlug?: string; color?: string; maxPriceInPaise?: number; }
export interface Collection { id: string; slug: string; title: string; intro?: string; filter: CollectionFilter; }

export const brands: Brand[] = [
  { id: "b_signature", slug: "aurelia-signature", name: "Aurelia Signature" },
  { id: "b_bridal", slug: "aurelia-bridal", name: "Aurelia Bridal" },
];

export const categories: Category[] = [
  { id: "c_rings", slug: "rings", name: "Rings", description: "Fine gold, platinum and diamond rings — from everyday bands to statement cocktail rings, each BIS-hallmarked and certified." },
  { id: "c_engagement", slug: "engagement-rings", name: "Engagement Rings", description: "Solitaire and halo engagement rings in platinum and 18K gold, set with IGI/GIA-certified diamonds.", parentId: "c_rings" },
  { id: "c_necklaces", slug: "necklaces", name: "Necklaces", description: "Diamond, gold and gemstone necklaces — delicate everyday chains to heritage bridal necklaces." },
  { id: "c_earrings", slug: "earrings", name: "Earrings", description: "Studs, hoops, drops and jhumkas in certified gold and diamond — designed for daily wear and occasion." },
  { id: "c_bracelets", slug: "bracelets", name: "Bracelets", description: "Tennis bracelets, chain bracelets and charm bracelets in 18K gold and platinum." },
  { id: "c_bangles", slug: "bangles", name: "Bangles", description: "Traditional and contemporary gold bangles and kadas, hallmarked for guaranteed purity." },
  { id: "c_pendants", slug: "pendants", name: "Pendants", description: "Solitaire, initial and motif pendants in gold and diamond — the perfect everyday sparkle." },
  { id: "c_mangalsutra", slug: "mangalsutra", name: "Mangalsutra", description: "Modern and classic mangalsutra designs in 18K gold with diamond accents." },
  { id: "c_gifts", slug: "gifts", name: "Gifts", description: "Thoughtfully priced gold and silver gifts — pendants, studs and charms for every celebration." },
];

const _products: Product[] = [
  // ── Engagement Rings ──────────────────────────────────────────────────────
  {
    id: "p_solitaire_pt", slug: "aurora-platinum-solitaire-ring", name: "Aurora Platinum Solitaire Ring",
    description: "A timeless six-prong solitaire in 95% platinum, set with a single IGI-certified round-brilliant diamond. The knife-edge band throws light back into the stone for maximum brilliance. A forever ring, made to be worn every day.",
    priceInPaise: 27900, mrpInPaise: 29900, currency: "INR", inStock: true, color: "Platinum",
    categoryId: "c_engagement", brandId: "b_bridal", collectionLine: "Solitaire", gender: "Women",
    metal: "Platinum 950", purity: "PT950", grossWeightG: 4.2,
    gemstones: [{ type: "Diamond", caratWeight: 0.75, cut: "Round", clarity: "VVS2", count: 1 }],
    certifications: [{ body: "IGI", number: "IGI-2026-AUR-0075" }, { body: "BIS" }],
    rating: 4.9, reviewCount: 86, sizes: ["10","11","12","13","14","15","16"],
    tags: ["Best Seller"],
  },
  {
    id: "p_halo_ring", slug: "celeste-halo-diamond-ring", name: "Celeste Halo Diamond Ring",
    description: "A brilliant centre stone encircled by a halo of pavé diamonds in 18K white gold. The halo amplifies the centre diamond's size and sparkle, while the split shank adds a modern edge.",
    priceInPaise: 24900, mrpInPaise: 29900, currency: "INR", inStock: true, stockUnits: 3, color: "White Gold",
    categoryId: "c_engagement", brandId: "b_bridal", collectionLine: "Halo", gender: "Women",
    metal: "18K White Gold", purity: "18K", grossWeightG: 3.8,
    gemstones: [{ type: "Diamond", caratWeight: 0.5, cut: "Round", clarity: "VS1", count: 1 }, { type: "Diamond", caratWeight: 0.3, cut: "Round", count: 18 }],
    certifications: [{ body: "IGI", number: "IGI-2026-AUR-0050" }, { body: "BIS" }],
    rating: 4.8, reviewCount: 64, sizes: ["10","11","12","13","14","15","16"],
    tags: ["Limited Stock", "Trending"],
  },
  // ── Rings ─────────────────────────────────────────────────────────────────
  {
    id: "p_eternity_band", slug: "luna-diamond-eternity-band", name: "Luna Diamond Eternity Band",
    description: "A full circle of channel-set round diamonds in 18K yellow gold. Equally at home as a wedding band or a stack-worthy anniversary ring.",
    priceInPaise: 22900, mrpInPaise: 27900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_rings", brandId: "b_signature", collectionLine: "Eternity", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 3.1,
    gemstones: [{ type: "Diamond", caratWeight: 0.9, cut: "Round", count: 22 }],
    certifications: [{ body: "BIS" }],
    rating: 4.7, reviewCount: 112, sizes: ["10","11","12","13","14","15","16"],
  },
  {
    id: "p_signet_ring", slug: "regal-gold-signet-ring", name: "Regal 22K Gold Signet Ring",
    description: "A substantial 22K gold signet ring with a hand-finished matte face, ready for engraving. A modern heirloom for him or her.",
    priceInPaise: 19900, mrpInPaise: 24900, currency: "INR", inStock: true, stockUnits: 4, color: "Yellow Gold",
    categoryId: "c_rings", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Unisex",
    metal: "22K Yellow Gold", purity: "22K", grossWeightG: 9.4,
    certifications: [{ body: "BIS" }],
    rating: 4.6, reviewCount: 73, sizes: ["12","13","14","15","16","17","18"],
    tags: ["New Arrival"],
  },
  {
    id: "p_emerald_ring", slug: "verde-emerald-cocktail-ring", name: "Verde Emerald Cocktail Ring",
    description: "A vivid Zambian emerald framed by two trapezoid diamonds in 18K yellow gold. A statement ring that catches every light.",
    priceInPaise: 25900, mrpInPaise: 29900, currency: "INR", inStock: false, color: "Yellow Gold",
    categoryId: "c_rings", brandId: "b_signature", collectionLine: "Gemstone", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 5.6,
    gemstones: [{ type: "Emerald", caratWeight: 1.8, cut: "Emerald", count: 1 }, { type: "Diamond", caratWeight: 0.4, cut: "Trapezoid", count: 2 }],
    certifications: [{ body: "SGL" }, { body: "BIS" }],
    rating: 4.8, reviewCount: 29, sizes: ["11","12","13","14","15"],
  },
  {
    id: "p_pink_halo_ring", slug: "rose-pink-sapphire-halo-ring", name: "Rosé Pink Sapphire Halo Ring",
    description: "An emerald-cut pink sapphire framed by a halo of pavé diamonds, set on a slender diamond-set band in 18K rose gold. A romantic statement ring that flatters every skin tone.",
    imageUrl: pinkHaloRingImg.src,
    priceInPaise: 24900, mrpInPaise: 29900, currency: "INR", inStock: true, color: "Rose Gold",
    categoryId: "c_rings", brandId: "b_signature", collectionLine: "Gemstone", gender: "Women",
    metal: "18K Rose Gold", purity: "18K", grossWeightG: 4.0,
    gemstones: [{ type: "Pink Sapphire", caratWeight: 1.5, cut: "Emerald", count: 1 }, { type: "Diamond", caratWeight: 0.5, cut: "Round", count: 28 }],
    certifications: [{ body: "SGL" }, { body: "BIS" }],
    rating: 4.8, reviewCount: 47, sizes: ["10","11","12","13","14","15","16"],
  },
  // ── Necklaces ─────────────────────────────────────────────────────────────
  {
    id: "p_tennis_necklace", slug: "riviera-diamond-tennis-necklace", name: "Riviera Diamond Necklace",
    description: "A delicate station line of graduated round diamonds in 18K white gold, finishing in a graceful diamond drop at the centre. The red-carpet classic, reimagined for everyday elegance. Secured with a concealed box clasp and safety catch.",
    imageUrl: diamondNecklaceImg.src,
    priceInPaise: 27900, mrpInPaise: 29900, currency: "INR", inStock: true, color: "White Gold",
    categoryId: "c_necklaces", brandId: "b_bridal", collectionLine: "Riviera", gender: "Women",
    metal: "18K White Gold", purity: "18K", grossWeightG: 14.2,
    gemstones: [{ type: "Diamond", caratWeight: 5.0, cut: "Round", count: 42 }],
    certifications: [{ body: "IGI" }, { body: "BIS" }],
    rating: 4.9, reviewCount: 18, sizes: ["16in","18in"],
  },
  {
    id: "p_gold_chain", slug: "aurea-rope-gold-chain", name: "Aurea Rope 22K Gold Chain",
    description: "A classic rope-link chain in 22K gold with a lobster clasp. The everyday gold chain that layers beautifully and holds its shine for a lifetime.",
    priceInPaise: 19900, mrpInPaise: 24900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_necklaces", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Unisex",
    metal: "22K Yellow Gold", purity: "22K", grossWeightG: 8.0,
    certifications: [{ body: "BIS" }],
    rating: 4.7, reviewCount: 204, sizes: ["18in","20in","22in"],
  },
  {
    id: "p_bridal_necklace", slug: "maharani-bridal-necklace-set", name: "Maharani Bridal Necklace Set",
    description: "A heritage bridal necklace in 22K gold with uncut polki diamonds and a matching pair of earrings. Handcrafted by master karigars in the Kundan tradition.",
    priceInPaise: 28900, mrpInPaise: 29900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_necklaces", brandId: "b_bridal", collectionLine: "Bridal Heritage", gender: "Women",
    metal: "22K Yellow Gold", purity: "22K", grossWeightG: 46.0,
    gemstones: [{ type: "Polki", caratWeight: 8.5, cut: "Uncut", count: 36 }],
    certifications: [{ body: "BIS" }],
    rating: 5.0, reviewCount: 12, sizes: ["16in"],
  },
  // ── Earrings ──────────────────────────────────────────────────────────────
  {
    id: "p_solitaire_studs", slug: "stella-solitaire-diamond-studs", name: "Stella Solitaire Diamond Studs",
    description: "A perfectly matched pair of round-brilliant diamond studs in four-prong 18K white gold settings, with secure screw backs. The one pair of earrings you'll never take off.",
    priceInPaise: 19900, mrpInPaise: 25900, currency: "INR", inStock: true, color: "White Gold",
    categoryId: "c_earrings", brandId: "b_signature", collectionLine: "Solitaire", gender: "Women",
    metal: "18K White Gold", purity: "18K", grossWeightG: 2.4,
    gemstones: [{ type: "Diamond", caratWeight: 1.0, cut: "Round", clarity: "VS2", count: 2 }],
    certifications: [{ body: "IGI" }, { body: "BIS" }],
    rating: 4.9, reviewCount: 158, sizes: [],
  },
  {
    id: "p_gold_hoops", slug: "sol-everyday-gold-hoops", name: "Sol Everyday 18K Gold Hoops",
    description: "Lightweight 18K gold huggie hoops with a smooth polished finish and a click-clasp closure. The perfect throw-on-and-go hoop, sized for daily wear.",
    priceInPaise: 12900, mrpInPaise: 17900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_earrings", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 2.1,
    certifications: [{ body: "BIS" }],
    rating: 4.6, reviewCount: 341, sizes: [],
  },
  {
    id: "p_jhumka", slug: "rani-gold-jhumka-earrings", name: "Rani 22K Gold Jhumka Earrings",
    description: "Traditional dome jhumkas in 22K gold with intricate filigree and delicate gold bead drops. A festive classic reimagined light enough for all-day wear.",
    priceInPaise: 19900, mrpInPaise: 24900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_earrings", brandId: "b_bridal", collectionLine: "Bridal Heritage", gender: "Women",
    metal: "22K Yellow Gold", purity: "22K", grossWeightG: 12.6,
    certifications: [{ body: "BIS" }],
    rating: 4.8, reviewCount: 96, sizes: [],
  },
  {
    id: "p_heart_earrings", slug: "aria-blue-crystal-heart-drop-earrings", name: "Aria Blue Crystal Heart Drop Earrings",
    description: "Faceted heart-cut blue crystals suspended from gold-plated ear wires. A pop of sapphire-blue colour that catches the light — feather-light for all-day wear and a much-loved gift.",
    imageUrl: heartDropEarringsImg.src,
    priceInPaise: 9900, mrpInPaise: 14900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_earrings", brandId: "b_signature", collectionLine: "Gifts", gender: "Women",
    metal: "Gold-Plated Silver", purity: "925", grossWeightG: 3.4,
    gemstones: [{ type: "Blue Crystal", caratWeight: 2.0, cut: "Heart", count: 2 }],
    certifications: [{ body: "HALLMARK" }],
    rating: 4.6, reviewCount: 74, sizes: [],
  },
  // ── Bracelets ─────────────────────────────────────────────────────────────
  {
    id: "p_tennis_bracelet", slug: "aria-diamond-tennis-bracelet", name: "Aria Diamond Tennis Bracelet",
    description: "A flexible line of prong-set round diamonds in 18K white gold, finished with a double-lock clasp for security. Timeless sparkle for the wrist.",
    priceInPaise: 25900, mrpInPaise: 29900, currency: "INR", inStock: true, color: "White Gold",
    categoryId: "c_bracelets", brandId: "b_signature", collectionLine: "Riviera", gender: "Women",
    metal: "18K White Gold", purity: "18K", grossWeightG: 9.8,
    gemstones: [{ type: "Diamond", caratWeight: 3.0, cut: "Round", count: 34 }],
    certifications: [{ body: "IGI" }, { body: "BIS" }],
    rating: 4.8, reviewCount: 41, sizes: ["6.5in","7in","7.5in"],
  },
  {
    id: "p_gold_bracelet", slug: "nova-gold-chain-bracelet", name: "Nova 18K Gold Chain Bracelet",
    description: "A sleek flat-curb chain bracelet in 18K gold with an adjustable slider clasp. Understated everyday luxury that stacks with a watch.",
    priceInPaise: 17900, mrpInPaise: 22900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_bracelets", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Unisex",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 6.2,
    certifications: [{ body: "BIS" }],
    rating: 4.7, reviewCount: 187, sizes: ["Adjustable"],
  },
  // ── Bangles ───────────────────────────────────────────────────────────────
  {
    id: "p_gold_kada", slug: "veer-mens-gold-kada", name: "Veer Men's 22K Gold Kada",
    description: "A bold, hand-finished 22K gold kada with a brushed-and-polished contrast finish and a secure screw closure. A modern heirloom for him.",
    priceInPaise: 24900, mrpInPaise: 29900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_bangles", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Men",
    metal: "22K Yellow Gold", purity: "22K", grossWeightG: 23.5,
    certifications: [{ body: "BIS" }],
    rating: 4.7, reviewCount: 54, sizes: ["2.4","2.6","2.8"],
  },
  {
    id: "p_diamond_bangle", slug: "grace-diamond-bangle", name: "Grace Diamond Bangle",
    description: "A slim openable bangle in 18K rose gold with a pavé-set diamond crescent. Elegant enough for the boardroom, delicate enough for every day.",
    priceInPaise: 22900, mrpInPaise: 27900, currency: "INR", inStock: true, color: "Rose Gold",
    categoryId: "c_bangles", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Women",
    metal: "18K Rose Gold", purity: "18K", grossWeightG: 11.0,
    gemstones: [{ type: "Diamond", caratWeight: 0.6, cut: "Round", count: 24 }],
    certifications: [{ body: "BIS" }],
    rating: 4.6, reviewCount: 63, sizes: ["2.4","2.6","2.8"],
  },
  {
    id: "p_ruby_bangle", slug: "kusum-ruby-diamond-bangle", name: "Kusum Ruby & Diamond Bangle",
    description: "A slim, flexible 18K gold bangle centred on a ruby flower cluster edged with pavé diamonds. Delicate enough for daily wear, special enough for occasions.",
    imageUrl: rubyBangleImg.src,
    priceInPaise: 21900, mrpInPaise: 26900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_bangles", brandId: "b_signature", collectionLine: "Gemstone", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 8.5,
    gemstones: [{ type: "Ruby", caratWeight: 0.8, cut: "Pear", count: 4 }, { type: "Diamond", caratWeight: 0.3, cut: "Round", count: 20 }],
    certifications: [{ body: "SGL" }, { body: "BIS" }],
    rating: 4.7, reviewCount: 39, sizes: ["2.4","2.6","2.8"],
  },
  // ── Pendants ──────────────────────────────────────────────────────────────
  {
    id: "p_solitaire_pendant", slug: "lumen-solitaire-diamond-pendant", name: "Lumen Solitaire Diamond Pendant",
    description: "A single certified diamond suspended in a four-prong 18K white gold setting on a fine cable chain. The everyday diamond that goes with everything.",
    priceInPaise: 14900, mrpInPaise: 19900, currency: "INR", inStock: true, color: "White Gold",
    categoryId: "c_pendants", brandId: "b_signature", collectionLine: "Solitaire", gender: "Women",
    metal: "18K White Gold", purity: "18K", grossWeightG: 2.0,
    gemstones: [{ type: "Diamond", caratWeight: 0.4, cut: "Round", clarity: "VS1", count: 1 }],
    certifications: [{ body: "IGI" }, { body: "BIS" }],
    rating: 4.8, reviewCount: 229, sizes: ["16in","18in"],
  },
  {
    id: "p_initial_pendant", slug: "muse-gold-initial-pendant", name: "Muse 18K Gold Initial Pendant",
    description: "A dainty script-initial pendant in 18K gold on an adjustable chain. A personal everyday piece and a much-loved gift.",
    priceInPaise: 9900, mrpInPaise: 14900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_pendants", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 1.6,
    certifications: [{ body: "BIS" }],
    rating: 4.5, reviewCount: 412, sizes: ["16in","18in"],
  },
  // ── Mangalsutra ───────────────────────────────────────────────────────────
  {
    id: "p_mangalsutra", slug: "saubhagya-diamond-mangalsutra", name: "Saubhagya Diamond Mangalsutra",
    description: "A contemporary mangalsutra with a diamond-set pendant in 18K gold on a traditional black-bead chain. Sacred symbolism, everyday elegance.",
    imageUrl: mangalsutraImg.src,
    priceInPaise: 19900, mrpInPaise: 24900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_mangalsutra", brandId: "b_bridal", collectionLine: "Bridal Heritage", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 7.4,
    gemstones: [{ type: "Diamond", caratWeight: 0.35, cut: "Round", count: 14 }],
    certifications: [{ body: "BIS" }],
    rating: 4.7, reviewCount: 138, sizes: ["18in","20in"],
  },
  {
    id: "p_mangalsutra_leaf", slug: "vallari-leaf-heart-mangalsutra", name: "Vallari Leaf & Heart Mangalsutra",
    description: "A delicate mangalsutra with a pavé leaf-vine motif in 18K gold, finished with a polished heart charm, on a traditional black-bead chain. Light enough for everyday wear — office to festive.",
    imageUrl: mangalsutraLeafImg.src,
    priceInPaise: 14900, mrpInPaise: 19900, currency: "INR", inStock: true, color: "Yellow Gold",
    categoryId: "c_mangalsutra", brandId: "b_signature", collectionLine: "Everyday Gold", gender: "Women",
    metal: "18K Yellow Gold", purity: "18K", grossWeightG: 5.2,
    gemstones: [{ type: "Diamond", caratWeight: 0.25, cut: "Marquise", count: 12 }],
    certifications: [{ body: "BIS" }],
    rating: 4.6, reviewCount: 58, sizes: ["18in","20in"],
  },
  // ── Gifts ─────────────────────────────────────────────────────────────────
  {
    id: "p_silver_studs", slug: "petite-silver-cz-studs", name: "Petite Sterling Silver CZ Studs",
    description: "Sparkling cubic-zirconia studs in rhodium-plated 925 sterling silver. A perfect first-jewellery gift, hypoallergenic and tarnish-resistant.",
    priceInPaise: 9900, mrpInPaise: 14900, currency: "INR", inStock: true, color: "Silver",
    categoryId: "c_gifts", brandId: "b_signature", collectionLine: "Gifts", gender: "Women",
    metal: "Sterling Silver", purity: "925", grossWeightG: 1.8,
    certifications: [{ body: "HALLMARK" }],
    rating: 4.4, reviewCount: 526, sizes: [],
  },
  {
    id: "p_silver_pendant", slug: "aria-silver-heart-pendant", name: "Aria Silver Heart Pendant",
    description: "A polished heart pendant in 925 sterling silver on a delicate box chain, presented in a signature gift box. Thoughtful and timeless.",
    priceInPaise: 12900, mrpInPaise: 17900, currency: "INR", inStock: true, color: "Silver",
    categoryId: "c_gifts", brandId: "b_signature", collectionLine: "Gifts", gender: "Women",
    metal: "Sterling Silver", purity: "925", grossWeightG: 3.2,
    certifications: [{ body: "HALLMARK" }],
    rating: 4.5, reviewCount: 318, sizes: ["16in","18in"],
  },
];

// Attach a resolved image (keyword-matched Unsplash) where none is set.
export const products: Product[] = _products.map((p) => ({
  ...p,
  imageUrl: p.imageUrl ?? getProductImageUrl(p.name),
}));

export const reviews: Review[] = [
  { id: "r1", productId: "p_solitaire_pt", rating: 5, author: "Ananya", body: "The brilliance is unreal. IGI certificate arrived in the box — exactly as described. My forever ring." },
  { id: "r2", productId: "p_solitaire_pt", rating: 5, author: "Karthik", body: "Proposed with this. Craftsmanship is flawless and the platinum feels substantial." },
  { id: "r3", productId: "p_solitaire_studs", rating: 5, author: "Meera", body: "Wear them every single day. Perfectly matched pair and the screw backs are so secure." },
  { id: "r4", productId: "p_solitaire_studs", rating: 4, author: "Rhea", body: "Beautiful sparkle. Slightly smaller than I imagined but the quality is excellent." },
  { id: "r5", productId: "p_gold_chain", rating: 5, author: "Vikram", body: "Proper 22K, hallmarked, and the weight is exactly as listed. Layers perfectly." },
  { id: "r6", productId: "p_gold_hoops", rating: 5, author: "Sana", body: "My new everyday hoops. Lightweight, don't irritate my ears, and look far more expensive than they are." },
  { id: "r7", productId: "p_bridal_necklace", rating: 5, author: "Divya", body: "Wore it for my wedding — the polki work is stunning in person. Heirloom quality." },
  { id: "r8", productId: "p_initial_pendant", rating: 4, author: "Nikhil", body: "Gifted the 'A' pendant to my wife. Dainty and elegant, arrived in a lovely box." },
];

export const collections: Collection[] = [
  {
    id: "col_engagement", slug: "best-diamond-engagement-rings", title: "Best Diamond Engagement Rings (2026)",
    intro: "Our edit of the finest diamond engagement rings you can buy in India right now — from a classic platinum solitaire to a modern halo in 18K gold. Every ring is set with an IGI or GIA-certified diamond and BIS-hallmarked, with lifetime exchange and a 30-day return. Chosen for cut brilliance and craftsmanship, not just carat.",
    filter: { categorySlug: "engagement-rings" },
  },
  {
    id: "col_everyday_gold", slug: "everyday-gold-under-200", title: "Everyday Gold Under ₹200",
    intro: "Light, everyday jewellery you can actually wear daily — hoops, chains, bracelets and pendants, all under ₹200. We pulled every in-stock everyday piece below that price so you can compare designs, finishes and price at a glance. All with a transparent price breakup and 30-day returns.",
    filter: { maxPriceInPaise: 20000 },
  },
  {
    id: "col_white_gold", slug: "best-white-gold-diamond-jewellery", title: "Best White Gold Diamond Jewellery",
    intro: "White gold and diamonds are the most versatile pairing in fine jewellery. Here is every in-stock white-gold diamond piece in the Aurelia collection — studs, pendants, tennis bracelets and necklaces — so you can build a matching set. Each is IGI-certified and BIS-hallmarked.",
    filter: { color: "White Gold" },
  },
  {
    id: "col_thin", slug: "best-emerald-jewellery-under-300", title: "Best Emerald Jewellery Under ₹300",
    // Deliberately thin (out-of-stock / sparse) to demonstrate the indexability guard.
    filter: { color: "Emerald", maxPriceInPaise: 30000 },
  },
];

// ── Query helpers ──────────────────────────────────────────────────────────

export function getTopCategories(): Category[] {
  return categories.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name));
}

export interface CategoryWithRelations extends Category {
  parent?: Category;
  children: Category[];
}

export function getCategoryBySlug(slug: string): CategoryWithRelations | undefined {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return undefined;
  return {
    ...cat,
    parent: cat.parentId ? categories.find((c) => c.id === cat.parentId) : undefined,
    children: categories.filter((c) => c.parentId === cat.id),
  };
}

export function getProductsByCategoryId(
  categoryId: string,
  opts?: { maxPriceInPaise?: number; color?: string; sort?: string }
): Product[] {
  let list = products.filter((p) => p.categoryId === categoryId && p.inStock);
  if (opts?.color) list = list.filter((p) => p.color?.toLowerCase() === opts.color!.toLowerCase());
  if (opts?.maxPriceInPaise) list = list.filter((p) => p.priceInPaise <= opts.maxPriceInPaise!);
  if (opts?.sort === "price_desc") return list.sort((a, b) => b.priceInPaise - a.priceInPaise);
  if (opts?.sort === "rating") return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return list.sort((a, b) => a.priceInPaise - b.priceInPaise);
}

export interface ProductWithRelations extends Product {
  category: Category;
  brand?: Brand;
  reviews: Review[];
}

export function getProductBySlug(slug: string): ProductWithRelations | undefined {
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  const category = categories.find((c) => c.id === product.categoryId)!;
  return {
    ...product,
    category,
    brand: product.brandId ? brands.find((b) => b.id === product.brandId) : undefined,
    reviews: reviews.filter((r) => r.productId === product.id),
  };
}

export function getRelatedProducts(productId: string, categoryId: string, limit = 4): Product[] {
  return products.filter((p) => p.categoryId === categoryId && p.id !== productId && p.inStock).slice(0, limit);
}

export function getCollections(limit?: number): Collection[] {
  return typeof limit === "number" ? collections.slice(0, limit) : collections;
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function findProductsByFilter(filter: CollectionFilter): Product[] {
  const categoryId = filter.categorySlug ? categories.find((c) => c.slug === filter.categorySlug)?.id : undefined;
  const brandId = filter.brandSlug ? brands.find((b) => b.slug === filter.brandSlug)?.id : undefined;
  return products
    .filter((p) => {
      if (!p.inStock) return false;
      if (filter.categorySlug && p.categoryId !== categoryId) return false;
      if (filter.brandSlug && p.brandId !== brandId) return false;
      if (filter.color && p.color?.toLowerCase() !== filter.color.toLowerCase()) return false;
      if (typeof filter.maxPriceInPaise === "number" && p.priceInPaise > filter.maxPriceInPaise) return false;
      return true;
    })
    .sort((a, b) => a.priceInPaise - b.priceInPaise);
}

export function getInStockProducts(): Product[] {
  return products.filter((p) => p.inStock);
}

export function searchProducts(q: string): Product[] {
  const query = q.toLowerCase().trim();
  if (!query) return [];
  return products.filter(
    (p) =>
      p.inStock &&
      (p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.color?.toLowerCase().includes(query) ||
        p.metal?.toLowerCase().includes(query) ||
        p.gemstones?.some((g) => g.type.toLowerCase().includes(query)) ||
        categories.find((c) => c.id === p.categoryId)?.name.toLowerCase().includes(query))
  );
}
