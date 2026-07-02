import type { Metadata } from "next";

// The demo admin must never be indexed or advertised. It's a per-browser
// preview tool, not a real multi-user dashboard (static export — no backend).
export const metadata: Metadata = {
  title: "Engagement Admin (Demo)",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
