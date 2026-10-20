import { isAdmin } from "@/lib/admin";
import { readTrafficReport } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in to the admin console first" }, { status: 401 });
  }

  try {
    const report = await readTrafficReport();
    return Response.json({ ok: true, ...report });
  } catch (error) {
    console.error("[admin] traffic report failed", error);
    return Response.json(
      { ok: false, message: "Could not read traffic data — check the database connection" },
      { status: 503 },
    );
  }
}
