// ============================================================================
// Engagement system — RUNTIME evaluation (client-only helpers).
//
// Components never decide *whether* to show themselves ad-hoc; they ask these
// helpers, which apply the admin's schedule / targeting / frequency / A-B rules
// against local signals. Everything degrades safely on the server (SSR) and when
// storage is unavailable. No PII leaves the browser.
// ============================================================================

import type {
  Audience,
  Device,
  Experiment,
  Frequency,
  Targeting,
} from "./types";

const NS = "aurelia_eng"; // localStorage namespace

const canStore = () =>
  typeof window !== "undefined" && (() => { try { return !!window.localStorage; } catch { return false; } })();

function read<T>(key: string, fallback: T): T {
  if (!canStore()) return fallback;
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (!canStore()) return;
  try { localStorage.setItem(`${NS}:${key}`, JSON.stringify(value)); } catch { /* quota / private mode */ }
}

// ── Clock ── centralised so it's easy to mock; `now` is injectable for tests. ─
export const now = () => Date.now();
const HOUR = 3_600_000;

// ── Device detection ─────────────────────────────────────────────────────────
export function currentDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  if (w < 640) return "mobile";
  if (w < 1024 && coarse) return "tablet";
  return "desktop";
}

// ── Geo (honest no-op in the static build) ───────────────────────────────────
// Returns a country code if a resolver has stored one (e.g. an edge header
// written to localStorage by a tiny bootstrap, or a CDN geo cookie). Absent that,
// returns null and country targeting is treated as "allow" — documented, not faked.
export function resolveCountry(): string | null {
  return read<string | null>("geo:country", null);
}
export function setCountry(code: string) { write("geo:country", code.toUpperCase()); }

// ── Audience detection ───────────────────────────────────────────────────────
// Signals we can read locally: has-visited flag, cart contents, VIP flag.
export function currentAudiences(cartCount: number): Audience[] {
  const out: Audience[] = ["all"];
  const visited = read<boolean>("visited", false);
  out.push(visited ? "returning" : "new");
  if (cartCount > 0) out.push("cart-abandoner");
  if (read<boolean>("vip", false)) out.push("vip");
  return out;
}
/** Call once per session so the *next* visit reads as "returning". */
export function markVisited() {
  if (!read<boolean>("visited", false)) write("visited", true);
}
export function markVip() { write("vip", true); }

// ── Schedule + targeting gate ────────────────────────────────────────────────
export function passesTargeting(
  t: Targeting,
  ctx: { device: Device; audiences: Audience[]; country: string | null },
): boolean {
  if (!t.enabled) return false;

  const ts = now();
  if (t.startAt && ts < Date.parse(t.startAt)) return false;
  if (t.endAt && ts > Date.parse(t.endAt)) return false;

  if (t.devices?.length && !t.devices.includes(ctx.device)) return false;

  if (t.audiences?.length && !t.audiences.some((a) => ctx.audiences.includes(a))) return false;

  // Country: only enforce when both an allow-list AND a resolved country exist.
  if (t.countries?.length && ctx.country && !t.countries.includes(ctx.country)) return false;

  return true;
}

// ── Frequency capping ────────────────────────────────────────────────────────
interface FreqState { impressions: number; lastShownAt: number; dismissedAt: number; converted: boolean; }

function freqState(id: string): FreqState {
  return read<FreqState>(`freq:${id}`, { impressions: 0, lastShownAt: 0, dismissedAt: 0, converted: false });
}

/** May this feature be shown right now under its frequency rules? */
export function canShow(id: string, f: Frequency): boolean {
  const s = freqState(id);
  if (f.hideAfterConvert && s.converted) return false;
  if (f.maxImpressions && s.impressions >= f.maxImpressions) return false;

  const ts = now();
  if (s.dismissedAt) {
    if (!f.dismissForHours) return false; // dismissed & no re-show window ⇒ never
    if (ts - s.dismissedAt < f.dismissForHours * HOUR) return false;
  }
  if (f.minHoursBetween && s.lastShownAt && ts - s.lastShownAt < f.minHoursBetween * HOUR) return false;
  return true;
}

export function recordImpression(id: string) {
  const s = freqState(id);
  write(`freq:${id}`, { ...s, impressions: s.impressions + 1, lastShownAt: now() });
}
export function recordDismiss(id: string) {
  write(`freq:${id}`, { ...freqState(id), dismissedAt: now() });
}
export function recordConvert(id: string) {
  write(`freq:${id}`, { ...freqState(id), converted: true });
}

// ── A/B assignment (stable, weighted, sticky per browser) ────────────────────
export function assignVariant(exp: Experiment): { id: string; overrides?: Record<string, unknown> } {
  const key = `ab:${exp.key}`;
  const saved = read<string | null>(key, null);
  const found = exp.variants.find((v) => v.id === saved);
  if (found) return found;

  const total = exp.variants.reduce((s, v) => s + Math.max(0, v.weight), 0) || 1;
  // Deterministic pick from a per-browser seed (no Math.random ⇒ stable, SSR-safe).
  let seed = read<number | null>("ab:seed", null);
  if (seed == null) { seed = Math.abs(hash(String(now()))) % 1000; write("ab:seed", seed); }
  let roll = (seed / 1000) * total;
  for (const v of exp.variants) {
    roll -= Math.max(0, v.weight);
    if (roll <= 0) { write(key, v.id); return v; }
  }
  const last = exp.variants[exp.variants.length - 1];
  write(key, last.id);
  return last;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h;
}

// ── Recently-viewed store (product slugs, capped, most-recent-first) ─────────
export function pushRecentlyViewed(slug: string, cap = 12): string[] {
  const list = read<string[]>("recent", []).filter((s) => s !== slug);
  list.unshift(slug);
  const capped = list.slice(0, cap);
  write("recent", capped);
  return capped;
}
export function getRecentlyViewed(): string[] {
  return read<string[]>("recent", []);
}
