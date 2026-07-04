// Admin-only bulk product import. Accepts a multipart form with a spreadsheet
// `file` (.xlsx / .xls / .csv), parses the first sheet to rows, and upserts each
// product. Not covered by src/middleware.ts (/admin/* only), so we re-check auth.
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdmin } from "@/server/auth";
import { importProducts, type ImportRow } from "@/server/product-import";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_ROWS = 5000;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 400 });
  }

  let rows: ImportRow[];
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) return NextResponse.json({ error: "The file has no sheets." }, { status: 400 });
    rows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: "" });
  } catch {
    return NextResponse.json({ error: "Could not read the file. Use .xlsx or .csv." }, { status: 400 });
  }

  if (rows.length === 0) return NextResponse.json({ error: "No rows found in the file." }, { status: 400 });
  if (rows.length > MAX_ROWS) return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS}).` }, { status: 400 });

  try {
    const result = await importProducts(rows);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Product import failed:", err);
    return NextResponse.json({ error: "Import failed while writing to the database." }, { status: 500 });
  }
}
