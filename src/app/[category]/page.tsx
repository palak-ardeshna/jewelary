import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryBySlug, getProductsByCategoryId } from "@/data/store";
import { absUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryProducts } from "@/components/CategoryProducts";
import { breadcrumbSchema, itemListSchema, type BreadcrumbItem } from "@/lib/schema-org";

export const dynamic = "force-dynamic";

async function resolveCategory(category: string) {
  const leaf = await getCategoryBySlug(category);
  if (!leaf || leaf.parentId) return null;
  return leaf;
}

type Params = Promise<{ category: string }>;
type Search = Promise<{ color?: string; maxPrice?: string; sort?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const cat = await resolveCategory(category);
  if (!cat) return {};
  const path = `/${category}`;
  return { title: cat.name, description: cat.description ?? `Shop ${cat.name} at Aurelia.`, alternates: { canonical: absUrl(path) } };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { category } = await params;
  const { color, maxPrice, sort } = await searchParams;

  const cat = await resolveCategory(category);
  if (!cat) notFound();

  const path = `/${category}`;

  // Unfiltered list drives the page's ItemList schema — the canonical
  // (filterless) view is what we want indexed.
  const allProducts = await getProductsByCategoryId(cat.id);

  // Filtered list (server-side now — replaces the old client-only filtering).
  const filtered = await getProductsByCategoryId(cat.id, {
    color: color || undefined,
    maxPriceInPaise: maxPrice ? parseInt(maxPrice) * 100 : undefined,
    sort,
  });

  const crumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: category.replace(/-/g, " "), path: `/${category}` }
  ];

  const children = cat.children;

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

      <CategoryProducts products={filtered} path={path} color={color} maxPrice={maxPrice} sort={sort} />
    </div>
  );
}
