// ============================================================================
// Demo admin auth for /admin.
//
// Credentials come from env (NEXT_PUBLIC_ADMIN_USER / _PASS), inlined at build
// time. Because this is a STATIC export with no server, the check runs in the
// browser and the expected values live in the JS bundle — this is a convenience
// gate to keep the demo dashboard out of casual reach, NOT real security. A
// genuinely protected admin requires the full-stack build (server-side auth).
// ============================================================================

const SESSION_KEY = "aurelia_eng:admin-session";

/** Configured username (falls back to a demo default if env is unset). */
export const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS ?? "aurelia2026";

export function verify(user: string, pass: string): boolean {
  return user.trim() === ADMIN_USER && pass === ADMIN_PASS;
}

export function login(user: string, pass: string): boolean {
  if (!verify(user, pass)) return false;
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
  return true;
}

export function logout() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}
