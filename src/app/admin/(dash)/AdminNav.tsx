"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▚" },
  { href: "/admin/orders", label: "Orders · ઓર્ડર", icon: "▤" },
  { href: "/admin/products", label: "Products", icon: "◈" },
  { href: "/admin/categories", label: "Categories", icon: "❏" },
  { href: "/admin/collections", label: "Collections", icon: "❐" },
  { href: "/admin/ads", label: "Ads", icon: "◨" },
  { href: "/admin/engagement", label: "Engagement", icon: "✦" },
  { href: "/admin/guide", label: "Guide · માર્ગદર્શિકા", icon: "?" },
];

export function AdminNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{
              display: "flex", alignItems: "center", gap: "0.65rem",
              padding: "0.6rem 0.75rem", borderRadius: 8, textDecoration: "none",
              fontSize: "0.9rem",
              color: active ? "#fff" : "#d6d3d1",
              background: active ? "#44403c" : "transparent",
              fontWeight: active ? 600 : 400,
              borderLeft: active ? "3px solid #d4af37" : "3px solid transparent",
            }}
          >
            <span aria-hidden style={{ width: 16, textAlign: "center", color: active ? "#d4af37" : "#78716c", fontSize: "0.85rem" }}>{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
