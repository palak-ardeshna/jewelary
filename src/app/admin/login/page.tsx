"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) { router.push("/admin"); router.refresh(); }
      else setErr(data.error ?? "Login failed");
    } catch {
      setErr("Network error");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#1c1917", color: "#fff", padding: "2rem" }}>
      <form onSubmit={submit} style={{ width: "min(380px, 100%)", background: "#292524", border: "1px solid #44403c", borderRadius: 12, padding: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.8rem", marginBottom: "0.25rem" }}>Aurelia Admin</h1>
        <p style={{ color: "#a8a29e", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Sign in to manage the catalogue.</p>

        <label style={{ display: "block", fontSize: "0.8rem", color: "#d6d3d1", marginBottom: "0.35rem" }}>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus
          style={inputStyle} />

        <label style={{ display: "block", fontSize: "0.8rem", color: "#d6d3d1", margin: "1rem 0 0.35rem" }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          style={inputStyle} />

        {err && <p style={{ color: "#fca5a5", fontSize: "0.8rem", marginTop: "0.75rem" }}>{err}</p>}

        <button type="submit" disabled={loading}
          style={{ width: "100%", marginTop: "1.5rem", padding: "0.75rem", background: "#d4af37", color: "#1c1917", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p style={{ color: "#78716c", fontSize: "0.72rem", marginTop: "1rem", textAlign: "center" }}>
          Default: admin / aurelia2026 (set ADMIN_USERNAME / ADMIN_PASSWORD in .env)
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.8rem", background: "#1c1917",
  border: "1px solid #57534e", borderRadius: 8, color: "#fff", outline: "none", fontSize: "0.95rem",
};
