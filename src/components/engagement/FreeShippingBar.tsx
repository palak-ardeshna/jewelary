"use client";
// Free-shipping / unlock-next-reward progress bar. Reads live cart subtotal and
// the admin's reward tiers; shows the next tier to unlock and how much is left,
// then celebrates each unlocked tier. Fires an analytics `unlock` event once per
// tier per mount.
import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartProvider";
import { useEngagementConfig } from "@/lib/engagement/useEngagementConfig";
import { track } from "@/lib/engagement/analytics";
import { Icon } from "@/components/Icon";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}

export function FreeShippingBar() {
  const { totalPrice } = useCart();
  const config = useEngagementConfig();
  const cfg = config.progressBar;
  const unlockedRef = useRef<Set<number>>(new Set());

  const tiers = cfg ? [...cfg.tiers].sort((a, b) => a.atPaise - b.atPaise) : [];
  const top = tiers.length ? tiers[tiers.length - 1].atPaise : 0;
  const pct = top ? Math.min(100, (totalPrice / top) * 100) : 0;
  const next = tiers.find((t) => totalPrice < t.atPaise);

  useEffect(() => {
    if (!cfg) return;
    for (const t of tiers) {
      if (totalPrice >= t.atPaise && !unlockedRef.current.has(t.atPaise)) {
        unlockedRef.current.add(t.atPaise);
        track("progressbar", "unlock", { tier: t.reward, atPaise: t.atPaise });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

  if (!cfg?.targeting.enabled || !config.masterEnabled || !tiers.length) return null;

  return (
    <div style={{ padding: "0.85rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", marginBottom: "1rem" }}>
      <p style={{ fontSize: "0.82rem", color: "var(--fg)", marginBottom: "0.55rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <Icon name="truck" size={15} />
        {next ? (
          <span>Add <strong>{money(next.atPaise - totalPrice)}</strong> to unlock <strong>{next.label}</strong></span>
        ) : (
          <span style={{ color: "var(--success)", fontWeight: 600 }}>All rewards unlocked — enjoy!</span>
        )}
      </p>
      <div style={{ position: "relative", height: 6, background: "var(--border)", overflow: "hidden" }}>
        <div className="eng-progress-fill" style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--accent-dark), var(--accent))", transition: "width .5s var(--ease-luxe)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
        {tiers.map((t) => {
          const done = totalPrice >= t.atPaise;
          return (
            <span key={t.atPaise} style={{ fontSize: "0.68rem", color: done ? "var(--success)" : "var(--fg-subtle)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              {done && <Icon name="check" size={11} />}{t.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
