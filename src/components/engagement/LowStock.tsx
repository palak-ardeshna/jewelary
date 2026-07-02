// Low-stock urgency indicator. Renders ONLY when the product carries a real
// numeric `stockUnits` at/below the admin threshold — never a fabricated number,
// and silent for products without inventory data. Server-safe (no client APIs).
import { engagementConfig } from "@/lib/engagement/config";
import { Icon } from "@/components/Icon";

export function LowStock({ stockUnits }: { stockUnits?: number }) {
  const cfg = engagementConfig.lowStock;
  if (!cfg?.targeting.enabled || !engagementConfig.masterEnabled) return null;
  if (typeof stockUnits !== "number" || !Number.isFinite(stockUnits)) return null;
  if (stockUnits <= 0 || stockUnits > cfg.thresholdUnits) return null;

  return (
    <p style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 600, color: "var(--warning)" }}>
      <Icon name="alert" size={14} />
      {cfg.label.replace("{n}", String(stockUnits))}
    </p>
  );
}
