// Client-facing catalog feed. Client components (wishlist, recently-viewed,
// social-proof toasts) fetch this instead of importing the server repository.
import { NextResponse } from "next/server";
import { getInStockProducts } from "@/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getInStockProducts();
  return NextResponse.json(products);
}
