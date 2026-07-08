// Admin-only bulk product export. Emits every product as a spreadsheet whose
// header row and cell encodings are exactly what the bulk importer
// (src/server/product-import.ts) expects — export here, re-import there, and the
// rows round-trip (upserted on `slug`). Keep HEADERS in sync with the import
// template route. Not covered by src/middleware.ts (/admin/* only), so we
// re-check auth.
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdmin } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same columns, same order as /api/admin/products/import/template.
const HEADERS = [
  "name", "slug", "description", "priceRupees", "mrpRupees", "currency",
  "category", "brand", "gender", "collectionLine", "status",
  "inStock", "stockUnits", "color", "imageUrl",
  "metal", "purity", "grossWeightG", "sizes", "tags", "rating", "reviewCount",
  "gemstones", "certifications",
] as const;

type Cell = string | number;

// A JSON-encoded string[] column ("[\"10\",\"11\"]") → "10;11". The importer
// splits sizes/tags on , or ; — semicolons are safer inside CSV cells.
function listCsv(json: string | null): string {
  if (!json) return "";
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map((x) => String(x).trim()).filter(Boolean).join(";") : "";
  } catch {
    return "";
  }
}

// gemstones/certifications are stored as raw JSON strings; pass them straight
// through so the importer's jsonOrNull() accepts them verbatim.
function jsonCell(json: string | null): string {
  if (!json) return "";
  try { JSON.parse(json); return json; } catch { return ""; }
}

const paiseToRupees = (p: number | null): Cell => (p == null ? "" : p / 100);

function csvRow(cells: Cell[]): string {
  return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, brand: true },
  });

  const rows: Cell[][] = products.map((p) => [
    p.name,
    p.slug,
    p.description,
    paiseToRupees(p.priceInPaise),
    paiseToRupees(p.mrpInPaise),
    p.currency,
    p.category.name,
    p.brand?.name ?? "",
    p.gender ?? "",
    p.collectionLine ?? "",
    p.status,
    p.inStock ? "yes" : "no",
    p.stockUnits ?? "",
    p.color ?? "",
    p.imageUrl ?? "",
    p.metal ?? "",
    p.purity ?? "",
    p.grossWeightG ?? "",
    listCsv(p.sizes),
    listCsv(p.tags),
    p.rating ?? "",
    p.reviewCount,
    jsonCell(p.gemstones),
    jsonCell(p.certifications),
  ]);

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    // BOM so Excel opens UTF-8 (₹, accented names) correctly.
    const csv = "﻿" + [csvRow([...HEADERS]), ...rows.map(csvRow)].join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-${stamp}.csv"`,
      },
    });
  }

  const sheet = XLSX.utils.aoa_to_sheet([[...HEADERS], ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Products");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="products-${stamp}.xlsx"`,
    },
  });
}
