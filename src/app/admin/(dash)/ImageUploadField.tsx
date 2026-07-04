"use client";
// Reusable image picker for admin forms: preview + "upload from computer"
// (→ Cloudinary via /api/admin/upload) + a paste-a-URL text input. The text
// input carries `name`, so it submits with the surrounding server-action form.
import { useState } from "react";

export function ImageUploadField({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Preview" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #e7e5e4", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 72, height: 72, borderRadius: 8, border: "1px dashed #d6d3d1", display: "flex", alignItems: "center", justifyContent: "center", color: "#a8a29e", fontSize: "0.65rem", flexShrink: 0 }}>No image</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, cursor: uploading ? "wait" : "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
            {uploading ? "Uploading…" : "⬆ Upload"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
          </label>
          {url && !uploading && (
            <button type="button" onClick={() => setUrl("")} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#78716c", border: "1px solid #e7e5e4", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem" }}>Clear</button>
          )}
        </div>
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image URL"
          style={{ width: "100%", marginTop: "0.4rem", padding: "0.5rem 0.65rem", border: "1px solid #d6d3d1", borderRadius: 8, fontSize: "0.85rem", outline: "none" }}
        />
        {error && <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.3rem" }}>{error}</p>}
      </div>
    </div>
  );
}
