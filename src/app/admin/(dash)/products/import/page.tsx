"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export default function ImportProductsPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/products/import", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setResult(json as ImportResult);
      router.refresh(); // refresh the product list count in the background
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <Link href="/admin/products" style={{ color: "#78716c", textDecoration: "none", fontSize: "0.85rem" }}>← Products</Link>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", margin: "0.5rem 0 0.5rem" }}>Import products</h1>
      <p style={{ color: "#78716c", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Upload an <strong>Excel (.xlsx)</strong> or <strong>CSV</strong> file to add many products at once.
        Rows are matched to existing products by <code>slug</code> — a matching slug updates that product, otherwise a new one is created.
      </p>

      <div style={card}>
        <h2 style={h2}>1. Get the template</h2>
        <p style={muted}>The header row lists every supported column. Only <strong>name</strong>, <strong>priceRupees</strong> (or priceInPaise) and <strong>category</strong> are required.</p>
        <a href="/api/admin/products/import/template" style={btnGhost}>⬇ Download CSV template</a>
      </div>

      <div style={card}>
        <h2 style={h2}>2. Upload your file</h2>
        <label style={{ ...btnPrimary, cursor: busy ? "wait" : "pointer", display: "inline-block" }}>
          {busy ? "Importing…" : "⬆ Choose Excel / CSV file"}
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} disabled={busy} style={{ display: "none" }} />
        </label>
        {fileName && <span style={{ marginLeft: "0.75rem", color: "#78716c", fontSize: "0.85rem" }}>{fileName}</span>}
      </div>

      {error && (
        <div style={{ ...card, borderColor: "#fecaca", background: "#fef2f2" }}>
          <strong style={{ color: "#dc2626" }}>Error:</strong> <span style={{ color: "#991b1b" }}>{error}</span>
        </div>
      )}

      {result && (
        <div style={{ ...card, borderColor: "#bbf7d0", background: "#f0fdf4" }}>
          <h2 style={h2}>Import finished</h2>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: result.errors.length ? "1rem" : 0 }}>
            <Stat label="Created" value={result.created} color="#15803d" />
            <Stat label="Updated" value={result.updated} color="#2563eb" />
            <Stat label="Skipped (blank)" value={result.skipped} color="#a8a29e" />
            <Stat label="Errors" value={result.errors.length} color={result.errors.length ? "#dc2626" : "#a8a29e"} />
          </div>
          {result.errors.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <p style={{ fontWeight: 600, color: "#991b1b", marginBottom: "0.4rem", fontSize: "0.85rem" }}>Rows not imported:</p>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#991b1b", fontSize: "0.82rem", maxHeight: 220, overflowY: "auto" }}>
                {result.errors.map((e, i) => <li key={i}>Row {e.row}: {e.message}</li>)}
              </ul>
            </div>
          )}
          <div style={{ marginTop: "1.25rem" }}>
            <Link href="/admin/products" style={btnPrimary}>View products →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#78716c", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", background: "#fff" };
const h2: React.CSSProperties = { fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" };
const muted: React.CSSProperties = { color: "#78716c", fontSize: "0.85rem", marginBottom: "0.9rem" };
const btnPrimary: React.CSSProperties = { padding: "0.65rem 1.25rem", background: "#1c1917", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, border: "none" };
const btnGhost: React.CSSProperties = { padding: "0.55rem 1.1rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", display: "inline-block" };
