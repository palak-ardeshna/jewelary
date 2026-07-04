// ============================================================================
// Aurelia — REPOSITORY layer (now backed by Prisma/SQLite).
//
// Routes/components import only these query helpers, never Prisma directly —
// the same contract that used to front the in-memory arrays. All helpers are
// now async (they hit the database); consumers `await` them. The public TS
// interfaces below are unchanged, so every existing caller keeps its shape.
//
// SQLite has no arrays/Json, so list/object fields are stored as JSON strings
// and decoded here in `mapProduct`. Money stays integer paise.
// ============================================================================

import { prisma } from "@/server/db";
import type {
  Product as PProduct,
  Category as PCategory,
  Brand as PBrand,
  Review as PReview,
  Collection as PCollection,
} from "@prisma/client";

// Public types live in a client-safe module and are re-exported here so every
// existing `import type { Product } from "@/data/store"` keeps working.
import type {
  Brand, Category, Review, Gemstone, Certification, Product,
  CollectionFilter, Collection, CategoryWithRelations, ProductWithRelations,
} from "@/lib/catalog-types";
export type {
  Brand, Category, Review, Gemstone, Certification, Product,
  CollectionFilter, Collection, CategoryWithRelations, ProductWithRelations,
};

// ── Row → domain mappers ────────────────────────────────────────────────────
const undef = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

function parseJson<T>(v: string | null): T | undefined {
  if (!v) return undefined;
  try { return JSON.parse(v) as T; } catch { return undefined; }
}

function mapProduct(p: PProduct): Product {
  return {
    id: p.id, slug: p.slug, name: p.name, description: p.description,
    priceInPaise: p.priceInPaise, mrpInPaise: undef(p.mrpInPaise), currency: p.currency,
    inStock: p.inStock, stockUnits: undef(p.stockUnits), color: undef(p.color), imageUrl: undef(p.imageUrl),
    categoryId: p.categoryId, brandId: undef(p.brandId),
    rating: undef(p.rating), reviewCount: p.reviewCount,
    sizes: parseJson<string[]>(p.sizes),
    metal: undef(p.metal), purity: undef(p.purity), grossWeightG: undef(p.grossWeightG),
    gemstones: parseJson<Gemstone[]>(p.gemstones),
    certifications: parseJson<Certification[]>(p.certifications),
    collectionLine: undef(p.collectionLine), gender: undef(p.gender),
    tags: parseJson<string[]>(p.tags),
  };
}

function mapCategory(c: PCategory): Category {
  return { id: c.id, slug: c.slug, name: c.name, description: undef(c.description), parentId: undef(c.parentId), imageUrl: undef(c.imageUrl), featured: c.featured };
}
function mapBrand(b: PBrand): Brand { return { id: b.id, slug: b.slug, name: b.name }; }
function mapReview(r: PReview): Review { return { id: r.id, productId: r.productId, rating: r.rating, author: r.author, body: r.body }; }
function mapCollection(c: PCollection): Collection {
  return {
    id: c.id, slug: c.slug, title: c.title, intro: undef(c.intro),
    filter: {
      categorySlug: undef(c.filterCategorySlug),
      brandSlug: undef(c.filterBrandSlug),
      color: undef(c.filterColor),
      maxPriceInPaise: undef(c.filterMaxPriceInPaise),
    },
  };
}

// ── Categories ──────────────────────────────────────────────────────────────
export async function getAllCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapCategory);
}

export async function getTopCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" } });
  return rows.map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithRelations | undefined> {
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return undefined;
  const [parent, children] = await Promise.all([
    cat.parentId ? prisma.category.findUnique({ where: { id: cat.parentId } }) : Promise.resolve(null),
    prisma.category.findMany({ where: { parentId: cat.id }, orderBy: { name: "asc" } }),
  ]);
  return {
    ...mapCategory(cat),
    parent: parent ? mapCategory(parent) : undefined,
    children: children.map(mapCategory),
  };
}

// ── Products ────────────────────────────────────────────────────────────────
export async function getProductsByCategoryId(
  categoryId: string,
  opts?: { maxPriceInPaise?: number; color?: string; sort?: string },
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      categoryId, inStock: true,
      ...(opts?.maxPriceInPaise ? { priceInPaise: { lte: opts.maxPriceInPaise } } : {}),
    },
  });
  let list = rows.map(mapProduct);
  if (opts?.color) list = list.filter((p) => p.color?.toLowerCase() === opts.color!.toLowerCase());
  if (opts?.sort === "price_desc") return list.sort((a, b) => b.priceInPaise - a.priceInPaise);
  if (opts?.sort === "rating") return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return list.sort((a, b) => a.priceInPaise - b.priceInPaise);
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | undefined> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, brand: true, reviews: true },
  });
  if (!product) return undefined;
  return {
    ...mapProduct(product),
    category: mapCategory(product.category),
    brand: product.brand ? mapBrand(product.brand) : undefined,
    reviews: product.reviews.map(mapReview),
  };
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { categoryId, inStock: true, NOT: { id: productId } },
    take: limit,
  });
  return rows.map(mapProduct);
}

export async function getInStockProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { inStock: true } });
  return rows.map(mapProduct);
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  // tags stored as a JSON string; filter in JS (small catalog).
  const rows = await prisma.product.findMany({ where: { inStock: true } });
  return rows.map(mapProduct).filter((p) => p.tags?.includes(tag));
}

export async function searchProducts(q: string): Promise<Product[]> {
  const query = q.toLowerCase().trim();
  if (!query) return [];
  const rows = await prisma.product.findMany({ where: { inStock: true }, include: { category: true } });
  return rows
    .filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.color?.toLowerCase().includes(query) ||
      p.metal?.toLowerCase().includes(query) ||
      (p.gemstones ? p.gemstones.toLowerCase().includes(query) : false) ||
      p.category.name.toLowerCase().includes(query),
    )
    .map(mapProduct);
}

// ── Reviews ─────────────────────────────────────────────────────────────────
export async function getRecentReviews(limit = 8): Promise<Review[]> {
  const rows = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map(mapReview);
}

// ── Collections ─────────────────────────────────────────────────────────────
export async function getCollections(limit?: number): Promise<Collection[]> {
  const rows = await prisma.collection.findMany({
    orderBy: { position: "asc" },
    ...(typeof limit === "number" ? { take: limit } : {}),
  });
  return rows.map(mapCollection);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const row = await prisma.collection.findUnique({ where: { slug } });
  return row ? mapCollection(row) : undefined;
}

export async function findProductsByFilter(filter: CollectionFilter): Promise<Product[]> {
  const [category, brand] = await Promise.all([
    filter.categorySlug ? prisma.category.findUnique({ where: { slug: filter.categorySlug } }) : Promise.resolve(null),
    filter.brandSlug ? prisma.brand.findUnique({ where: { slug: filter.brandSlug } }) : Promise.resolve(null),
  ]);
  // A slug filter that matches nothing must yield no products (not "all").
  if (filter.categorySlug && !category) return [];
  if (filter.brandSlug && !brand) return [];

  const rows = await prisma.product.findMany({
    where: {
      inStock: true,
      ...(category ? { categoryId: category.id } : {}),
      ...(brand ? { brandId: brand.id } : {}),
      ...(typeof filter.maxPriceInPaise === "number" ? { priceInPaise: { lte: filter.maxPriceInPaise } } : {}),
    },
  });
  let list = rows.map(mapProduct);
  if (filter.color) list = list.filter((p) => p.color?.toLowerCase() === filter.color!.toLowerCase());
  return list.sort((a, b) => a.priceInPaise - b.priceInPaise);
}
