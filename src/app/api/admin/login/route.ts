import { NextResponse } from "next/server";
import { authenticate } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
  }
  const ok = await authenticate(username, password);
  if (!ok) return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
