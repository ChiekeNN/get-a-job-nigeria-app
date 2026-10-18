import { findDatabaseUrlVar } from "@/db";
import { runImport } from "@/lib/importer/run";

/**
 * Import endpoint.
 *
 * Triggered eight times a day by the crons in vercel.json. Each run sweeps a
 * slice of the listing pages and stores a cursor, so the eight runs together
 * cover a full backfill without any single invocation running long. Manual use:
 *   curl -X POST "https://<your-domain>/api/admin/import?limit=5&dryRun=1" \
 *        -H "x-import-secret: $IMPORT_SECRET"
 *
 * `dryRun=1` parses and reports without writing anything — use it to sanity
 * check the parser before the first real run.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorised(request: Request): boolean {
  const secrets = [process.env.IMPORT_SECRET, process.env.CRON_SECRET].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  // No secret configured: allow Vercel's cron runner only, never anonymous traffic.
  if (secrets.length === 0) return request.headers.get("user-agent")?.includes("vercel-cron") ?? false;

  const provided =
    request.headers.get("x-import-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  return secrets.includes(provided);
}

/**
 * Explain *why* a request was rejected. "Not authorised" is useless when the
 * real cause is usually one of two very different things: the deployment has no
 * secret configured at all, or the caller sent the placeholder instead of the
 * real value. The secret itself is never echoed.
 */
function authorisationFailure(request: Request) {
  const secrets = [process.env.IMPORT_SECRET, process.env.CRON_SECRET].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  const provided =
    request.headers.get("x-import-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  if (secrets.length === 0) {
    return {
      ok: false,
      reason: "no_secret_configured",
      message:
        "This deployment has no IMPORT_SECRET set, so only Vercel's own cron runner may call it. " +
        "Add IMPORT_SECRET in Vercel → Settings → Environment Variables, then redeploy.",
      secretConfigured: false,
    };
  }

  if (!provided) {
    return {
      ok: false,
      reason: "no_secret_sent",
      message:
        'No secret was sent. Add -H "x-import-secret: <value>" to the request.',
      secretConfigured: true,
    };
  }

  if (/^your[_-]?import[_-]?secret$/i.test(provided) || provided.toLowerCase() === "change-me") {
    return {
      ok: false,
      reason: "placeholder_secret",
      message:
        'The value sent is the placeholder "YOUR_IMPORT_SECRET", not your real secret. ' +
        "Copy the actual value from Vercel → Settings → Environment Variables → IMPORT_SECRET.",
      secretConfigured: true,
    };
  }

  return {
    ok: false,
    reason: "secret_mismatch",
    message:
      "The secret sent does not match IMPORT_SECRET or CRON_SECRET in this deployment. " +
      "Check for stray spaces or quotes, and redeploy if you changed the variable recently.",
    secretConfigured: true,
    receivedLength: provided.length,
  };
}

async function handle(request: Request) {
  if (!authorised(request)) {
    return Response.json(authorisationFailure(request), { status: 401 });
  }

  // Fail with a usable message instead of a raw 500 when no database is attached.
  const database = findDatabaseUrlVar();
  if (!database) {
    return Response.json(
      {
        ok: false,
        reason: "no_connection_string",
        message:
          "Cannot import: no database is configured. Add DATABASE_URL (or POSTGRES_URL) in Vercel, run the migration, then trigger the import again.",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const dryRun = ["1", "true", "yes"].includes((searchParams.get("dryRun") ?? "").toLowerCase());
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);

  try {
    const result = await runImport({
      dryRun,
      limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
    });

    console.log(
      `[import] candidates=${result.counts.candidates} new=${result.counts.passedFilters} ` +
        `inserted=${result.counts.inserted} expired=${result.counts.expired} failed=${result.counts.failed}`,
    );

    return Response.json(result, { status: result.blocked ? 424 : 200 });
  } catch (error) {
    console.error("[import] run failed", error);
    return Response.json(
      {
        ok: false,
        message: "Import run failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
