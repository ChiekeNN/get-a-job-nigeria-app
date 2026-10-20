import { isAdmin } from "@/lib/admin";
import {
  deleteApplication,
  deleteApplicationsByPerson,
  ensureApplicationsSchema,
} from "@/lib/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Delete an application.
 *
 * `?scope=person` removes every application from the same email address — the
 * "delete the job seeker, not just this row" action. The CV lives on the same
 * row, so deleting the record deletes the file with it.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  const { id } = await params;
  const applicationId = Number(id);
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return Response.json({ ok: false, message: "Unknown application." }, { status: 400 });
  }

  const scope = new URL(request.url).searchParams.get("scope") === "person" ? "person" : "one";

  try {
    await ensureApplicationsSchema();
    const result =
      scope === "person"
        ? await deleteApplicationsByPerson(applicationId)
        : await deleteApplication(applicationId);

    if (result.deleted === 0) {
      return Response.json({ ok: false, message: "That application is already gone." }, { status: 404 });
    }

    console.log(
      `[admin/applications] deleted ${result.deleted} application(s) for ${result.person ?? "unknown"}`,
    );
    return Response.json({ ok: true, scope, ...result });
  } catch (error) {
    console.error("[admin/applications] delete failed", error);
    return Response.json(
      { ok: false, message: "The application could not be deleted just now." },
      { status: 500 },
    );
  }
}
