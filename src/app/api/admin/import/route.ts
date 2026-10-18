import { runImport } from "@/lib/importer/run";

/**
 * Import endpoint.
 *
 * Called by the Vercel cron in vercel.json, or manually:
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

async function handle(request: Request) {
  if (!authorised(request)) {
    return Response.json({ ok: false, message: "Not authorised" }, { status: 401 });
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
