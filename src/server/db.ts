// Prisma client singleton. In dev, Next.js hot-reload would otherwise create a
// new client on every reload and exhaust connections — cache it on globalThis.
//
// IMPORTANT: this app uses the Prisma **driver adapter** (`@prisma/adapter-pg`,
// a pure-JS Postgres driver) instead of Prisma's default Rust query engine. On
// restricted shared hosting (e.g. Hostinger's Node runtime) the Rust engine
// panics on start with "PANIC: timer has gone away" — its internal tokio timer
// can't be scheduled inside the sandbox. The JS adapter has no Rust engine and
// no such timer, so it runs where the engine can't.
//
// A retry-on-transient wrapper is kept for genuinely intermittent connection
// drops (the app talks to a remote Postgres over a public proxy).
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Transient DB/connection failures worth retrying (vs. real query errors). */
function isRetryable(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /Server has closed the connection|connection closed|connection reset|ECONNRESET|ETIMEDOUT|Timed out|Can't reach database server|terminating connection/i.test(
    msg,
  );
}

function createClient(): PrismaClient {
  // Pure-JS Postgres driver — no Rust engine. `connectionString` is a standard
  // pg.PoolConfig; DATABASE_URL supplies the Railway Postgres URL.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  const extended = base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const MAX_ATTEMPTS = 4;
        let lastErr: unknown;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            lastErr = err;
            if (attempt === MAX_ATTEMPTS || !isRetryable(err)) throw err;
            await sleep(200 * attempt); // 200ms, 400ms, 600ms backoff
          }
        }
        throw lastErr;
      },
    },
  });

  // The extended client keeps every model delegate; cast back to PrismaClient so
  // existing `import { prisma }` call sites type-check unchanged.
  return extended as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
