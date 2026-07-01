# Aurelia — Delivery Roadmap (12 Phases)

Two tracks (see [ARCHITECTURE.md](./ARCHITECTURE.md)):
**A = Storefront (static, Hostinger, ships now)** ·
**B = Business OS (full-stack, needs Node host + Postgres)**.

Legend: ✅ done · 🟡 in progress · ⬜ planned · 🔒 blocked on infra (Track B host)

| # | Phase | Track | Status | Key deliverables |
|---|---|---|---|---|
| 1 | Research | A | ✅ | Brand positioning (Aurelia), competitor teardown (CaratLane/Tanishq/Mejuri/Cartier), jewellery-specific requirements (certification, composed pricing, trust) → `ARCHITECTURE.md §1` |
| 2 | Architecture | A/B | ✅ | Two-track model, repository boundary, C4 context, module structure, cross-cutting concerns, phase reviews → `ARCHITECTURE.md` |
| 3 | Database | A/B | ✅ | Canonical `prisma/schema.prisma` (43 entities); TS mirror in `store.ts` |
| 4 | Design System | A | ⬜ | Luxury tokens (done as foundation), full shadcn/ui component library, typography scale (serif display + sans body), motion system (Framer Motion), iconography |
| 5 | Frontend (Storefront) | A | 🟡 | Jewellery catalogue + brand shipped now. Next: homepage sections, collection/category filters, PDP gallery/360, wishlist, gifting, appointment CTA, mobile UX |
| 6 | Backend | B | 🔒 | Prisma repositories, server actions, checkout with **server-side price recompute**, Razorpay/Stripe/PayPal + signed webhooks, cart→order, shipping/tax/coupon engines |
| 7 | Admin (Business OS) | B | 🔒 | Dashboard, products/variants, inventory/warehouse, orders, customers, reviews, coupons, RBAC, audit logs, settings |
| 8 | CMS & Builders | B | 🔒 | Media library, homepage/theme/navigation/footer builders, CMS pages, blog, forms, email/WhatsApp/SMS templates |
| 9 | AI Center | B | 🔒 | Claude-powered: stylist, gift finder, product descriptions, SEO, chat, recommendations, inventory/sales forecast, blog/email/WhatsApp generators, product tagging, AI search |
| 10 | Testing | A/B | ⬜ | Unit (pricing, indexability), integration (checkout), e2e (Playwright), a11y (axe), visual regression, load |
| 11 | Optimization | A/B | ⬜ | Core Web Vitals, image pipeline, caching/ISR, bundle budget, SEO audit, schema validation |
| 12 | Deployment | A/B | 🟡 | A: static export → Hostinger via lftp (live). B: Vercel/Railway + Neon + Upstash + CI/CD, migrations, observability, backups |

## Immediate next steps (recommended order)

1. **Phase 4/5 continue on Track A** (no infra needed): build the luxury
   design-system components and refined storefront pages against the jewellery
   data already in `store.ts`. Fully shippable to Hostinger.
2. **Decide Track B host.** Nothing in Phases 6–9 can run on static hosting.
   Once a Node host + Postgres exist, `prisma migrate` the schema and swap
   `store.ts` bodies to Prisma repositories — routes are untouched.
3. **Real assets & data.** Replace Unsplash placeholders with product
   photography and load the true catalogue (via Admin once Track B lands).

## Definition of Done per phase

Each phase is "locked" only after its seven reviews pass (Architecture, UX,
Security, Performance, SEO, Accessibility, Business) — see the review table
pattern in `ARCHITECTURE.md §6`. Phases 1–3 are locked.
