// Route protection for /admin. Runs before any rendering, so an unauthenticated
// request gets a real 307 to the login page (a redirect() thrown from a nested
// layout streams too late once the root layout has flushed). Verifies the same
// HMAC-signed session cookie set by src/server/auth.ts, using Web Crypto so it
// works on the Edge runtime. requireAdmin() in layouts/actions is kept as
// defence-in-depth.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "aurelia_admin_session";

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [userId, exp, sig] = parts;
  if (!Number.isFinite(Number(exp)) || Date.now() > Number(exp)) return false;
  const secret = process.env.SESSION_SECRET || "insecure-dev-secret-change-me";
  const expected = await hmacHex(secret, `${userId}.${exp}`);
  return sig === expected;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const ok = await validSession(req.cookies.get(COOKIE)?.value);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
