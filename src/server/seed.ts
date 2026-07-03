// Idempotent database seeding. Runs once on server start (instrumentation.ts):
// if the catalog is empty it loads src/server/seed-data.ts into the DB, and it
// always ensures an AdminUser exists from ADMIN_USERNAME / ADMIN_PASSWORD.
import { prisma } from "./db";
import { hashPassword } from "./auth";
import {
  seedBrands,
  seedCategories,
  seedProducts,
  seedReviews,
  seedCollections,
} from "./seed-data";

let seedPromise: Promise<void> | null = null;

/** Run seeding at most once per process; safe to call from many entry points. */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) seedPromise = doSeed();
  return seedPromise;
}

async function doSeed(): Promise<void> {
  await ensureAdminUser();

  const count = await prisma.product.count();
  if (count > 0) return; // catalog already seeded

  // Brands
  await prisma.brand.createMany({
    data: seedBrands.map((b) => ({ id: b.id, slug: b.slug, name: b.name })),
  });

  // Categories — parents before children (FK: parentId → Category.id)
  const parents = seedCategories.filter((c) => !c.parentId);
  const children = seedCategories.filter((c) => c.parentId);
  for (const group of [parents, children]) {
    await prisma.category.createMany({
      data: group.map((c) => ({
        id: c.id, slug: c.slug, name: c.name,
        description: c.description ?? null, parentId: c.parentId ?? null,
        position: c.position ?? 0,
      })),
    });
  }

  // Products (JSON-encode list/object fields for SQLite)
  await prisma.product.createMany({
    data: seedProducts.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, description: p.description,
      priceInPaise: p.priceInPaise, mrpInPaise: p.mrpInPaise ?? null,
      currency: p.currency, inStock: p.inStock, stockUnits: p.stockUnits ?? null,
      color: p.color ?? null, imageUrl: p.imageUrl ?? null,
      categoryId: p.categoryId, brandId: p.brandId ?? null,
      rating: p.rating ?? null, reviewCount: p.reviewCount ?? 0,
      sizes: p.sizes ? JSON.stringify(p.sizes) : null,
      gemstones: p.gemstones ? JSON.stringify(p.gemstones) : null,
      certifications: p.certifications ? JSON.stringify(p.certifications) : null,
      tags: p.tags ? JSON.stringify(p.tags) : null,
      metal: p.metal ?? null, purity: p.purity ?? null,
      grossWeightG: p.grossWeightG ?? null,
      collectionLine: p.collectionLine ?? null, gender: p.gender ?? null,
      status: p.inStock ? "ACTIVE" : "ACTIVE",
    })),
  });

  // Reviews
  await prisma.review.createMany({
    data: seedReviews.map((r) => ({
      id: r.id, productId: r.productId, rating: r.rating, author: r.author, body: r.body,
    })),
  });

  // Collections (flatten the filter)
  await prisma.collection.createMany({
    data: seedCollections.map((c, i) => ({
      id: c.id, slug: c.slug, title: c.title, intro: c.intro ?? null,
      filterCategorySlug: c.filter.categorySlug ?? null,
      filterBrandSlug: c.filter.brandSlug ?? null,
      filterColor: c.filter.color ?? null,
      filterMaxPriceInPaise: c.filter.maxPriceInPaise ?? null,
      position: i,
    })),
  });

  // eslint-disable-next-line no-console
  console.log(`[seed] Loaded ${seedProducts.length} products, ${seedCategories.length} categories, ${seedCollections.length} collections.`);
}

async function ensureAdminUser(): Promise<void> {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "aurelia2026";
  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) return;
  await prisma.adminUser.create({
    data: { username, passwordHash: hashPassword(password) },
  });
  // eslint-disable-next-line no-console
  console.log(`[seed] Created admin user "${username}".`);
}
