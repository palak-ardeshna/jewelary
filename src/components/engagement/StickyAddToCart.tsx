"use client";
// Sticky add-to-cart bar for product pages. Slides in from the bottom once the
// user scrolls past the main buy box (admin-configured px), keeping price + CTA
// always reachable. If the product needs a size choice it scrolls back to the
// buy box (#buybox) rather than guessing.
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useEngagementConfig } from "@/lib/engagement/useEngagementConfig";
import { track } from "@/lib/engagement/analytics";
import { Icon } from "@/components/Icon";

interface Props {
  id: string; slug: string; name: string;
  priceInPaise: number; mrpInPaise?: number; currency: string;
  imageUrl?: string | null; inStock: boolean; hasSizes: boolean;
}

function money(paise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(paise / 100);
}

export function StickyAddToCart(p: Props) {
  const { addItem } = useCart();
  const config = useEngagementConfig();
  const cfg = config.stickyAtc;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!cfg?.targeting.enabled) return;
    const onScroll = () => setShow(window.scrollY > cfg.showAfterPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [cfg]);

  if (!cfg?.targeting.enabled || !config.masterEnabled || !show) return null;

  function onClick() {
    if (!p.inStock) return;
    if (p.hasSizes) {
      document.getElementById("buybox")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem({ id: p.id, slug: p.slug, name: p.name, priceInPaise: p.priceInPaise, currency: p.currency, imageUrl: p.imageUrl, size: "one-size" });
    track("sticky_atc", "add_to_cart", { slug: p.slug });
  }

  return (
    <div
      className="eng-anim-slide-up"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
        background: "#fff", borderTop: "1px solid var(--border-strong)", boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
        padding: "0.75rem 1rem",
      }}
    >
      <div style={{ maxWidth: "var(--container)", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
          {p.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt="" style={{ width: 44, height: 44, objectFit: "cover", flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
            <p style={{ fontSize: "0.85rem" }}>
              <span style={{ fontWeight: 700 }}>{money(p.priceInPaise, p.currency)}</span>
              {p.mrpInPaise && p.mrpInPaise > p.priceInPaise && (
                <span style={{ color: "var(--fg-subtle)", textDecoration: "line-through", marginLeft: "0.5rem", fontSize: "0.78rem" }}>{money(p.mrpInPaise, p.currency)}</span>
              )}
            </p>
          </div>
        </div>
        <button onClick={onClick} disabled={!p.inStock} className="btn-primary" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <Icon name="bag" size={15} /> {p.inStock ? (p.hasSizes ? "Select options" : "Add to cart") : "Out of stock"}
        </button>
      </div>
    </div>
  );
}
