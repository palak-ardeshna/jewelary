import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { ProductForm, type ProductFormDefaults } from "../ProductForm";

export const dynamic = "force-dynamic";

// DB stores lists/objects as JSON strings; convert to the form's display shape.
function csv(json: string | null): string {
  if (!json) return "";
  try { const arr = JSON.parse(json); return Array.isArray(arr) ? arr.join(", ") : ""; } catch { return ""; }
}
const s = (v: number | null | undefined) => (v == null ? "" : String(v));

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  const defaults: ProductFormDefaults = {
    id: product.id, name: product.name, slug: product.slug, description: product.description,
    priceInPaise: s(product.priceInPaise), mrpInPaise: s(product.mrpInPaise), currency: product.currency,
    inStock: product.inStock, stockUnits: s(product.stockUnits), color: product.color ?? "", imageUrl: product.imageUrl ?? "",
    categoryId: product.categoryId, brandId: product.brandId ?? "", rating: s(product.rating), reviewCount: s(product.reviewCount),
    metal: product.metal ?? "", purity: product.purity ?? "", grossWeightG: s(product.grossWeightG),
    collectionLine: product.collectionLine ?? "", gender: product.gender ?? "", status: product.status,
    sizes: csv(product.sizes), tags: csv(product.tags),
    gemstones: product.gemstones ?? "", certifications: product.certifications ?? "",
  };

  return (
    <div>
      <Link href="/admin/products" style={{ color: "#78716c", textDecoration: "none", fontSize: "0.85rem" }}>← Products</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0 1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem" }}>Edit product</h1>
        <Link href={`/products/${product.slug}`} target="_blank" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.85rem" }}>View on store ↗</Link>
      </div>
      <ProductForm defaults={defaults} categories={categories} brands={brands} />
    </div>
  );
}
