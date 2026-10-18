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
/**
 * Vercel database integrations do not all name the variable the same way.
 * Neon and Vercel Postgres usually set DATABASE_URL, while Supabase and others
 * set POSTGRES_URL / POSTGRES_PRISMA_URL. Accept any of them so attaching a
 * database works without hand-copying a connection string.
 */
export const DATABASE_URL_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "NEON_DATABASE_URL",
] as const;

/** Which recognised variable holds a connection string, if any. */
export function findDatabaseUrlVar(): { name: string; value: string } | null {
  for (const name of DATABASE_URL_VARS) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim().length > 0) {
      return { name, value: value.trim() };
    }
  }
  return null;
}

function getDatabaseUrl(): string {
  const found = findDatabaseUrlVar();

  if (!found) {
    throw new Error(
      `No database connection string. Set one of: ${DATABASE_URL_VARS.join(", ")}.`,
    );
  }

  return found.value;
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
