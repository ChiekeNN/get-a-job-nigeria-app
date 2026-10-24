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

/**
 * Restore libpq's meaning of `sslmode=require`.
 *
 * libpq — and therefore every hosted provider that publishes `?sslmode=require`
 * in its documentation, Supabase included — defines `require` as "the
 * connection must be encrypted, but the certificate chain is not validated
 * against a public root", unless `sslrootcert` is also supplied. node-postgres
 * used to agree. Since pg-connection-string 2.13 it treats `require` as an
 * alias for `verify-full`, so connecting to a provider that signs with its own
 * CA aborts during the handshake with
 * `self-signed certificate in certificate chain`, before a single query runs.
 *
 * The driver documents its own migration path for exactly this, and prints it
 * as a deprecation warning: `uselibpqcompat=true`. Verified against
 * pg-connection-string 2.14.1 —
 *
 *   sslmode=require                        -> ssl.rejectUnauthorized undefined
 *   sslmode=require&uselibpqcompat=true    -> ssl.rejectUnauthorized false
 *   sslmode=verify-full&uselibpqcompat=true-> ssl.rejectUnauthorized undefined
 *
 * — so appending the flag restores the old behaviour for `require`/`prefer`
 * while leaving `verify-full` strict. Anything else is passed through untouched,
 * including a connection string that already sets the flag or pins a CA with
 * `sslrootcert`, so an operator who wants full verification keeps it.
 *
 * The flag is appended to the query string rather than the URL being rebuilt
 * through `new URL()`, so the rest of the string — notably an encoded
 * password — passes through byte for byte.
 */
export function applyLibpqSslSemantics(rawUrl: string): string {
  if (/[?&]uselibpqcompat=/i.test(rawUrl)) return rawUrl;
  // A pinned CA means the operator has opted into real verification; appending
  // the flag would downgrade `require` from verify-full to verify-ca.
  if (/[?&]sslrootcert=/i.test(rawUrl)) return rawUrl;

  const mode = /[?&]sslmode=([^&#]*)/i.exec(rawUrl)?.[1]?.trim().toLowerCase();
  if (mode !== "require" && mode !== "prefer") return rawUrl;

  const hashAt = rawUrl.indexOf("#");
  const head = hashAt === -1 ? rawUrl : rawUrl.slice(0, hashAt);
  const tail = hashAt === -1 ? "" : rawUrl.slice(hashAt);

  return `${head}${head.includes("?") ? "&" : "?"}uselibpqcompat=true${tail}`;
}

export function getPool(): Pool {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: applyLibpqSslSemantics(getDatabaseUrl()),
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
