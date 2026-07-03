// Renders an admin-managed ad unit for a given slot, server-side, only when the
// global ads switch AND that slot are enabled and have code. Returns nothing
// otherwise, so there are never empty ad boxes. Code is admin-controlled.
import { getAdsConfig, type AdSlotName } from "@/server/ads";

export async function AdSlot({ name }: { name: AdSlotName }) {
  const cfg = await getAdsConfig();
  const slot = cfg.slots[name];
  if (!cfg.enabled || !slot?.enabled || !slot.code.trim()) return null;

  return (
    <div
      className="ad-slot"
      data-ad-slot={name}
      style={{ margin: "1.5rem auto", textAlign: "center", maxWidth: "var(--container)" }}
      // Admin-provided markup (e.g. an AdSense unit).
      dangerouslySetInnerHTML={{ __html: slot.code }}
    />
  );
}
