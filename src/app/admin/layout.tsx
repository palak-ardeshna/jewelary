import type { Metadata } from "next";

// Admin must never be indexed. Real server-side auth guards the (dash) group;
// the login route sits outside it.
export const metadata: Metadata = {
  title: "Aurelia Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
