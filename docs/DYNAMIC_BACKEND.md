# Dynamic Backend (Prisma + SQLite) — Setup & Design

The storefront was a static export off an in-memory array. It now runs on a Node
server backed by a **Prisma + SQLite** database, with a real admin panel that
does live CRUD. This doc is the practical guide; the bigger target architecture
is in [`BACKEND_BLUEPRINT.md`](./BACKEND_BLUEPRINT.md).

## Quick start

```bash
npm install          # postinstall runs `prisma generate`
npm run dev          # predev runs `prisma db push`; server auto-seeds on start
# → http://localhost:3000        storefront (dynamic, reads the DB)
# → http://localhost:3000/admin  admin panel (redirects to /admin/login)
```

Admin credentials come from `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`, default
`admin` / `aurelia2026`). Copy `.env.example` → `.env` if you don't have one.

Useful scripts: `npm run db:studio` (browse data), `npm run db:reset` (wipe +
re-seed), `npm run db:push` (sync schema).

## How the pieces fit

| Concern | File | Notes |
|---|---|---|
| Active schema | [`prisma/dev.prisma`](../prisma/dev.prisma) | SQLite; catalog subset of the canonical model |
| Canonical schema | [`prisma/schema.prisma`](../prisma/schema.prisma) | Postgres source-of-truth (not run) |
| Prisma client | [`src/server/db.ts`](../src/server/db.ts) | singleton (survives HMR) |
| Repository | [`src/data/store.ts`](../src/data/store.ts) | async query helpers — the only code that touches Prisma |
| Shared types | [`src/lib/catalog-types.ts`](../src/lib/catalog-types.ts) | client-safe (no server imports) |
| Client fetchers | [`src/lib/catalog-client.ts`](../src/lib/catalog-client.ts) | `/api/catalog`, `/api/search` |
| Seed data | [`src/server/seed-data.ts`](../src/server/seed-data.ts) | the catalogue that used to be inline in store.ts |
| Auto-seed | [`src/server/seed.ts`](../src/server/seed.ts) + [`src/instrumentation.ts`](../src/instrumentation.ts) | idempotent; loads on server start if the DB is empty |
| Admin auth | [`src/server/auth.ts`](../src/server/auth.ts) | scrypt password hash + HMAC-signed HttpOnly cookie |
| Route guard | [`src/middleware.ts`](../src/middleware.ts) | Edge; hard 307 to `/admin/login` when unauthenticated |
| Admin CRUD | [`src/app/admin/`](../src/app/admin) | server components + server actions in `actions.ts` |

## Design decisions (the *why*)

- **Repository seam preserved.** Every route/component still calls
  `getProductBySlug`, `findProductsByFilter`, etc. — now `async` and Prisma-backed.
  Swapping the data source stayed a one-file change, exactly as designed.
- **SQLite, not Postgres, for local dev.** Zero infra: `npm run dev` just works, DB
  is a file. Because SQLite lacks enums/arrays/JSON columns, list/object fields are
  stored as JSON strings and (de)serialised in the repository. Moving to Postgres
  later means pointing Prisma at the canonical schema and re-running the mappers.
- **Auto-seed on server start**, via Next's `instrumentation.register()`. "When the
  server loads, load the data" — a fresh clone is populated with one command. The
  seeder is idempotent (only inserts when the product table is empty) and also
  ensures the admin user exists.
- **Real admin auth, not the old client gate.** The previous `/admin` shipped
  credentials in the JS bundle and gated on `sessionStorage` — not security.
  Now: passwords are scrypt-hashed in the DB, the session is an HMAC-signed
  HttpOnly cookie (secret server-side only), and **middleware** enforces it before
  any rendering (a `redirect()` thrown from the nested admin layout streams too
  late once the root layout has flushed, so it can't be the primary guard).
- **Dynamic storefront.** Catalog pages are `dynamic = "force-dynamic"` so an admin
  edit shows immediately (verified: a DB price change appears on the PDP and
  `/api/catalog` with no restart). Server actions also `revalidatePath` the
  affected routes.

## Scope & what's next

This pass covers the **catalog**: products, categories, collections, brands,
reviews — dynamic storefront + admin CRUD + auth + seed. Deliberately **not** yet
built (still client-side / mock): cart, checkout, orders, user accounts, and the
engagement config store (the editor at `/admin/engagement` still uses its original
localStorage/`config.ts` persistence). Those are the next milestones — see
[`BACKEND_BLUEPRINT.md`](./BACKEND_BLUEPRINT.md) §Phase 3–5 for the server cart,
checkout-with-price-recompute, and orders design.
