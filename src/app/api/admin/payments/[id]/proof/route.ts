import { isAdmin } from "@/lib/admin";
import { ensurePaymentsSchema, getProof } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};

function extensionOf(filename: string | null, mime: string | null): string {
  const match = /\.([a-z0-9]{2,5})$/i.exec(filename ?? "");
  const fromName = match?.[1]?.toLowerCase();
  if (fromName && TYPES[fromName]) return fromName;
  const fromMime = Object.entries(TYPES).find(([, type]) => type === mime)?.[0];
  return fromMime ?? "png";
}

/**
 * Serve one payment's receipt.
 *
 * Images are sent `inline` so the console can show them without a download
 * step; PDFs too. The route is admin-gated and sandboxed, and only raster
 * images or PDFs are accepted at upload, so a stored file cannot execute.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  const { id } = await params;
  const paymentId = Number(id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return Response.json({ ok: false, message: "Unknown payment." }, { status: 400 });
  }

  try {
    await ensurePaymentsSchema();
    const record = await getProof(paymentId);

    if (!record) {
      return Response.json({ ok: false, message: "That payment no longer exists." }, { status: 404 });
    }
    if (!record.data) {
      return Response.json(
        { ok: false, message: `No proof of payment is stored for ${record.reference}.` },
        { status: 404 },
      );
    }

    const extension = extensionOf(record.proofName, record.proofMime);
    const mime = TYPES[extension];
    const disposition = `inline; filename="receipt-${record.reference}.${extension}"`;

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
    console.error("[admin/payments] could not read the receipt", error);
    return Response.json(
      { ok: false, message: "The receipt could not be read just now." },
      { status: 500 },
    );
  }
}
