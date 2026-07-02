// ============================================================================
// Engagement system — ANALYTICS sink.
//
// One choke-point for every engagement event. The admin picks the sink in
// config (`console` for dev, `dataLayer` to feed GA4/GTM, `none` to silence).
// Swap this file to wire Segment/Amplitude/etc. without touching components.
//
// Event naming: `eng_<feature>_<action>` e.g. eng_popup_impression,
// eng_popup_convert, eng_progressbar_unlock, eng_socialproof_click.
// ============================================================================

import { resolveConfig } from "./resolve";

export type EngEvent =
  | "impression"
  | "view"
  | "dismiss"
  | "cta_click"
  | "convert"
  | "unlock"
  | "add_to_cart"
  | "click";

declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}

export function track(feature: string, action: EngEvent, props: Record<string, unknown> = {}) {
  const { sink, debug } = resolveConfig().analytics;
  if (sink === "none") return;

  const event = `eng_${feature}_${action}`;
  const payload = { event, feature, action, ...props };

  if (sink === "dataLayer" && typeof window !== "undefined") {
    (window.dataLayer ??= []).push(payload);
  }
  if (sink === "console" || debug) {
    // eslint-disable-next-line no-console
    console.debug("[engagement]", event, props);
  }
}
