// Bulk product import. Takes parsed spreadsheet rows (header → cell value) and
// upserts products via Prisma. Kept separate from the API route so the parsing
// (xlsx/csv) and the DB logic stay decoupled and testable. Column headers are
// matched case-insensitively and mirror the product form field names.
import { prisma } from "./db";

export interface ImportRow {
  [header: string]: string | number | boolean | null | undefined;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Normalise a row's keys to bare lowercase alphanumerics so "Price In Paise",
// "priceInPaise", "price_in_paise" and "Price (paise)" all collapse to the same
// key ("pricepaise"). Parentheses, spaces, units — all stripped.
function normalizeKeys(row: ImportRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v == null) continue;
    out[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = String(v).trim();
  }
  return out;
}

// Returns the first non-empty value among the given normalized-key aliases.
function pick(r: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v != null && v !== "") return v;
  }
  return "";
}

const int = (v?: string): number | null => {
  if (!v) return null;
  const n = parseInt(v.replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};
const float = (v?: string): number | null => {
  if (!v) return null;
  const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const boolOf = (v?: string, dflt = true): boolean => {
  if (v == null || v === "") return dflt;
  return ["1", "true", "yes", "y", "instock", "in stock", "available"].includes(v.toLowerCase());
};
const listJson = (v?: string): string | null => {
  if (!v) return null;
  return JSON.stringify(v.split(/[,;]/).map((x) => x.trim()).filter(Boolean));
};
const jsonOrNull = (v?: string): string | null => {
  if (!v) return null;
  try { JSON.parse(v); return v; } catch { return null; }
};

export async function importProducts(rows: ImportRow[]): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.brand.findMany({ select: { id: true, slug: true, name: true } }),
  ]);
  const catBy = new Map<string, string>();
  for (const c of categories) { catBy.set(c.slug.toLowerCase(), c.id); catBy.set(c.name.toLowerCase(), c.id); }
  const brandBy = new Map<string, string>();
  for (const b of brands) { brandBy.set(b.slug.toLowerCase(), b.id); brandBy.set(b.name.toLowerCase(), b.id); }

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // +1 for header, +1 for 1-based display
    try {
      const r = normalizeKeys(rows[i]);
      const name = pick(r, "name", "productname", "title");
      if (!name) { result.skipped++; continue; } // blank row

      // Price: accept paise directly ("Price (paise)" → pricepaise), or rupees
      // ("Price (₹)"/"priceRupees") × 100 as a convenience.
      const paiseRaw = pick(r, "pricepaise", "priceinpaise");
      const rupeesRaw = pick(r, "pricerupees", "pricers", "price");
      const priceInPaise = int(paiseRaw) ?? (float(rupeesRaw) != null ? Math.round((float(rupeesRaw) as number) * 100) : null);
      if (priceInPaise == null) { result.errors.push({ row: rowNum, message: `"${name}": missing price` }); continue; }

      const mrpPaiseRaw = pick(r, "mrppaise", "mrpinpaise");
      const mrpRupeesRaw = pick(r, "mrprupees", "mrprs", "mrp");
      const mrpInPaise = int(mrpPaiseRaw) ?? (float(mrpRupeesRaw) != null ? Math.round((float(mrpRupeesRaw) as number) * 100) : null);

      // Category by name or slug (required).
      const catInput = pick(r, "category", "categoryname", "categoryid");
      const categoryId = catBy.get(catInput.toLowerCase());
      if (!categoryId) { result.errors.push({ row: rowNum, message: `"${name}": unknown category "${catInput}"` }); continue; }

      const brandInput = pick(r, "brand", "brandname");
      const brandId = brandInput ? brandBy.get(brandInput.toLowerCase()) ?? null : null;

      const slugInput = pick(r, "slug");
      const slug = slugInput ? slugify(slugInput) : slugify(name);

      const data = {
        slug, name,
        description: pick(r, "description"),
        priceInPaise,
        mrpInPaise,
        currency: pick(r, "currency") || "INR",
        inStock: boolOf(pick(r, "instock")),
        stockUnits: int(pick(r, "stockunits")),
        color: pick(r, "color") || null,
        imageUrl: pick(r, "imageurl") || null,
        categoryId,
        brandId,
        rating: float(pick(r, "rating")),
        reviewCount: int(pick(r, "reviewcount")) ?? 0,
        sizes: listJson(pick(r, "sizes")),
        tags: listJson(pick(r, "tags")),
        gemstones: jsonOrNull(pick(r, "gemstonesjson", "gemstones")),
        certifications: jsonOrNull(pick(r, "certificationsjson", "certifications")),
        metal: pick(r, "metal") || null,
        purity: pick(r, "purity") || null,
        grossWeightG: float(pick(r, "grossweightg", "grossweight")),
        collectionLine: pick(r, "collectionline") || null,
        gender: pick(r, "gender") || null,
        status: (pick(r, "status") || "ACTIVE").toUpperCase(),
      };

      // Upsert on slug so re-importing the same sheet updates instead of dup-failing.
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        await prisma.product.update({ where: { slug }, data });
        result.updated++;
      } else {
        await prisma.product.create({ data });
        result.created++;
      }
    } catch (err) {
      result.errors.push({ row: rowNum, message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return result;
}
