import { findDatabaseUrlVar } from "@/db";
import { isAdmin } from "@/lib/admin";
import { IMPORT_CONFIG } from "@/lib/importer/config";
import { runImport } from "@/lib/importer/run";

/**
 * Two-week top-up.
 *
 * Walks the source archive newest-first and keeps every listing posted inside
 * the window (`?days=`, default 15 → the last two weeks). It has its own
 * cursor, so the eight daily sweeps are completely unaffected: they keep their
 * own position and their RSS feed, and a backfill run never touches either.
 *
 * One call imports one slice (a few hundred listings) and returns where it got
 * to. Call it again to continue; `complete: true` means the archive is now
 * older than the window and there is nothing left to pull.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorisedByKey(request: Request): boolean {
  const secrets = [process.env.IMPORT_SECRET, process.env.CRON_SECRET].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  if (secrets.length === 0) return false;
  const provided =
    request.headers.get("x-import-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(request.url).searchParams.get("key") ??
    "";
  return secrets.includes(provided);
}

async function handle(request: Request) {
  // The console calls this with its cookie; scripts pass the import key.
  if (!(await isAdmin()) && !authorisedByKey(request)) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  if (!findDatabaseUrlVar()) {
    return Response.json(
      { ok: false, message: "No database is attached to this deployment." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const requested = Number.parseInt(searchParams.get("days") ?? "", 10);
  const days =
    Number.isFinite(requested) && requested > 0
      ? Math.min(requested, 60)
      : IMPORT_CONFIG.backfill.windowDays;

  try {
    const result = await runImport({ backfillDays: days });
    const cursor = result.cursors?.[`Backfill (${days}d)`];
    return Response.json({
      ok: result.ok,
      days,
      candidates: result.counts.candidates,
      inserted: result.counts.inserted,
      fetched: result.counts.fetched,
      expanded: result.counts.expanded,
      skipped: result.counts.skipped,
      failed: result.counts.failed,
      alreadyImported: result.counts.alreadyImported,
      cursor: cursor ?? null,
      complete: result.backfillComplete === true,
      truncated: result.truncated === true,
      errors: result.errors.slice(0, 6),
    });
  } catch (error) {
    console.error("[backfill] run failed", error);
    return Response.json(
      {
        ok: false,
        message: "The backfill run failed.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
