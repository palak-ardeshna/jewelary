import { getAdsConfig, AD_SLOTS } from "@/server/ads";
import { saveAds } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const cfg = await getAdsConfig();

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", marginBottom: "0.5rem" }}>Ads</h1>
      <p style={{ color: "#78716c", marginBottom: "1.5rem" }}>
        Turn ads on or off and paste your ad code (e.g. a Google AdSense unit) into any slot.
        A slot only shows on the site when both the master switch and that slot are ON and it has code.
      </p>

      <form action={saveAds}>
        {/* Master switch */}
        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input id="ads-master" type="checkbox" name="enabled" defaultChecked={cfg.enabled} style={{ width: 18, height: 18 }} />
          <label htmlFor="ads-master" style={{ fontWeight: 600, fontSize: "1rem" }}>
            Ads enabled (master switch)
          </label>
          <span style={{ marginLeft: "auto", fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: 99, background: cfg.enabled ? "#dcfce7" : "#f5f5f4", color: cfg.enabled ? "#166534" : "#78716c" }}>
            {cfg.enabled ? "ON" : "OFF"}
          </span>
        </div>

        {/* Per-slot */}
        {AD_SLOTS.map((s) => {
          const slot = cfg.slots[s.name];
          return (
            <fieldset key={s.name} style={{ border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem", background: "#fff" }}>
              <legend style={{ padding: "0 0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <input type="checkbox" name={`slot_${s.name}_enabled`} defaultChecked={slot.enabled} style={{ width: 16, height: 16 }} />
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{s.label}</span>
              </legend>
              <p style={{ fontSize: "0.78rem", color: "#a8a29e", margin: "0 0 0.6rem" }}>{s.hint}</p>
              <textarea
                name={`slot_${s.name}_code`}
                defaultValue={slot.code}
                rows={4}
                placeholder="Paste ad code / HTML here (e.g. your AdSense <ins> unit + script)"
                style={{ width: "100%", padding: "0.6rem 0.7rem", border: "1px solid #d6d3d1", borderRadius: 8, background: "#fafaf9", fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical", outline: "none" }}
              />
            </fieldset>
          );
        })}

        <button type="submit" style={{ padding: "0.75rem 1.75rem", background: "#1c1917", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginTop: "0.5rem" }}>
          Save ads settings
        </button>
      </form>

      <p style={{ fontSize: "0.78rem", color: "#a8a29e", marginTop: "1.5rem", lineHeight: 1.6 }}>
        Tip: for Google AdSense, first add your site &amp; the AdSense script in your AdSense account, then paste
        an ad unit&apos;s code into a slot above. Note: heavy ads on a jewellery store can slightly hurt SEO/UX —
        use sparingly.
      </p>
    </div>
  );
}
