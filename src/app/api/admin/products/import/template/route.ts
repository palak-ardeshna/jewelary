// Serves a starter CSV template for the bulk product import, with the header row
// and one example row. Admin-only.
import { NextResponse } from "next/server";
import { isAdmin } from "@/server/auth";

export const runtime = "nodejs";

const HEADERS = [
  "name", "slug", "description", "priceRupees", "mrpRupees", "currency",
  "category", "brand", "gender", "collectionLine", "status",
  "inStock", "stockUnits", "color", "imageUrl",
  "metal", "purity", "grossWeightG", "sizes", "tags", "rating", "reviewCount",
  "gemstones", "certifications",
];

const EXAMPLE = [
  "Emerald Solitaire Ring", "", "A classic emerald solitaire in 18K gold.", "24999", "29999", "INR",
  "Rings", "", "Women", "Heritage", "ACTIVE",
  "yes", "12", "Yellow Gold", "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "Gold", "18K", "4.2", "10;11;12", "Best Seller;New Arrival", "4.6", "38",
  "[{\"\"type\"\":\"\"Emerald\"\",\"\"caratWeight\"\":0.75}]", "[{\"\"body\"\":\"\"IGI\"\"}]",
];

function csvRow(cells: string[]): string {
  return cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const csv = [csvRow(HEADERS), csvRow(EXAMPLE)].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="product-import-template.csv"',
    },
  });
}
