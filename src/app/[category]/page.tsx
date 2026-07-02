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
    .filter((c) => !c.parentId) // Only top-level categories
    .map((c) => ({ category: c.slug }));
}

function resolveCategory(category: string) {
  const leaf = getCategoryBySlug(category);
  if (!leaf || leaf.parentId) return null;
  return leaf;
}

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const cat = resolveCategory(category);
  if (!cat) return {};
  const path = `/${category}`;
  return { title: cat.name, description: cat.description ?? `Shop ${cat.name} at Aurelia.`, alternates: { canonical: absUrl(path) } };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;

  const cat = resolveCategory(category);
  if (!cat) notFound();

  const path = `/${category}`;

  // Unfiltered list drives the page's ItemList schema — the canonical
  // (filterless) view is what we want indexed.
  const allProducts = getProductsByCategoryId(cat.id);

  const crumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: category.replace(/-/g, " "), path: `/${category}` }
  ];

  // We need to fetch children dynamically if `cat.children` is not natively available
  // wait, the old code had `cat.children`. Let's assume it exists or was a typo for `categories.filter(c => c.parentId === cat.id)`.
  const children = categories.filter(c => c.parentId === cat.id);

  return (
    <div className="animate-fade-up">
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(allProducts)]} />
      <Breadcrumbs items={crumbs} />

      <header style={{ marginBottom:"3rem", marginTop:"2rem", textAlign: "center" }}>
        <h1 className="t-display" style={{ fontSize:"3rem", marginBottom:"1rem" }}>{cat.name}</h1>
        {cat.description && <p style={{ color:"var(--fg-muted)", fontSize:"1rem", maxWidth: 600, margin: "0 auto" }}>{cat.description}</p>}
      </header>

      {/* Subcategory pills */}
      {children.length > 0 && (
        <nav style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginBottom:"3rem", justifyContent: "center" }}>
          {children.map((child) => (
            <Link key={child.id} href={`${path}/${child.slug}`} className="btn-outline" style={{
              padding:"0.6rem 1.5rem", fontSize:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase"
            }}>{child.name}</Link>
          ))}
        </nav>
      )}

      <Suspense fallback={null}>
        <CategoryProducts categoryId={cat.id} path={path} />
      </Suspense>
    </div>
  );
}
