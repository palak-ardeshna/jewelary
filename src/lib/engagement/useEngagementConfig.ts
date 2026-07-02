"use client";
// Live-resolving config hook for always-visible client widgets. Starts from the
// shipped default (so SSR/first paint matches prerendered HTML), then adopts any
// per-browser override after mount and re-resolves whenever the /admin page
// saves or resets (custom event) or another tab changes it (storage event).
import { useEffect, useState } from "react";
import { engagementConfig } from "./config";
import { CONFIG_EVENT, OVERRIDE_KEY, resolveConfig } from "./resolve";
import type { EngagementConfig } from "./types";

export function useEngagementConfig(): EngagementConfig {
  const [cfg, setCfg] = useState<EngagementConfig>(engagementConfig);

  useEffect(() => {
    const sync = () => setCfg(resolveConfig());
    sync();
    window.addEventListener(CONFIG_EVENT, sync);
    const onStorage = (e: StorageEvent) => { if (e.key === OVERRIDE_KEY) sync(); };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CONFIG_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return cfg;
}
