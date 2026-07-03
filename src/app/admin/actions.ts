"use server";
// Admin mutations. Every action re-checks the session (requireAdmin), writes via
// Prisma, revalidates the affected storefront paths so the dynamic pages reflect
// the change immediately, then redirects back to the relevant list.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { requireAdmin, logout } from "@/server/auth";
import { AD_SLOTS, saveAdsConfig, type AdSlotName, type AdSlotConfig } from "@/server/ads";

// ── helpers ──────────────────────────────────────────────────────────────────
function str(fd: FormData, key: string): string { return (fd.get(key) as string | null)?.trim() ?? ""; }
function optStr(fd: FormData, key: string): string | null { const v = str(fd, key); return v === "" ? null : v; }
function optInt(fd: FormData, key: string): number | null { const v = str(fd, key); if (v === "") return null; const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
function optFloat(fd: FormData, key: string): number | null { const v = str(fd, key); if (v === "") return null; const n = parseFloat(v); return Number.isFinite(n) ? n : null; }
function bool(fd: FormData, key: string): boolean { return fd.get(key) === "on" || fd.get(key) === "true"; }
function slugify(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function csvToJson(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  if (!v) return null;
  return JSON.stringify(v.split(",").map((x) => x.trim()).filter(Boolean));
}
function jsonOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  if (!v) return null;
  try { JSON.parse(v); return v; } catch { return null; }
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/sitemap.xml");
}

// ── auth ─────────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ── ads ──────────────────────────────────────────────────────────────────────
export async function saveAds(fd: FormData) {
  await requireAdmin();
  const slots = {} as Record<AdSlotName, AdSlotConfig>;
  for (const { name } of AD_SLOTS) {
    slots[name] = { enabled: bool(fd, `slot_${name}_enabled`), code: str(fd, `slot_${name}_code`) };
  }
  await saveAdsConfig({ enabled: bool(fd, "enabled"), slots });
  revalidateStorefront();
  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

// ── products ─────────────────────────────────────────────────────────────────
export async function saveProduct(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const name = str(fd, "name");
  const slug = optStr(fd, "slug") ?? slugify(name);

  const data = {
    slug, name, description: str(fd, "description"),
    priceInPaise: optInt(fd, "priceInPaise") ?? 0,
    mrpInPaise: optInt(fd, "mrpInPaise"),
    currency: optStr(fd, "currency") ?? "INR",
    inStock: bool(fd, "inStock"),
    stockUnits: optInt(fd, "stockUnits"),
    color: optStr(fd, "color"),
    imageUrl: optStr(fd, "imageUrl"),
    categoryId: str(fd, "categoryId"),
    brandId: optStr(fd, "brandId"),
    rating: optFloat(fd, "rating"),
    reviewCount: optInt(fd, "reviewCount") ?? 0,
    sizes: csvToJson(fd, "sizes"),
    tags: csvToJson(fd, "tags"),
    gemstones: jsonOrNull(fd, "gemstones"),
    certifications: jsonOrNull(fd, "certifications"),
    metal: optStr(fd, "metal"),
    purity: optStr(fd, "purity"),
    grossWeightG: optFloat(fd, "grossWeightG"),
    collectionLine: optStr(fd, "collectionLine"),
    gender: optStr(fd, "gender"),
    status: optStr(fd, "status") ?? "ACTIVE",
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
    revalidatePath(`/products/${slug}`);
  } else {
    await prisma.product.create({ data });
  }
  revalidateStorefront();
  redirect("/admin/products");
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.review.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidateStorefront();
  redirect("/admin/products");
}

// ── categories ───────────────────────────────────────────────────────────────
export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const name = str(fd, "name");
  const data = {
    slug: optStr(fd, "slug") ?? slugify(name),
    name,
    description: optStr(fd, "description"),
    parentId: optStr(fd, "parentId"),
    position: optInt(fd, "position") ?? 0,
  };
  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });
  revalidateStorefront();
  redirect("/admin/categories");
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount === 0) {
    await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await prisma.category.delete({ where: { id } });
  }
  // (If products still reference it, we keep it — deleting would orphan them.)
  revalidateStorefront();
  redirect("/admin/categories");
}

// ── collections ──────────────────────────────────────────────────────────────
export async function saveCollection(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const title = str(fd, "title");
  const data = {
    slug: optStr(fd, "slug") ?? slugify(title),
    title,
    intro: optStr(fd, "intro"),
    filterCategorySlug: optStr(fd, "filterCategorySlug"),
    filterBrandSlug: optStr(fd, "filterBrandSlug"),
    filterColor: optStr(fd, "filterColor"),
    filterMaxPriceInPaise: optInt(fd, "filterMaxPriceInPaise"),
  };
  if (id) await prisma.collection.update({ where: { id }, data });
  else await prisma.collection.create({ data });
  revalidateStorefront();
  redirect("/admin/collections");
}

export async function deleteCollection(fd: FormData) {
  await requireAdmin();
  await prisma.collection.delete({ where: { id: str(fd, "id") } });
  revalidateStorefront();
  redirect("/admin/collections");
}
