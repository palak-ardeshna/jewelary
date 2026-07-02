"use client";
// /admin — auth gate. Shows the login screen until a valid session exists, then
// swaps in the sidebar dashboard. Static build: session is client-side only
// (sessionStorage) and credentials come from NEXT_PUBLIC_ADMIN_* — a convenience
// gate, not real security. See docs/engagement.md.
import { useEffect, useState } from "react";
import "@/components/engagement/engagement.css";
import { isAuthed } from "@/lib/engagement/adminAuth";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => { setAuthed(isAuthed()); setReady(true); }, []);

  // Dark full-viewport placeholder until the session check resolves — avoids a
  // white flash and any flash of the login form for already-signed-in admins.
  if (!ready) return <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#1c1917" }} />;

  return authed
    ? <AdminDashboard onLogout={() => setAuthed(false)} />
    : <AdminLogin onSuccess={() => setAuthed(true)} />;
}
