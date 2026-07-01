import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/site";

export interface ProductCardData {
  slug: string; name: string; priceInPaise: number; mrpInPaise?: number;
  currency: string; color?: string | null; imageUrl?: string | null;
  rating?: number | null; reviewCount?: number | null; inStock?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
      <span className="stars" style={{ fontSize:"0.75rem" }}>
        {"★".repeat(full)}{half ? "⭑" : ""}{"☆".repeat(5 - full - (half?1:0))}
      </span>
      <span style={{ fontSize:"0.7rem", color:"var(--fg-muted)" }}>({rating.toFixed(1)})</span>
    </span>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = product.mrpInPaise
    ? Math.round((1 - product.priceInPaise / product.mrpInPaise) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration:"none", color:"inherit", display:"block" }}>
      <div className="card" style={{ overflow:"hidden", height:"100%" }}>
        {/* Image */}
        <div style={{ position:"relative", aspectRatio:"1/1", background:"var(--surface-2)", overflow:"hidden" }}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl} alt={product.name}
              fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              style={{ objectFit:"cover", transition:"transform 0.3s ease" }}
              className="product-img"
            />
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--fg-subtle)", fontSize:"0.8rem" }}>No image</div>
          )}
          {/* Badges */}
          {discount >= 10 && (
            <span className="badge badge-red" style={{ position:"absolute", top:"0.5rem", left:"0.5rem", fontSize:"0.65rem" }}>
              {discount}% OFF
            </span>
          )}
          {product.inStock === false && (
            <div style={{ position:"absolute", inset:0, background:"rgb(0 0 0 / 0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ background:"#fff", color:"var(--fg)", padding:"0.25rem 0.75rem", borderRadius:99, fontSize:"0.75rem", fontWeight:700 }}>Out of stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding:"0.75rem" }}>
          <p style={{ fontWeight:600, fontSize:"0.9rem", lineHeight:1.3, marginBottom:"0.25rem", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {product.name}
          </p>
          {product.color && <p style={{ fontSize:"0.75rem", color:"var(--fg-muted)", marginBottom:"0.25rem" }}>{product.color}</p>}
          {product.rating && <div style={{ marginBottom:"0.4rem" }}><StarRating rating={product.rating} /></div>}
          <div style={{ display:"flex", alignItems:"baseline", gap:"0.3rem", flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, fontSize:"1rem", color:"var(--fg)" }}>{formatPrice(product.priceInPaise, product.currency)}</span>
            {product.mrpInPaise && product.mrpInPaise > product.priceInPaise && (
              <span className="price-mrp">{formatPrice(product.mrpInPaise, product.currency)}</span>
            )}
          </div>
        </div>
      </div>
      <style>{`.product-img:hover { transform: scale(1.05); }`}</style>
    </Link>
  );
}
