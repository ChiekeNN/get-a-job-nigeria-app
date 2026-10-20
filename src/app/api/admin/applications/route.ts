import { findDatabaseUrlVar } from "@/db";
import { isAdmin } from "@/lib/admin";
import {
  applicationTotals,
  ensureApplicationsSchema,
  listApplications,
} from "@/lib/applications";
import { throttleSummary } from "@/lib/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything the applications console renders, in one round trip. */
export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  if (!findDatabaseUrlVar()) {
    return Response.json(
      { ok: false, message: "No database is attached to this deployment." },
      { status: 503 },
    );
  }

  try {
    await ensureApplicationsSchema();
    const [applications, totals, throttle] = await Promise.all([
      listApplications(),
      applicationTotals(),
      throttleSummary(),
    ]);
    return Response.json({ ok: true, totals, applications, throttle });
  } catch (error) {
    console.error("[admin/applications] could not read applications", error);
    return Response.json(
      { ok: false, message: "The applications table could not be read just now." },
      { status: 500 },
    );
  }
}
