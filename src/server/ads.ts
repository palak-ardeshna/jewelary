// Ads configuration, stored in the DB Setting table under key "ads" and edited
// from /admin/ads. Each slot has an on/off toggle and an HTML/script snippet
// (e.g. a Google AdSense unit). The storefront renders enabled slots server-side.
import { prisma } from "./db";

export type AdSlotName = "header" | "productTop" | "productBottom" | "footer";

export interface AdSlotConfig {
  enabled: boolean;
  code: string;
}

export interface AdsConfig {
  enabled: boolean; // global master switch
  slots: Record<AdSlotName, AdSlotConfig>;
}

export const AD_SLOTS: { name: AdSlotName; label: string; hint: string }[] = [
  { name: "header", label: "Header banner", hint: "Site-wide, just below the top header." },
  { name: "productTop", label: "Product page — top", hint: "On product pages, above the details." },
  { name: "productBottom", label: "Product page — bottom", hint: "On product pages, below the details." },
  { name: "footer", label: "Footer banner", hint: "Site-wide, just above the footer." },
];

function emptySlots(): Record<AdSlotName, AdSlotConfig> {
  return {
    header: { enabled: false, code: "" },
    productTop: { enabled: false, code: "" },
    productBottom: { enabled: false, code: "" },
    footer: { enabled: false, code: "" },
  };
}

const DEFAULT: AdsConfig = { enabled: false, slots: emptySlots() };

/** Read the ads config; returns safe defaults if unset or the table is missing. */
export async function getAdsConfig(): Promise<AdsConfig> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "ads" } });
    if (!row) return DEFAULT;
    const parsed = JSON.parse(row.valueJson) as Partial<AdsConfig>;
    const slots = emptySlots();
    for (const { name } of AD_SLOTS) {
      const s = parsed.slots?.[name];
      if (s) slots[name] = { enabled: !!s.enabled, code: typeof s.code === "string" ? s.code : "" };
    }
    return { enabled: !!parsed.enabled, slots };
  } catch {
    return DEFAULT;
  }
}

export async function saveAdsConfig(cfg: AdsConfig): Promise<void> {
  await prisma.setting.upsert({
    where: { key: "ads" },
    create: { key: "ads", valueJson: JSON.stringify(cfg) },
    update: { valueJson: JSON.stringify(cfg) },
  });
}
