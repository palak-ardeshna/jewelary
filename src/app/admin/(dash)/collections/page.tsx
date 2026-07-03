import Link from "next/link";
import { prisma } from "@/server/db";
import { saveCollection, deleteCollection } from "@/app/admin/actions";
import { ConfirmButton } from "../ConfirmButton";
import { evaluateIndexability } from "@/lib/collections";
import { findProductsByFilter } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const collections = await prisma.collection.findMany({ orderBy: { position: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } });
  const editing = edit ? collections.find((c) => c.id === edit) : undefined;

  // Live indexability verdict per collection (same guard the storefront uses).
  const verdicts = await Promise.all(
    collections.map(async (c) => {
      const products = await findProductsByFilter({
        categorySlug: c.filterCategorySlug ?? undefined,
        brandSlug: c.filterBrandSlug ?? undefined,
        color: c.filterColor ?? undefined,
        maxPriceInPaise: c.filterMaxPriceInPaise ?? undefined,
      });
      const { indexable, reasons } = evaluateIndexability({ intro: c.intro, productCount: products.length });
      return { id: c.id, count: products.length, indexable, reasons };
    }),
  );
  const vmap = new Map(verdicts.map((v) => [v.id, v]));

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", marginBottom: "1.5rem" }}>Collections</h1>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "2rem", alignItems: "start" }}>
        <form action={saveCollection} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>{editing ? "Edit collection" : "New collection"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <L>Title<input name="title" defaultValue={editing?.title} required style={input} /></L>
          <L>Slug<input name="slug" defaultValue={editing?.slug} placeholder="auto from title" style={input} /></L>
          <L>Intro<textarea name="intro" defaultValue={editing?.intro ?? ""} rows={4} style={{ ...input, resize: "vertical" }} /><span style={hint}>≥120 chars of unique copy to be indexable.</span></L>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#78716c", margin: "0.5rem 0" }}>Filter (defines the product set)</p>
          <L>Category
            <select name="filterCategorySlug" defaultValue={editing?.filterCategorySlug ?? ""} style={input}>
              <option value="">— any</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </L>
          <L>Color<input name="filterColor" defaultValue={editing?.filterColor ?? ""} placeholder="e.g. White Gold" style={input} /></L>
          <L>Max price (paise)<input name="filterMaxPriceInPaise" type="number" defaultValue={editing?.filterMaxPriceInPaise ?? ""} style={input} /></L>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" style={btnDark}>{editing ? "Save" : "Add collection"}</button>
            {editing && <Link href="/admin/collections" style={btnGhost}>Cancel</Link>}
          </div>
        </form>

        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead><tr style={{ background: "#faf8f5", textAlign: "left" }}><th style={th}>Title</th><th style={th}>Products</th><th style={th}>Indexable</th><th style={th}></th></tr></thead>
            <tbody>
              {collections.map((c) => {
                const v = vmap.get(c.id);
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f5f5f4" }}>
                    <td style={td}>{c.title}<div style={{ color: "#a8a29e", fontSize: "0.75rem" }}>/c/{c.slug}</div></td>
                    <td style={td}>{v?.count ?? 0}</td>
                    <td style={td}>
                      {v?.indexable
                        ? <span style={{ color: "#16a34a" }}>✓ Indexed</span>
                        : <span style={{ color: "#d97706" }} title={v?.reasons.join("; ")}>noindex</span>}
                    </td>
                    <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <Link href={`/admin/collections?edit=${c.id}`} style={{ color: "#2563eb", textDecoration: "none", marginRight: "1rem" }}>Edit</Link>
                      <form action={deleteCollection} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton message={`Delete collection "${c.title}"?`} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.88rem", padding: 0 }}>Delete</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {collections.length === 0 && <p style={{ padding: "2rem", textAlign: "center", color: "#a8a29e" }}>No collections yet.</p>}
        </div>
      </div>
    </div>
  );
}

function L({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#44403c", marginBottom: "0.8rem" }}>{children}</label>;
}
const input: React.CSSProperties = { width: "100%", marginTop: "0.3rem", padding: "0.55rem 0.7rem", border: "1px solid #d6d3d1", borderRadius: 8, background: "#fff", fontSize: "0.9rem", outline: "none" };
const hint: React.CSSProperties = { display: "block", fontSize: "0.72rem", color: "#a8a29e", marginTop: "0.25rem" };
const th: React.CSSProperties = { padding: "0.7rem 1rem", fontWeight: 600, fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#78716c" };
const td: React.CSSProperties = { padding: "0.7rem 1rem", verticalAlign: "top" };
const btnDark: React.CSSProperties = { padding: "0.6rem 1.1rem", background: "#1c1917", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.88rem" };
const btnGhost: React.CSSProperties = { padding: "0.6rem 1.1rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, textDecoration: "none", fontSize: "0.88rem" };
