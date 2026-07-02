"use client";
// Recently-purchased social proof. Cycles through the admin-curated purchase
// events, resolving each to a real product in the store (image, name, price).
// Bottom-left so it never collides with the cart toast (bottom-center) or the
// corner popup (bottom-right). Dismissible; respects the master switch.
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductBySlug } from "@/data/store";
import { useEngagementConfig } from "@/lib/engagement/useEngagementConfig";
import { track } from "@/lib/engagement/analytics";
import { Icon } from "@/components/Icon";

function ago(mins: number) {
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return `${h} hr${h > 1 ? "s" : ""} ago`;
}

export function SocialProofToasts() {
  const config = useEngagementConfig();
  const cfg = config.socialProof;
  const [idx, setIdx] = useState(-1);
  const [dismissed, setDismissed] = useState(false);

  const events = (cfg?.events ?? []).filter((e) => getProductBySlug(e.productSlug));

  useEffect(() => {
    if (!cfg?.targeting.enabled || !config.masterEnabled || dismissed || !events.length) return;
    let cur = -1;
    const showNext = () => {
      cur = (cur + 1) % events.length;
      setIdx(cur);
      track("socialproof", "impression", { slug: events[cur].productSlug });
      window.setTimeout(() => setIdx(-1), cfg.visibleSeconds * 1000);
    };
    const first = window.setTimeout(showNext, 4000);
    const interval = window.setInterval(showNext, cfg.intervalSeconds * 1000);
    return () => { window.clearTimeout(first); window.clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  if (!cfg?.targeting.enabled || !config.masterEnabled || dismissed || idx < 0) return null;

  const ev = events[idx];
  const product = getProductBySlug(ev.productSlug);
  if (!product) return null;

  return (
    <div
      className="eng-toast"
      style={{
        position: "fixed", left: "1.25rem", bottom: "1.25rem", zIndex: 190,
        width: "min(320px, calc(100vw - 2rem))", background: "#fff",
        border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-lg)",
        display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem",
      }}
    >
      <Link href={`/products/${product.slug}`} onClick={() => track("socialproof", "click", { slug: product.slug })} style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", color: "inherit", flex: 1, minWidth: 0 }}>
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" style={{ width: 46, height: 46, objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>Someone in {ev.city} purchased</p>
          <p style={{ fontSize: "0.83rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
          <p style={{ fontSize: "0.72rem", color: "var(--fg-subtle)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Icon name="shield-check" size={11} /> Verified · {ago(ev.minutesAgo)}
          </p>
        </div>
      </Link>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-subtle)", alignSelf: "flex-start", padding: "0.2rem" }}>
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
