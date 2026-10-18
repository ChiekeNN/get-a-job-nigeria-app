import { sql } from "drizzle-orm";

import { DATABASE_URL_VARS, db, findDatabaseUrlVar } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Health check that explains itself.
 *
 * A bare `{ok:false}` tells you nothing: a missing connection string, a bad
 * password, an unmigrated database and a blocked network all look identical.
 * This reports which of those it is, without ever echoing the secret.
 */
/** Drizzle wraps driver failures, so dig out the cause that actually explains it. */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof Error && cause.message) return `${error.message} — ${cause.message}`;
  return error.message;
}

export async function GET() {
  const found = findDatabaseUrlVar();

  if (!found) {
    return Response.json(
      {
        ok: false,
        reason: "no_connection_string",
        message:
          "No database connection string is set in the runtime environment. Add one of the variables below in Vercel and redeploy.",
        acceptedVariables: [...DATABASE_URL_VARS],
      },
      { status: 500 },
    );
  }

  // Show only enough to recognise the target — never the password.
  let target = "unknown";
  try {
    const url = new URL(found.value);
    target = `${url.hostname}${url.port ? `:${url.port}` : ""}/${url.pathname.replace(/^\//, "")}`;
  } catch {
    target = "malformed";
  }

  const base = { variable: found.name, target };

  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        ...base,
        reason: "connection_failed",
        message:
          "A connection string is present but the database refused the connection. Check the password, host, and that the database allows connections from Vercel.",
        error: describeError(error),
      },
      { status: 500 },
    );
  }

  try {
    const rows = await db.execute<{ count: number }>(
      sql`select count(*)::int as count from jobs`,
    );
    const total = Number(rows.rows?.[0]?.count ?? 0);

    return Response.json({
      ok: true,
      ...base,
      tablesReady: true,
      jobs: total,
      message: total === 0 ? "Connected, but no jobs are stored yet. Run the import." : "Connected.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        ...base,
        reason: "tables_missing",
        message:
          "Connected, but the jobs table does not exist. Run `npx drizzle-kit push` against this database.",
        error: describeError(error),
      },
      { status: 500 },
    );
  }
}
