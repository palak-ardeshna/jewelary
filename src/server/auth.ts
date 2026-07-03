// Real server-side admin auth. Passwords hashed with scrypt (Node built-in, no
// native dep); the session is an HMAC-signed token in an HttpOnly cookie so the
// secret never reaches the browser — unlike the old NEXT_PUBLIC_* demo gate.
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

const COOKIE = "aurelia_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function secret(): string {
  return process.env.SESSION_SECRET || "insecure-dev-secret-change-me";
}

// ── password hashing (scrypt) ──────────────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
}

// ── signed session token ───────────────────────────────────────────────────
function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken(userId: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): { userId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const payload = `${userId}.${exp}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Date.now() > Number(exp)) return null;
  return { userId };
}

// ── credential check + cookie lifecycle ────────────────────────────────────
export async function authenticate(username: string, password: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return false;
  if (!verifyPassword(password, user.passwordHash)) return false;
  const jar = await cookies();
  jar.set(COOKIE, makeToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return true;
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Returns the admin userId if the request carries a valid session, else null. */
export async function getAdminSession(): Promise<{ userId: string } | null> {
  const jar = await cookies();
  return readToken(jar.get(COOKIE)?.value);
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

/** Guard for server components/actions — redirects to the login page if not authed. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
