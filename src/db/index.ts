import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type Database = NodePgDatabase<Record<string, never>> & { $client: Pool };

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: Database;
};

/**
 * Resolve the connection string lazily.
 *
 * Next.js imports route handlers while collecting page data during `next build`,
 * and build environments often do not expose runtime secrets such as
 * DATABASE_URL. Throwing at module scope breaks the build even though every
 * route is `force-dynamic`; throwing on first use keeps the failure at runtime
 * with a clear message instead.
 */
function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Set it in the runtime environment before starting the app.",
    );
  }

  return databaseUrl;
}

export function getPool(): Pool {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalForDb.__arenaNextJsPostgresqlPool;
}

export function getDb(): Database {
  if (!globalForDb.__arenaNextJsPostgresqlDb) {
    globalForDb.__arenaNextJsPostgresqlDb = drizzle(getPool());
  }

  return globalForDb.__arenaNextJsPostgresqlDb;
}

/**
 * Lazily-initialised Drizzle client. Importing this module is side-effect free,
 * so builds work without DATABASE_URL; the connection is created on first query.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, property) {
    const instance = getDb();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
