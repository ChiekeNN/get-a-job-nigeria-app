import { isAdmin } from "@/lib/admin";
import { ensureApplicationsSchema, getApplicationCv } from "@/lib/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function extensionOf(filename: string | null, mime: string | null): string {
  const match = /\.([a-z0-9]{2,5})$/i.exec(filename ?? "");
  const fromName = match?.[1]?.toLowerCase();
  if (fromName && TYPES[fromName]) return fromName;
  const fromMime = Object.entries(TYPES).find(([, type]) => type === mime)?.[0];
  return fromMime ?? "pdf";
}

/** Readable in a downloads folder: "CV - Ada Obi - Accountant.pdf". */
function downloadName(fullName: string, jobTitle: string | null, extension: string): string {
  const base = `CV - ${fullName}${jobTitle ? ` - ${jobTitle}` : ""}`
    .replace(/[^\w .\-()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
  return `${base || "CV"}.${extension}`;
}

/**
 * Serve one candidate's CV.
 *
 * The file is never public: this route checks the admin cookie first and then
 * streams the bytes with `Content-Disposition: attachment`, so a stored file
 * cannot be rendered as a page even if it were opened directly.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  const { id } = await params;
  const applicationId = Number(id);
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return Response.json({ ok: false, message: "Unknown application." }, { status: 400 });
  }

  try {
    await ensureApplicationsSchema();
    const record = await getApplicationCv(applicationId);

    if (!record) {
      return Response.json({ ok: false, message: "That application no longer exists." }, { status: 404 });
    }
    if (!record.data) {
      return Response.json(
        {
          ok: false,
          message: `No CV is stored for ${record.fullName}. This application arrived before CVs were archived in the console — ask the candidate to resend it.`,
        },
        { status: 404 },
      );
    }

    const extension = extensionOf(record.cvFileName, record.cvMime);
    const filename = downloadName(record.fullName, record.jobTitle, extension);
    const mime = record.cvMime && TYPES[extension] ? record.cvMime : TYPES[extension];

    // RFC 6266: an ASCII fallback for old clients plus the real name for the rest.
    const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
    const disposition = `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

    return new Response(new Uint8Array(record.data), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(record.data.length),
        "Content-Disposition": disposition,
        "Content-Security-Policy": "sandbox",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[admin/applications] could not read the CV", error);
    return Response.json(
      { ok: false, message: "The CV could not be read just now." },
      { status: 500 },
    );
  }
}
