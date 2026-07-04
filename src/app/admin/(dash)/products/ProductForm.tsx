"use client";
import Link from "next/link";
import { useState } from "react";
import { saveProduct } from "@/app/admin/actions";

export interface ProductFormDefaults {
  id?: string;
  name?: string; slug?: string; description?: string;
  priceInPaise?: string; mrpInPaise?: string; currency?: string;
  inStock?: boolean; stockUnits?: string; color?: string; imageUrl?: string;
  categoryId?: string; brandId?: string; rating?: string; reviewCount?: string;
  metal?: string; purity?: string; grossWeightG?: string; collectionLine?: string;
  gender?: string; status?: string; sizes?: string; tags?: string;
  gemstones?: string; certifications?: string;
}

export function ProductForm({
  defaults = {}, categories, brands,
}: {
  defaults?: ProductFormDefaults;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const d = defaults;
  const [price, setPrice] = useState(d.priceInPaise ?? "");
  const [mrp, setMrp] = useState(d.mrpInPaise ?? "");
  const [currency, setCurrency] = useState(d.currency ?? "INR");
  const [imageUrl, setImageUrl] = useState(d.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setImageUrl(json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  // Live paise → currency preview shown under the price inputs.
  function formatPaise(paise: string): string | null {
    const n = Number(paise);
    if (!paise.trim() || !Number.isFinite(n)) return null;
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format(n / 100);
    } catch {
      return `${(n / 100).toFixed(2)} ${currency || "INR"}`;
    }
  }
  const priceLabel = formatPaise(price);
  const mrpLabel = formatPaise(mrp);

  return (
    <form action={saveProduct} style={{ maxWidth: "100%" }}>
      {d.id && <input type="hidden" name="id" value={d.id} />}

      <Section title="Basics">
        <Field label="Name" required><input name="name" defaultValue={d.name} required style={input} /></Field>
        <Field label="Slug" hint="Leave blank to auto-generate from the name"><input name="slug" defaultValue={d.slug} style={input} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={d.description} rows={4} style={{ ...input, resize: "vertical" }} /></Field>
      </Section>

      <Section title="Pricing (paise — ₹1 = 100 paise)">
        <Row>
          <Field label="Price (paise)" required>
            <input name="priceInPaise" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={input} />
            <PricePreview label={priceLabel} />
          </Field>
          <Field label="MRP (paise)">
            <input name="mrpInPaise" type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} style={input} />
            <PricePreview label={mrpLabel} />
          </Field>
          <Field label="Currency"><input name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} style={input} /></Field>
        </Row>
      </Section>

      <Section title="Classification">
        <Row>
          <Field label="Category" required>
            <select name="categoryId" defaultValue={d.categoryId ?? ""} required style={input}>
              <option value="" disabled>Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Brand">
            <select name="brandId" defaultValue={d.brandId ?? ""} style={input}>
              <option value="">—</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="Gender"><input name="gender" defaultValue={d.gender} placeholder="Women / Men / Unisex" style={input} /></Field>
          <Field label="Collection line"><input name="collectionLine" defaultValue={d.collectionLine} style={input} /></Field>
          <Field label="Status">
            <select name="status" defaultValue={d.status ?? "ACTIVE"} style={input}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </Field>
        </Row>
      </Section>

      <Section title="Stock & media">
        <Row>
          <Field label="In stock"><label style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem" }}><input name="inStock" type="checkbox" defaultChecked={d.inStock ?? true} /> Available</label></Field>
          <Field label="Stock units"><input name="stockUnits" type="number" defaultValue={d.stockUnits} style={input} /></Field>
          <Field label="Color"><input name="color" defaultValue={d.color} placeholder="Yellow Gold" style={input} /></Field>
        </Row>
        <Field label="Product image" hint="Upload a file (stored on Cloudinary) or paste an image URL. Leave blank to auto-resolve a placeholder.">
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, border: "1px solid #e7e5e4", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: 8, border: "1px dashed #d6d3d1", display: "flex", alignItems: "center", justifyContent: "center", color: "#a8a29e", fontSize: "0.7rem", textAlign: "center", flexShrink: 0 }}>No image</div>
            )}
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/…  or  /images/products/foo.jpg"
                style={input}
              />
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <label style={{ padding: "0.45rem 0.9rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, cursor: uploading ? "wait" : "pointer", fontSize: "0.82rem", fontWeight: 500 }}>
                  {uploading ? "Uploading…" : "Upload image"}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
                </label>
                {imageUrl && !uploading && (
                  <button type="button" onClick={() => setImageUrl("")} style={{ padding: "0.45rem 0.9rem", background: "#fff", color: "#78716c", border: "1px solid #e7e5e4", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}>Clear</button>
                )}
              </div>
              {uploadError && <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.4rem" }}>{uploadError}</p>}
            </div>
          </div>
        </Field>
      </Section>

      <Section title="Jewellery attributes">
        <Row>
          <Field label="Metal"><input name="metal" defaultValue={d.metal} style={input} /></Field>
          <Field label="Purity"><input name="purity" defaultValue={d.purity} placeholder="18K / 22K / PT950" style={input} /></Field>
          <Field label="Gross weight (g)"><input name="grossWeightG" type="number" step="0.1" defaultValue={d.grossWeightG} style={input} /></Field>
        </Row>
        <Row>
          <Field label="Sizes (comma-separated)"><input name="sizes" defaultValue={d.sizes} placeholder="10, 11, 12" style={input} /></Field>
          <Field label="Tags (comma-separated)"><input name="tags" defaultValue={d.tags} placeholder="Best Seller, New Arrival" style={input} /></Field>
        </Row>
        <Row>
          <Field label="Rating"><input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={d.rating} style={input} /></Field>
          <Field label="Review count"><input name="reviewCount" type="number" defaultValue={d.reviewCount} style={input} /></Field>
        </Row>
        <Field label="Gemstones (JSON)" hint='e.g. [{"type":"Diamond","caratWeight":0.75,"cut":"Round","count":1}]'>
          <textarea name="gemstones" defaultValue={d.gemstones} rows={2} style={{ ...input, fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical" }} />
        </Field>
        <Field label="Certifications (JSON)" hint='e.g. [{"body":"IGI","number":"IGI-..."},{"body":"BIS"}]'>
          <textarea name="certifications" defaultValue={d.certifications} rows={2} style={{ ...input, fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical" }} />
        </Field>
      </Section>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#1c1917", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Save product</button>
        <Link href="/admin/products" style={{ padding: "0.75rem 1.5rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, textDecoration: "none" }}>Cancel</Link>
      </div>
    </form>
  );
}

function PricePreview({ label }: { label: string | null }) {
  return (
    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: label ? "#15803d" : "#a8a29e", marginTop: "0.3rem" }}>
      {label ? `= ${label}` : "—"}
    </p>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", background: "#fff" }}>
      <legend style={{ padding: "0 0.5rem", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#78716c" }}>{title}</legend>
      {children}
    </fieldset>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>{children}</div>;
}
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, marginBottom: "0.3rem", color: "#44403c" }}>
        {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: "0.72rem", color: "#a8a29e", marginTop: "0.25rem" }}>{hint}</p>}
    </div>
  );
}
const input: React.CSSProperties = { width: "100%", padding: "0.55rem 0.7rem", border: "1px solid #d6d3d1", borderRadius: 8, background: "#fff", fontSize: "0.9rem", outline: "none" };
