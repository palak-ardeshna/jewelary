import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Emit a static robots.txt file during `output: export`.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Faceted/search URLs are crawl traps — keep them out to preserve crawl budget.
      disallow: ["/search", "/cart", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
