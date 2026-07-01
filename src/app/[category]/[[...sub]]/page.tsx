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
  return categories.map((c) => {
    const parent = c.parentId ? categories.find((p) => p.id === c.parentId) : undefined;
    return parent ? { category: parent.slug, sub: [c.slug] } : { category: c.slug, sub: [] };
  });
}

function resolveCategory(category: string, sub?: string[]) {
  const segments = [category, ...(sub ?? [])];
  const leafSlug = segments[segments.length - 1];
  const leaf = getCategoryBySlug(leafSlug);
  if (!leaf) return null;
  if (segments.length > 1) {
    const expectedParent = segments[segments.length - 2];
    if (leaf.parent?.slug !== expectedParent) return null;
  } else if (leaf.parentId) return null;
  return leaf;
}

type Params = Promise<{ category: string; sub?: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, sub } = await params;
  const cat = resolveCategory(category, sub);
  if (!cat) return {};
  const path = `/${[category, ...(sub ?? [])].join("/")}`;
  return { title: cat.name, description: cat.description ?? `Shop ${cat.name} at Aurelia.`, alternates: { canonical: absUrl(path) } };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category, sub } = await params;

  const cat = resolveCategory(category, sub);
  if (!cat) notFound();

  const segments = [category, ...(sub ?? [])];
  const path = `/${segments.join("/")}`;

  // Unfiltered list drives the page's ItemList schema — the canonical
  // (filterless) view is what we want indexed.
  const allProducts = getProductsByCategoryId(cat.id);

  const crumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    ...segments.map((seg, i) => ({ name: seg.replace(/-/g, " "), path: `/${segments.slice(0, i + 1).join("/")}` })),
  ];

  return (
    <div className="animate-fade-up">
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(allProducts)]} />
      <Breadcrumbs items={crumbs} />

      <header style={{ marginBottom:"1.5rem", marginTop:"0.75rem" }}>
        <h1 style={{ fontSize:"1.75rem", fontWeight:800, letterSpacing:"-0.02em" }}>{cat.name}</h1>
        {cat.description && <p style={{ marginTop:"0.5rem", color:"var(--fg-muted)", fontSize:"0.9rem" }}>{cat.description}</p>}
      </header>

      {/* Subcategory pills */}
      {cat.children.length > 0 && (
        <nav style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"1.5rem" }}>
          {cat.children.map((child) => (
            <Link key={child.id} href={`${path}/${child.slug}`} style={{
              padding:"0.4rem 1rem", borderRadius:99, fontSize:"0.875rem", fontWeight:600,
              background:"var(--primary)", color:"#fff", textDecoration:"none",
              boxShadow:"0 1px 3px rgb(79 70 229 / 0.3)",
            }}>{child.name} →</Link>
          ))}
        </nav>
      )}

      <Suspense fallback={null}>
        <CategoryProducts categoryId={cat.id} path={path} />
      </Suspense>
    </div>
  );
}
