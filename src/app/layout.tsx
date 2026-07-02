import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema-org";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { RouteProgress } from "@/components/RouteProgress";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteChrome } from "@/components/SiteChrome";
import { EngagementProvider } from "@/components/engagement/EngagementProvider";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600", "700"], variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body style={{ fontFamily: "var(--font-inter, Inter), ui-sans-serif, system-ui, sans-serif" }}>
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <CartProvider>
          <RouteProgress />
          <ScrollReveal />

          <SiteChrome>{children}</SiteChrome>

          <CartDrawer />
          <EngagementProvider />
        </CartProvider>
      </body>
    </html>
  );
}
