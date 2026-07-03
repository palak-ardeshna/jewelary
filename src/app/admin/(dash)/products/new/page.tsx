import Link from "next/link";
import { prisma } from "@/server/db";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Link href="/admin/products" style={{ color: "#78716c", textDecoration: "none", fontSize: "0.85rem" }}>← Products</Link>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", margin: "0.5rem 0 1.5rem" }}>New product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
