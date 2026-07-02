"use client";
// Mounts the site-wide, always-on engagement widgets. Placed inside CartProvider
// (in the root layout) so its children can read cart state. Page-scoped widgets
// (sticky ATC, cross-sell, low stock, rails, recently-viewed) are mounted on the
// pages that need them, not here.
import "./engagement.css";
import { usePathname } from "next/navigation";
import { useEngagementConfig } from "@/lib/engagement/useEngagementConfig";
import { PopupManager } from "./PopupManager";
import { SocialProofToasts } from "./SocialProofToasts";

export function EngagementProvider() {
  const config = useEngagementConfig();
  const pathname = usePathname();
  // Never run storefront engagement widgets over the admin dashboard.
  if (pathname?.startsWith("/admin")) return null;
  if (!config.masterEnabled) return null;
  return (
    <>
      <PopupManager />
      <SocialProofToasts />
    </>
  );
}
