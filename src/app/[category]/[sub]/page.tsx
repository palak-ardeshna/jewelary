import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { categories, getCategoryBySlug, getProductsByCategoryId } from "@/data/store";
import { absUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryProducts } from "@/components/CategoryProducts";
import { breadcrumbSchema, itemListSchema, type BreadcrumbItem } from "@/lib/schema-org";

export function generateStaticParams() {
  return categories
    .filter((c) => c.parentId) // Only sub-categories
    .map((c) => {
      const parent = categories.find((p) => p.id === c.parentId);
      return { category: parent!.slug, sub: c.slug };
    });
}

function resolveCategory(category: string, sub: string) {
  const leaf = getCategoryBySlug(sub);
  if (!leaf) return null;
  const parent = getCategoryBySlug(category);
  if (leaf.parentId !== parent?.id) return null;
  return leaf;
}

type Params = Promise<{ category: string; sub: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, sub } = await params;
  const cat = resolveCategory(category, sub);
  if (!cat) return {};
  const path = `/${category}/${sub}`;
  return { title: cat.name, description: cat.description ?? `Shop ${cat.name} at Aurelia.`, alternates: { canonical: absUrl(path) } };
}

export default async function SubCategoryPage({ params }: { params: Params }) {
  const { category, sub } = await params;

  const cat = resolveCategory(category, sub);
  if (!cat) notFound();

  const path = `/${category}/${sub}`;

  // Unfiltered list drives the page's ItemList schema
  const allProducts = getProductsByCategoryId(cat.id);

  const crumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: category.replace(/-/g, " "), path: `/${category}` },
    { name: sub.replace(/-/g, " "), path: path }
  ];

  return (
    <div className="animate-fade-up">
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(allProducts)]} />
      <Breadcrumbs items={crumbs} />

      <header style={{ marginBottom:"3rem", marginTop:"2rem", textAlign: "center" }}>
        <h1 className="t-display" style={{ fontSize:"3rem", marginBottom:"1rem" }}>{cat.name}</h1>
        {cat.description && <p style={{ color:"var(--fg-muted)", fontSize:"1rem", maxWidth: 600, margin: "0 auto" }}>{cat.description}</p>}
      </header>

      <Suspense fallback={null}>
        <CategoryProducts categoryId={cat.id} path={path} />
      </Suspense>
    </div>
  );
}
