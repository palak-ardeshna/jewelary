// Next.js runs register() once when the server process boots. We use it to load
// seed data into the database on server start — "when the server loads, load
// that data" — so a fresh clone works with just `npm run dev`.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSeeded } = await import("@/server/seed");
    try {
      await ensureSeeded();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[instrumentation] seeding failed:", err);
    }
  }
}
