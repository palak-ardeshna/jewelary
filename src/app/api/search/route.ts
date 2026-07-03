// Server-side product search (replaces the old client-only .filter over the
// whole shipped catalog). Returns matches for ?q=.
import { NextResponse } from "next/server";
import { searchProducts } from "@/data/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = await searchProducts(q);
  return NextResponse.json(results);
}
