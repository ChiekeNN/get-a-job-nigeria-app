import { isAdmin } from "@/lib/admin";
import { deletePayment, ensurePaymentsSchema, setPaymentStatus } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["verified", "submitted", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

/**
 * Move a payment between states.
 *
 * `verified` is the only one that means money was seen in the bank account, and
 * it is what the collected total on the console counts.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  const { id } = await params;
  const paymentId = Number(id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return Response.json({ ok: false, message: "Unknown payment." }, { status: 400 });
  }

  let status: Status | null = null;
  try {
    const body = (await request.json()) as { status?: unknown };
    status = STATUSES.includes(body.status as Status) ? (body.status as Status) : null;
  } catch {
    status = null;
  }

  if (!status) {
    return Response.json({ ok: false, message: "Send a valid status." }, { status: 400 });
  }

  try {
    await ensurePaymentsSchema();
    const result = await setPaymentStatus(paymentId, status);
    if (!result.ok) {
      return Response.json({ ok: false, message: "That payment no longer exists." }, { status: 404 });
    }
    console.log(`[admin/payments] #${paymentId} → ${status}`);
    return Response.json({ ok: true, status });
  } catch (error) {
    console.error("[admin/payments] could not update the payment", error);
    return Response.json(
      { ok: false, message: "The payment could not be updated just now." },
      { status: 500 },
    );
  }
}

/** Delete the row and the receipt stored with it. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const deleted = await deletePayment(paymentId);
    if (!deleted) {
      return Response.json({ ok: false, message: "That payment is already gone." }, { status: 404 });
    }
    console.log(`[admin/payments] #${paymentId} deleted`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin/payments] delete failed", error);
    return Response.json(
      { ok: false, message: "The payment could not be deleted just now." },
      { status: 500 },
    );
  }
}
