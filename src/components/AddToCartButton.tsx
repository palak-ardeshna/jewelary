"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

interface Props {
  product: {
    id: string; slug: string; name: string;
    priceInPaise: number; currency: string;
    imageUrl?: string | null; inStock: boolean;
    sizes?: string[];
  };
}

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.length ? undefined : "one-size"
  );
  const [sizeError, setSizeError] = useState(false);

  const hasSizes = product.sizes && product.sizes.length > 0;

  function handleAdd() {
    if (hasSizes && !selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem({
      id: product.id, slug: product.slug, name: product.name,
      priceInPaise: product.priceInPaise, currency: product.currency,
      imageUrl: product.imageUrl, size: selectedSize,
    });
  }

  if (!product.inStock) {
    return (
      <button disabled className="btn-primary" style={{ width:"100%", opacity:0.5 }}>
        Out of Stock — Notify Me
      </button>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {hasSizes && (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.5rem" }}>
            <span style={{ fontWeight:600, fontSize:"0.9rem" }}>Select Size</span>
            <span style={{ fontSize:"0.8rem", color:"var(--primary)", cursor:"pointer", textDecoration:"underline" }}>Size Guide</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
            {product.sizes!.map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedSize(s); setSizeError(false); }}
                style={{
                  padding:"0.4rem 0.9rem", borderRadius:"var(--radius-sm)", fontWeight:600, fontSize:"0.875rem",
                  border: selectedSize === s ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                  background: selectedSize === s ? "#eef2ff" : "#fff",
                  color: selectedSize === s ? "var(--primary)" : "var(--fg)",
                  cursor:"pointer", transition:"all 0.15s",
                }}
              >{s}</button>
            ))}
          </div>
          {sizeError && <p style={{ color:"var(--error)", fontSize:"0.8rem", marginTop:"0.4rem" }}>⚠ Please select a size</p>}
        </div>
      )}
      <button onClick={handleAdd} className="btn-accent" style={{ width:"100%", fontSize:"1rem", padding:"0.875rem" }}>
        🛒 Add to Cart
      </button>
    </div>
  );
}
