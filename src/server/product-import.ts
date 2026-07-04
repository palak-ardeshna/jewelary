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

// Normalise a row's keys to lowercase/trimmed so "Price In Paise", "priceInPaise"
// and "price_in_paise" all resolve to the same field.
function normalizeKeys(row: ImportRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v == null) continue;
    out[k.toLowerCase().replace(/[\s_]+/g, "")] = String(v).trim();
  }
  return out;
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
      const name = r.name;
      if (!name) { result.skipped++; continue; } // blank row

      // Price: accept paise directly, or rupees (× 100) as a convenience column.
      const priceInPaise = int(r.priceinpaise) ?? (float(r.pricerupees ?? r.price) != null ? Math.round((float(r.pricerupees ?? r.price) as number) * 100) : null);
      if (priceInPaise == null) { result.errors.push({ row: rowNum, message: `"${name}": missing price` }); continue; }

      const mrpInPaise = int(r.mrpinpaise) ?? (float(r.mrprupees ?? r.mrp) != null ? Math.round((float(r.mrprupees ?? r.mrp) as number) * 100) : null);

      // Category by name or slug (required).
      const catKey = (r.category ?? r.categoryid ?? "").toLowerCase();
      const categoryId = catBy.get(catKey);
      if (!categoryId) { result.errors.push({ row: rowNum, message: `"${name}": unknown category "${r.category ?? r.categoryid ?? ""}"` }); continue; }

      const brandKey = (r.brand ?? "").toLowerCase();
      const brandId = brandKey ? brandBy.get(brandKey) ?? null : null;

      const slug = r.slug ? slugify(r.slug) : slugify(name);

      const data = {
        slug, name,
        description: r.description ?? "",
        priceInPaise,
        mrpInPaise,
        currency: r.currency || "INR",
        inStock: boolOf(r.instock),
        stockUnits: int(r.stockunits),
        color: r.color || null,
        imageUrl: r.imageurl || null,
        categoryId,
        brandId,
        rating: float(r.rating),
        reviewCount: int(r.reviewcount) ?? 0,
        sizes: listJson(r.sizes),
        tags: listJson(r.tags),
        gemstones: jsonOrNull(r.gemstones),
        certifications: jsonOrNull(r.certifications),
        metal: r.metal || null,
        purity: r.purity || null,
        grossWeightG: float(r.grossweightg),
        collectionLine: r.collectionline || null,
        gender: r.gender || null,
        status: (r.status || "ACTIVE").toUpperCase(),
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
