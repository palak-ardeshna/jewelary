"use client";
// Luxury gift-wrapping upsell shown inside the cart. Adds/removes a single
// gift-wrap line item (fixed id) as a toggle. Config-driven price & copy.
import { useCart } from "@/components/CartProvider";
import { useEngagementConfig } from "@/lib/engagement/useEngagementConfig";
import { track } from "@/lib/engagement/analytics";
import { Icon } from "@/components/Icon";

const GIFT_ID = "svc_gift_wrap";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}

export function GiftWrapUpsell() {
  const { items, addItem, removeItem } = useCart();
  const config = useEngagementConfig();
  const cfg = config.giftWrapUpsell;
  const added = items.some((i) => i.id === GIFT_ID);

  if (!cfg?.targeting.enabled || !config.masterEnabled) return null;

  function toggle() {
    if (added) {
      removeItem(GIFT_ID);
      track("giftwrap", "dismiss", {});
    } else {
      addItem({ id: GIFT_ID, slug: GIFT_ID, name: "Luxury Gift Wrapping", priceInPaise: cfg!.pricePaise, currency: "INR", imageUrl: null });
      track("giftwrap", "add_to_cart", { pricePaise: cfg!.pricePaise });
    }
  }

  return (
    <button
      type="button" onClick={toggle}
      style={{
        display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", textAlign: "left",
        padding: "0.85rem 1rem", marginBottom: "1rem", cursor: "pointer",
        background: added ? "var(--surface-2)" : "var(--surface)",
        border: `1px solid ${added ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <span style={{ width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center", background: "#fff", border: "1px solid var(--border)", color: "var(--accent-dark)" }}>
        <Icon name={(cfg.icon as "gift") ?? "gift"} size={17} />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontWeight: 600, fontSize: "0.85rem" }}>{cfg.heading}</span>
        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--fg-muted)" }}>{cfg.body}</span>
      </span>
      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--fg)" }}>
        {added ? "✓" : `+ ${money(cfg.pricePaise)}`}
      </span>
    </button>
  );
}
