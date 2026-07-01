import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SmartImage } from "@/components/SmartImage";
import { Icon } from "@/components/Icon";
import { getProductBySlug, getRelatedProducts, products } from "@/data/store";
import { absUrl, formatPrice } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { breadcrumbSchema, productSchema, type BreadcrumbItem } from "@/lib/schema-org";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: absUrl(`/products/${product.slug}`) },
  };
}

function StarRow({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  const full = Math.floor(rating);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
      <span style={{ color:"#f59e0b", fontSize:"1.1rem", letterSpacing:"-1px" }}>
        {"★".repeat(full)}{"☆".repeat(5 - full)}
      </span>
      <span style={{ fontWeight:700 }}>{rating.toFixed(1)}</span>
      {reviewCount && <span style={{ color:"var(--fg-muted)", fontSize:"0.875rem" }}>({reviewCount.toLocaleString("en-IN")} reviews)</span>}
    </div>
  );
}

function TrustBadges() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", padding:"1rem", background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
      {[["lock","Insured free shipping"],["exchange","Lifetime exchange"],["return","30-day returns"],["shield-check","Certified quality"]].map(([icon,label])=>(
        <div key={label} style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.8rem" }}>
          <Icon name={icon} size={16} style={{ color:"var(--accent-dark)" }} /><span style={{ color:"var(--fg-muted)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product.id, product.categoryId, 4);
  const discount = product.mrpInPaise ? Math.round((1 - product.priceInPaise / product.mrpInPaise) * 100) : 0;

  const crumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: product.category.name, path: `/${product.category.slug}` },
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <div className="animate-fade-up">
      <JsonLd data={[breadcrumbSchema(crumbs), productSchema({ name:product.name, slug:product.slug, description:product.description, priceInPaise:product.priceInPaise, currency:product.currency, inStock:product.inStock, imageUrl:product.imageUrl, brandName:product.brand?.name, reviews:product.reviews })]} />
      <Breadcrumbs items={crumbs} />

      <div style={{ display:"grid", gap:"2.5rem", gridTemplateColumns:"1fr", marginTop:"1.5rem" }} className="pdp-grid">
        {/* Image */}
        <div style={{ position:"relative", aspectRatio:"1/1", background:"var(--surface-2)", borderRadius:"var(--radius-lg)", overflow:"hidden" }}>
          {product.imageUrl ? (
            <SmartImage src={product.imageUrl} alt={product.name} fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:"cover" }} priority />
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--fg-subtle)" }}>No image</div>
          )}
          {discount >= 10 && (
            <span className="badge badge-red" style={{ position:"absolute", top:"1rem", left:"1rem", fontSize:"0.8rem" }}>{discount}% OFF</span>
          )}
        </div>

        {/* Details */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {product.brand && <span className="eyebrow">{product.brand.name}{product.collectionLine ? ` · ${product.collectionLine}` : ""}</span>}
          <h1 className="font-display" style={{ fontSize:"2.25rem", fontWeight:500, lineHeight:1.15 }}>{product.name}</h1>

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
              {product.certifications.map((c) => (
                <span key={c.body} className="badge" style={{ background:"var(--surface-2)", color:"var(--accent-dark)", border:"1px solid var(--border-strong)", gap:"0.3rem" }}>
                  <Icon name="shield-check" size={12} /> {c.body}{c.number ? ` · ${c.number}` : " Certified"}
                </span>
              ))}
            </div>
          )}

          {product.rating && <StarRow rating={product.rating} reviewCount={product.reviewCount} />}

          {/* Price */}
          <div style={{ display:"flex", alignItems:"baseline", gap:"0.75rem" }}>
            <span className="price-current">{formatPrice(product.priceInPaise, product.currency)}</span>
            {product.mrpInPaise && <span className="price-mrp">{formatPrice(product.mrpInPaise, product.currency)}</span>}
            {discount >= 10 && <span className="price-discount">You save {discount}%</span>}
          </div>

          {/* Stock */}
          <div>
            {product.inStock
              ? <span className="badge badge-green" style={{ gap:"0.3rem" }}><Icon name="check" size={12} /> In Stock — Ready to ship</span>
              : <span className="badge badge-red" style={{ gap:"0.3rem" }}><Icon name="x" size={12} /> Out of Stock</span>
            }
          </div>

          {/* Description */}
          <p style={{ color:"var(--fg-muted)", lineHeight:1.7 }}>{product.description}</p>

          {/* Jewellery specification */}
          {(product.metal || product.purity || product.grossWeightG || (product.gemstones && product.gemstones.length > 0)) && (
            <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden" }}>
              {([
                product.metal && ["Metal", product.metal],
                product.purity && ["Purity", product.purity],
                product.grossWeightG && ["Gross weight", `${product.grossWeightG.toFixed(1)} g`],
                product.gemstones && product.gemstones.length > 0 && [
                  "Gemstones",
                  product.gemstones
                    .map((g) => `${g.count && g.count > 1 ? `${g.count}× ` : ""}${g.type}${g.caratWeight ? ` (${g.caratWeight} ct${g.clarity ? `, ${g.clarity}` : ""})` : ""}`)
                    .join("; "),
                ],
                product.gender && ["Style", product.gender],
              ].filter(Boolean) as [string, string][]).map(([label, value], i) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:"1rem", padding:"0.6rem 0.9rem", fontSize:"0.85rem", background: i % 2 ? "var(--surface)" : "var(--bg)" }}>
                  <span style={{ color:"var(--fg-muted)" }}>{label}</span>
                  <span style={{ fontWeight:600, textAlign:"right" }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart with size selector */}
          <AddToCartButton product={{ id:product.id, slug:product.slug, name:product.name, priceInPaise:product.priceInPaise, currency:product.currency, imageUrl:product.imageUrl, inStock:product.inStock, sizes:product.sizes }} />

          {/* Trust badges */}
          <TrustBadges />
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section style={{ marginTop:"3rem" }}>
          <h2 style={{ fontSize:"1.25rem", fontWeight:700, marginBottom:"1rem" }}>Customer Reviews ({product.reviews.length})</h2>
          <div style={{ display:"grid", gap:"0.75rem" }}>
            {product.reviews.map((r) => (
              <div key={r.id} style={{ padding:"1rem", background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" }}>
                  <span style={{ color:"#f59e0b" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span style={{ fontWeight:600, fontSize:"0.9rem" }}>{r.author}</span>
                </div>
                <p style={{ color:"var(--fg-muted)", fontSize:"0.9rem", lineHeight:1.6 }}>{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section style={{ marginTop:"3rem" }}>
          <h2 style={{ fontSize:"1.25rem", fontWeight:700, marginBottom:"1rem" }}>You Might Also Like</h2>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <style>{`
        @media (min-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
