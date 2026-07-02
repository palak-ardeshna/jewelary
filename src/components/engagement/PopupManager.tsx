"use client";
// Orchestrates every popup in config.popups: evaluates targeting → schedule →
// frequency, wires each popup's trigger (timed / scroll / exit-intent / idle /
// immediate), and shows at most ONE popup at a time. All state (impressions,
// dismissals, conversions, A/B assignment) is delegated to runtime helpers.
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { resolveConfig } from "@/lib/engagement/resolve";
import { track } from "@/lib/engagement/analytics";
import {
  assignVariant, canShow, currentAudiences, currentDevice, markVisited,
  passesTargeting, recordConvert, recordDismiss, recordImpression, resolveCountry,
} from "@/lib/engagement/runtime";
import type { PopupConfig, PopupDesign } from "@/lib/engagement/types";
import { LuxuryPopup } from "./LuxuryPopup";

type Active = { cfg: PopupConfig; design: PopupDesign; code?: string };

export function PopupManager() {
  const { totalItems } = useCart();
  const [active, setActive] = useState<Active | null>(null);
  // Ref mirrors `active` so event handlers registered once can early-out while
  // a popup is open without re-subscribing on every state change.
  const shownRef = useRef<Set<string>>(new Set());
  const openRef = useRef(false);
  openRef.current = active !== null;

  useEffect(() => {
    const engagementConfig = resolveConfig();
    if (!engagementConfig.masterEnabled) return;
    markVisited();

    const device = currentDevice();
    const country = resolveCountry();
    const audiences = currentAudiences(totalItems);

    // Popups eligible under targeting + frequency, in config order (priority).
    const eligible = engagementConfig.popups.filter(
      (p) =>
        passesTargeting(p.targeting, { device, audiences, country }) &&
        canShow(p.id, p.frequency) &&
        !shownRef.current.has(p.id),
    );
    if (!eligible.length) return;

    const cleanups: Array<() => void> = [];

    function open(p: PopupConfig) {
      if (openRef.current || shownRef.current.has(p.id)) return;
      // Resolve A/B variant → merge design overrides.
      let design = p.design;
      let variantId: string | undefined;
      if (p.experiment) {
        const v = assignVariant(p.experiment);
        variantId = v.id;
        if (v.overrides) design = { ...design, ...(v.overrides as Partial<PopupDesign>) };
      }
      shownRef.current.add(p.id);
      recordImpression(p.id);
      track("popup", "impression", { id: p.id, kind: p.kind, variant: variantId });
      setActive({ cfg: p, design });
    }

    for (const p of eligible) {
      const tr = p.trigger;
      if (tr.type === "immediate") {
        open(p);
        break; // one at a time
      } else if (tr.type === "timed" || tr.type === "idle") {
        const delay = tr.delayMs ?? 8000;
        if (tr.type === "timed") {
          const id = window.setTimeout(() => open(p), delay);
          cleanups.push(() => window.clearTimeout(id));
        } else {
          let id = window.setTimeout(() => open(p), delay);
          const reset = () => { window.clearTimeout(id); id = window.setTimeout(() => open(p), delay); };
          ["mousemove", "keydown", "scroll", "touchstart"].forEach((e) => window.addEventListener(e, reset, { passive: true }));
          cleanups.push(() => { window.clearTimeout(id); ["mousemove", "keydown", "scroll", "touchstart"].forEach((e) => window.removeEventListener(e, reset)); });
        }
      } else if (tr.type === "scroll") {
        const pct = tr.scrollPercent ?? 50;
        const onScroll = () => {
          const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
          if (scrolled >= pct) open(p);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      } else if (tr.type === "exit-intent") {
        const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) open(p); };
        document.addEventListener("mouseout", onLeave);
        cleanups.push(() => document.removeEventListener("mouseout", onLeave));
      }
    }

    return () => cleanups.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // set up once on mount; cart-derived audience read at mount time

  if (!active) return null;

  const { cfg, design, code } = active;

  return (
    <LuxuryPopup
      design={design}
      offer={cfg.offer}
      revealedCode={code}
      onDismiss={() => { recordDismiss(cfg.id); track("popup", "dismiss", { id: cfg.id }); setActive(null); }}
      onSecondary={() => { recordDismiss(cfg.id); track("popup", "dismiss", { id: cfg.id, via: "secondary" }); setActive(null); }}
      onPrimary={(email) => {
        recordConvert(cfg.id);
        track("popup", "convert", { id: cfg.id, hasEmail: !!email });
        // If there's a coupon, reveal it inline instead of closing immediately.
        if (cfg.offer?.code && !cfg.design.primaryCta.href) {
          setActive({ ...active, code: cfg.offer.code });
        } else {
          setActive(null);
        }
      }}
    />
  );
}
