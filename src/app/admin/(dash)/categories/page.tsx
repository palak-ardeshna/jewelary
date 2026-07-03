import Link from "next/link";
import { prisma } from "@/server/db";
import { saveCategory, deleteCategory } from "@/app/admin/actions";
import { ConfirmButton } from "../ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { name: "asc" }] });
  const counts = await prisma.product.groupBy({ by: ["categoryId"], _count: true });
  const countMap = new Map(counts.map((c) => [c.categoryId, c._count]));
  const editing = edit ? categories.find((c) => c.id === edit) : undefined;
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", marginBottom: "1.5rem" }}>Categories</h1>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Create / edit form */}
        <form action={saveCategory} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>{editing ? "Edit category" : "New category"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <L>Name<input name="name" defaultValue={editing?.name} required style={input} /></L>
          <L>Slug<input name="slug" defaultValue={editing?.slug} placeholder="auto from name" style={input} /></L>
          <L>Description<textarea name="description" defaultValue={editing?.description ?? ""} rows={3} style={{ ...input, resize: "vertical" }} /></L>
          <L>Parent
            <select name="parentId" defaultValue={editing?.parentId ?? ""} style={input}>
              <option value="">— none (top-level)</option>
              {categories.filter((c) => c.id !== editing?.id && !c.parentId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </L>
          <L>Position<input name="position" type="number" defaultValue={editing?.position ?? 0} style={input} /></L>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" style={btnDark}>{editing ? "Save" : "Add category"}</button>
            {editing && <Link href="/admin/categories" style={btnGhost}>Cancel</Link>}
          </div>
        </form>

        {/* List */}
        <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead><tr style={{ background: "#faf8f5", textAlign: "left" }}><th style={th}>Name</th><th style={th}>Parent</th><th style={th}>Products</th><th style={th}></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #f5f5f4" }}>
                  <td style={td}>{c.name}<div style={{ color: "#a8a29e", fontSize: "0.75rem" }}>/{c.slug}</div></td>
                  <td style={td}>{c.parentId ? byId.get(c.parentId)?.name ?? "—" : "—"}</td>
                  <td style={td}>{countMap.get(c.id) ?? 0}</td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <Link href={`/admin/categories?edit=${c.id}`} style={{ color: "#2563eb", textDecoration: "none", marginRight: "1rem" }}>Edit</Link>
                    <form action={deleteCategory} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmButton disabled={(countMap.get(c.id) ?? 0) > 0} title={(countMap.get(c.id) ?? 0) > 0 ? "Has products — reassign first" : "Delete"} message={`Delete category "${c.name}"?`} style={{ background: "none", border: "none", color: (countMap.get(c.id) ?? 0) > 0 ? "#d6d3d1" : "#dc2626", cursor: (countMap.get(c.id) ?? 0) > 0 ? "not-allowed" : "pointer", fontSize: "0.88rem", padding: 0 }}>Delete</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function L({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#44403c", marginBottom: "0.8rem" }}>{children}</label>;
}
const input: React.CSSProperties = { width: "100%", marginTop: "0.3rem", padding: "0.55rem 0.7rem", border: "1px solid #d6d3d1", borderRadius: 8, background: "#fff", fontSize: "0.9rem", outline: "none" };
const th: React.CSSProperties = { padding: "0.7rem 1rem", fontWeight: 600, fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#78716c" };
const td: React.CSSProperties = { padding: "0.7rem 1rem", verticalAlign: "top" };
const btnDark: React.CSSProperties = { padding: "0.6rem 1.1rem", background: "#1c1917", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.88rem" };
const btnGhost: React.CSSProperties = { padding: "0.6rem 1.1rem", background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: 8, textDecoration: "none", fontSize: "0.88rem" };
