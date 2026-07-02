"use client";
// Engagement admin dashboard — sidebar navigation + one section at a time.
// Persists to this browser (resolve.ts); live widgets re-read on save.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { engagementConfig } from "@/lib/engagement/config";
import { clearOverride, hasOverride, resolveConfig, saveOverride } from "@/lib/engagement/resolve";
import type { EngagementConfig } from "@/lib/engagement/types";
import { ADMIN_USER, logout } from "@/lib/engagement/adminAuth";
import { Icon } from "@/components/Icon";

const clone = (c: EngagementConfig): EngagementConfig => JSON.parse(JSON.stringify(c));

type SectionId =
  | "global" | "popups" | "progress" | "sticky" | "giftwrap"
  | "crosssell" | "social" | "lowstock" | "recent" | "rails" | "json";

const NAV: { group: string; items: { id: SectionId; label: string }[] }[] = [
  { group: "General", items: [{ id: "global", label: "Global" }] },
  { group: "Popups & Offers", items: [{ id: "popups", label: "Popups" }] },
  { group: "Cart & Conversion", items: [
    { id: "progress", label: "Progress bar" },
    { id: "sticky", label: "Sticky add-to-cart" },
    { id: "giftwrap", label: "Gift-wrap upsell" },
    { id: "crosssell", label: "Complete the look" },
  ] },
  { group: "Social Proof", items: [
    { id: "social", label: "Recently purchased" },
    { id: "lowstock", label: "Low stock" },
    { id: "recent", label: "Recently viewed" },
    { id: "rails", label: "Product rails" },
  ] },
  { group: "Advanced", items: [{ id: "json", label: "Config JSON" }] },
];

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [cfg, setCfg] = useState<EngagementConfig>(engagementConfig);
  const [section, setSection] = useState<SectionId>("global");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [overriding, setOverriding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => { setCfg(clone(resolveConfig())); setOverriding(hasOverride()); }, []);

  function edit(fn: (d: EngagementConfig) => void) {
    setCfg((prev) => { const d = clone(prev); fn(d); return d; });
    setDirty(true); setSaved(false);
  }
  function save() { saveOverride(cfg); setDirty(false); setSaved(true); setOverriding(true); setTimeout(() => setSaved(false), 2500); }
  function reset() { clearOverride(); setCfg(clone(engagementConfig)); setDirty(false); setOverriding(false); }
  async function copyJson() { try { await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } }
  function doLogout() { logout(); onLogout(); }

  const jsonPreview = useMemo(() => JSON.stringify(cfg, null, 2), [cfg]);
  const activeLabel = NAV.flatMap((g) => g.items).find((i) => i.id === section)?.label ?? "";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, overflowY: "auto", background: "var(--bg)", display: "grid", gridTemplateColumns: "260px 1fr" }} className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar" data-open={navOpen} style={{ background: "#1c1917", color: "#e7e2da", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "1.5rem 1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <p className="eyebrow" style={{ margin: 0, color: "var(--accent)" }}>Aurelia</p>
          <p className="font-display" style={{ fontSize: "1.4rem", lineHeight: 1.1 }}>Engagement Admin</p>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "1rem 0.75rem" }}>
          {NAV.map((g) => (
            <div key={g.group} style={{ marginBottom: "1.1rem" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(231,226,218,.4)", padding: "0 0.75rem", marginBottom: "0.4rem" }}>{g.group}</p>
              {g.items.map((it) => {
                const active = section === it.id;
                return (
                  <button key={it.id} onClick={() => { setSection(it.id); setNavOpen(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "0.55rem 0.75rem", background: active ? "rgba(201,169,110,.16)" : "transparent", color: active ? "#fff" : "rgba(231,226,218,.75)", border: "none", borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`, cursor: "pointer", fontSize: "0.86rem", fontWeight: active ? 600 : 400 }}>
                    {it.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,.08)", fontSize: "0.78rem" }}>
          <p style={{ color: "rgba(231,226,218,.55)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}><Icon name="user" size={13} /> {ADMIN_USER}</p>
          <button onClick={doLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", color: "#e7e2da", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.78rem", width: "100%" }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ minWidth: 0, background: "var(--bg)" }}>
        {/* Top bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <button className="admin-burger" onClick={() => setNavOpen((v) => !v)} aria-label="Menu" style={{ display: "none", background: "none", border: "1px solid var(--border-strong)", padding: "0.4rem", cursor: "pointer" }}><Icon name="menu" size={16} /></button>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 700, flex: 1 }}>{activeLabel}</h1>
          <button onClick={save} className="btn-primary btn-sm" disabled={!dirty}>{saved ? "Saved ✓" : "Save & preview"}</button>
          <button onClick={reset} className="btn-outline btn-sm">Reset</button>
          <button onClick={copyJson} className="btn-outline btn-sm">{copied ? "Copied ✓" : "Copy JSON"}</button>
          <Link href="/" className="btn-outline btn-sm">View site</Link>
        </div>

        <div style={{ padding: "1.5rem", maxWidth: 820 }}>
          {overriding && (
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", padding: "0.7rem 0.9rem", fontSize: "0.78rem", color: "var(--fg-muted)", marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--warning)" }} />
              <span>Local override active — changes preview in <strong>this browser only</strong>. Use <strong>Copy JSON</strong> → paste into <code>config.ts</code> to roll out for real.</span>
            </div>
          )}
          {dirty && <p style={{ fontSize: "0.78rem", color: "var(--warning)", marginBottom: "1rem" }}>You have unsaved changes.</p>}

          {section === "global" && (
            <Panel>
              <Toggle label="Master enabled (kill-switch for the whole system)" checked={cfg.masterEnabled} onChange={(v) => edit((d) => { d.masterEnabled = v; })} />
              <Field label="Analytics sink"><Select value={cfg.analytics.sink} options={["console", "dataLayer", "none"]} onChange={(v) => edit((d) => { d.analytics.sink = v as EngagementConfig["analytics"]["sink"]; })} /></Field>
            </Panel>
          )}

          {section === "popups" && cfg.popups.map((p, i) => (
            <Card key={p.id} title={p.id} subtitle={p.kind} enabled={p.targeting.enabled} onToggle={(v) => edit((d) => { d.popups[i].targeting.enabled = v; })}>
              <Field label="Trigger"><Select value={p.trigger.type} options={["immediate", "timed", "scroll", "exit-intent", "idle"]} onChange={(v) => edit((d) => { d.popups[i].trigger.type = v as typeof p.trigger.type; })} /></Field>
              {(p.trigger.type === "timed" || p.trigger.type === "idle") && <Field label="Delay (ms)"><Num value={p.trigger.delayMs ?? 0} onChange={(v) => edit((d) => { d.popups[i].trigger.delayMs = v; })} /></Field>}
              {p.trigger.type === "scroll" && <Field label="Scroll %"><Num value={p.trigger.scrollPercent ?? 0} onChange={(v) => edit((d) => { d.popups[i].trigger.scrollPercent = v; })} /></Field>}
              <Field label="Heading"><Text value={p.design.heading} onChange={(v) => edit((d) => { d.popups[i].design.heading = v; })} /></Field>
              <Field label="Body"><Text value={p.design.body ?? ""} onChange={(v) => edit((d) => { d.popups[i].design.body = v; })} /></Field>
              <Field label="Primary CTA"><Text value={p.design.primaryCta.label} onChange={(v) => edit((d) => { d.popups[i].design.primaryCta.label = v; })} /></Field>
              {p.offer && (
                <Row><Field label="Coupon code"><Text value={p.offer.code} onChange={(v) => edit((d) => { d.popups[i].offer!.code = v; })} /></Field>
                <Field label="Offer value"><Num value={p.offer.value ?? 0} onChange={(v) => edit((d) => { d.popups[i].offer!.value = v; })} /></Field></Row>
              )}
              <Row><Field label="Max impressions (0 = ∞)"><Num value={p.frequency.maxImpressions ?? 0} onChange={(v) => edit((d) => { d.popups[i].frequency.maxImpressions = v; })} /></Field>
              <Field label="Dismiss for (hours)"><Num value={p.frequency.dismissForHours ?? 0} onChange={(v) => edit((d) => { d.popups[i].frequency.dismissForHours = v; })} /></Field></Row>
            </Card>
          ))}

          {section === "progress" && cfg.progressBar && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.progressBar.targeting.enabled} onChange={(v) => edit((d) => { d.progressBar!.targeting.enabled = v; })} />
              {cfg.progressBar.tiers.map((t, i) => (
                <Row key={i}><Field label={`Tier ${i + 1} — threshold (paise)`}><Num value={t.atPaise} onChange={(v) => edit((d) => { d.progressBar!.tiers[i].atPaise = v; })} /></Field>
                <Field label="Label"><Text value={t.label} onChange={(v) => edit((d) => { d.progressBar!.tiers[i].label = v; })} /></Field></Row>
              ))}
            </Panel>
          )}

          {section === "sticky" && cfg.stickyAtc && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.stickyAtc.targeting.enabled} onChange={(v) => edit((d) => { d.stickyAtc!.targeting.enabled = v; })} />
              <Field label="Show after scroll (px)"><Num value={cfg.stickyAtc.showAfterPx} onChange={(v) => edit((d) => { d.stickyAtc!.showAfterPx = v; })} /></Field>
            </Panel>
          )}

          {section === "giftwrap" && cfg.giftWrapUpsell && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.giftWrapUpsell.targeting.enabled} onChange={(v) => edit((d) => { d.giftWrapUpsell!.targeting.enabled = v; })} />
              <Field label="Heading"><Text value={cfg.giftWrapUpsell.heading} onChange={(v) => edit((d) => { d.giftWrapUpsell!.heading = v; })} /></Field>
              <Field label="Price (paise)"><Num value={cfg.giftWrapUpsell.pricePaise} onChange={(v) => edit((d) => { d.giftWrapUpsell!.pricePaise = v; })} /></Field>
            </Panel>
          )}

          {section === "crosssell" && cfg.crossSell && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.crossSell.targeting.enabled} onChange={(v) => edit((d) => { d.crossSell!.targeting.enabled = v; })} />
              <Field label="Heading"><Text value={cfg.crossSell.heading} onChange={(v) => edit((d) => { d.crossSell!.heading = v; })} /></Field>
              <Field label="Strategy"><Select value={cfg.crossSell.strategy} options={["same-collection", "same-category", "curated"]} onChange={(v) => edit((d) => { d.crossSell!.strategy = v as typeof cfg.crossSell.strategy; })} /></Field>
              <Field label="Max items"><Num value={cfg.crossSell.maxItems} onChange={(v) => edit((d) => { d.crossSell!.maxItems = v; })} /></Field>
              <ServerNote />
            </Panel>
          )}

          {section === "social" && cfg.socialProof && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.socialProof.targeting.enabled} onChange={(v) => edit((d) => { d.socialProof!.targeting.enabled = v; })} />
              <Row><Field label="Interval (seconds)"><Num value={cfg.socialProof.intervalSeconds} onChange={(v) => edit((d) => { d.socialProof!.intervalSeconds = v; })} /></Field>
              <Field label="Visible (seconds)"><Num value={cfg.socialProof.visibleSeconds} onChange={(v) => edit((d) => { d.socialProof!.visibleSeconds = v; })} /></Field></Row>
            </Panel>
          )}

          {section === "lowstock" && cfg.lowStock && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.lowStock.targeting.enabled} onChange={(v) => edit((d) => { d.lowStock!.targeting.enabled = v; })} />
              <Field label="Threshold (units)"><Num value={cfg.lowStock.thresholdUnits} onChange={(v) => edit((d) => { d.lowStock!.thresholdUnits = v; })} /></Field>
              <Field label="Label ({n} = units left)"><Text value={cfg.lowStock.label} onChange={(v) => edit((d) => { d.lowStock!.label = v; })} /></Field>
              <ServerNote />
            </Panel>
          )}

          {section === "recent" && cfg.recentlyViewed && (
            <Panel>
              <Toggle label="Enabled" checked={cfg.recentlyViewed.targeting.enabled} onChange={(v) => edit((d) => { d.recentlyViewed!.targeting.enabled = v; })} />
              <Field label="Heading"><Text value={cfg.recentlyViewed.heading} onChange={(v) => edit((d) => { d.recentlyViewed!.heading = v; })} /></Field>
              <Field label="Max items"><Num value={cfg.recentlyViewed.maxItems} onChange={(v) => edit((d) => { d.recentlyViewed!.maxItems = v; })} /></Field>
            </Panel>
          )}

          {section === "rails" && cfg.rails.map((r, i) => (
            <Card key={r.id} title={r.id} subtitle={`tag: ${r.tag}`} enabled={r.targeting.enabled} onToggle={(v) => edit((d) => { d.rails[i].targeting.enabled = v; })}>
              <Field label="Heading"><Text value={r.heading} onChange={(v) => edit((d) => { d.rails[i].heading = v; })} /></Field>
              <Row><Field label="Tag"><Text value={r.tag} onChange={(v) => edit((d) => { d.rails[i].tag = v; })} /></Field>
              <Field label="Max items"><Num value={r.maxItems} onChange={(v) => edit((d) => { d.rails[i].maxItems = v; })} /></Field></Row>
              <ServerNote />
            </Card>
          ))}

          {section === "json" && (
            <pre style={{ background: "#1c1917", color: "#e7e2da", padding: "1rem", overflow: "auto", fontSize: "0.72rem", lineHeight: 1.5, maxHeight: 520 }}>{jsonPreview}</pre>
          )}
        </div>
      </main>

      <style>{`
        @media (max-width: 820px) {
          .admin-shell { grid-template-columns: 1fr !important; }
          .admin-sidebar { position: fixed !important; z-index: 40; width: 260px; left: 0; transform: translateX(-100%); transition: transform .25s ease; }
          .admin-sidebar[data-open="true"] { transform: translateX(0); }
          .admin-burger { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────
function Panel({ children }: { children: React.ReactNode }) {
  return <div style={{ border: "1px solid var(--border-strong)", padding: "1.25rem", background: "#fff", display: "flex", flexDirection: "column", gap: "0.9rem" }}>{children}</div>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>{children}</div>;
}
function Card({ title, subtitle, enabled, onToggle, children }: { title: string; subtitle: string; enabled: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border-strong)", padding: "1rem 1.15rem", background: enabled ? "#fff" : "var(--surface)", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{title}</p>
          <p style={{ fontSize: "0.72rem", color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{subtitle}</p>
        </div>
        <Switch checked={enabled} onChange={onToggle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", opacity: enabled ? 1 : 0.55 }}>{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: "block" }}><span style={{ display: "block", fontSize: "0.74rem", color: "var(--fg-muted)", marginBottom: "0.3rem", fontWeight: 500 }}>{label}</span>{children}</label>;
}
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.55rem 0.7rem", border: "1px solid var(--border-strong)", background: "var(--bg)", outline: "none", fontSize: "0.85rem", color: "var(--fg)" };
function Text({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />; }
function Num({ value, onChange }: { value: number; onChange: (v: number) => void }) { return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={inputStyle} />; }
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) { return <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}><span style={{ fontSize: "0.88rem" }}>{label}</span><Switch checked={checked} onChange={onChange} /></div>;
}
function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, flexShrink: 0, borderRadius: 999, border: "none", cursor: "pointer", background: checked ? "var(--accent)" : "var(--border-strong)", position: "relative", transition: "background .2s" }}>
      <span style={{ position: "absolute", top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: "left .2s" }} />
    </button>
  );
}
function ServerNote() {
  return <p style={{ fontSize: "0.72rem", color: "var(--fg-subtle)", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem" }}><Icon name="alert" size={12} /> Server-rendered — needs a rebuild to appear on the storefront.</p>;
}
