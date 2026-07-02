"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Icon } from "@/components/Icon";
import { SizeGuide } from "@/components/SizeGuide";

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
            <SizeGuide />
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
            {product.sizes!.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={selectedSize === s}
                onClick={() => { setSelectedSize(s); setSizeError(false); }}
                className="size-chip"
              >{s}</button>
            ))}
          </div>
          {sizeError && <p style={{ color:"var(--error)", fontSize:"0.8rem", marginTop:"0.4rem", display:"flex", alignItems:"center", gap:"0.35rem" }}><Icon name="alert" size={13} /> Please select a size</p>}
        </div>
      )}
      <button onClick={handleAdd} className="btn-accent btn-lg btn-block">
        <Icon name="bag" size={17} /> Add to Cart
      </button>
    </div>
  );
}
