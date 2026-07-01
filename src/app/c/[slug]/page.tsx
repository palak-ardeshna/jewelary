import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absUrl } from "@/lib/site";
import { collections } from "@/data/store";
import { resolveCollection } from "@/lib/collections";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { breadcrumbSchema, itemListSchema, type BreadcrumbItem } from "@/lib/schema-org";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = resolveCollection(slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.intro?.slice(0, 160) ?? `${collection.title} at Aurelia.`,
    alternates: { canonical: absUrl(`/c/${slug}`) },
    robots: collection.indexable ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = resolveCollection(slug);
  if (!collection) notFound();

  const crumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: collection.title, path: `/c/${slug}` },
  ];

  return (
    <div className="animate-fade-up">
      <JsonLd data={collection.indexable ? [breadcrumbSchema(crumbs), itemListSchema(collection.products)] : [breadcrumbSchema(crumbs)]} />
      <Breadcrumbs items={crumbs} />

      <header style={{ marginBottom:"1.5rem", marginTop:"0.75rem" }}>
        <h1 style={{ fontSize:"1.75rem", fontWeight:800, letterSpacing:"-0.02em" }}>{collection.title}</h1>
        {collection.intro && <p style={{ marginTop:"0.5rem", maxWidth:"65ch", color:"var(--fg-muted)", lineHeight:1.7 }}>{collection.intro}</p>}
      </header>

      {/* Dev-only: only show noindex banner in development */}
      {!collection.indexable && process.env.NODE_ENV === "development" && (
        <div style={{ padding:"0.75rem 1rem", marginBottom:"1.5rem", borderRadius:"var(--radius)", border:"1px solid #fcd34d", background:"#fffbeb", color:"#92400e", fontSize:"0.8rem" }}>
          <strong>⚠ Dev only:</strong> noindex — {collection.noindexReasons.join(", ")}
        </div>
      )}

      <p style={{ fontSize:"0.875rem", color:"var(--fg-muted)", marginBottom:"1rem" }}>
        {collection.products.length} product{collection.products.length !== 1 ? "s" : ""}
      </p>

      {collection.products.length === 0 ? (
        <p style={{ color:"var(--fg-muted)", padding:"2rem 0" }}>No matching products right now.</p>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
          {collection.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
