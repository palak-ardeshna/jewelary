// ============================================================================
// Engagement config RESOLVER — merges the static default (config.ts, the code
// source of truth) with a per-browser override written by the demo /admin page.
//
// Static build reality: there is no server, so the demo admin can only persist
// to THIS browser's localStorage. `resolveConfig()` returns the override when
// present, else the shipped default. On the server (SSR/export) it always
// returns the default so prerendered HTML is stable.
// ============================================================================

import { engagementConfig } from "./config";
import type { EngagementConfig } from "./types";

export const OVERRIDE_KEY = "aurelia_eng:config";
/** Fired on the window after a save/reset so live widgets re-resolve instantly. */
export const CONFIG_EVENT = "eng:config-changed";

export function loadOverride(): EngagementConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as EngagementConfig) : null;
  } catch {
    return null;
  }
}

export function resolveConfig(): EngagementConfig {
  return loadOverride() ?? engagementConfig;
}

export function saveOverride(cfg: EngagementConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event(CONFIG_EVENT));
  } catch { /* quota / private mode */ }
}

export function clearOverride() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(OVERRIDE_KEY);
    window.dispatchEvent(new Event(CONFIG_EVENT));
  } catch { /* ignore */ }
}

export function hasOverride(): boolean {
  return loadOverride() !== null;
}
