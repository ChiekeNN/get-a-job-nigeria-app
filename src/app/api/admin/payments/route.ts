import { findDatabaseUrlVar } from "@/db";
import { isAdmin } from "@/lib/admin";
import { ensurePaymentsSchema, listPayments, paymentTotals } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything the payments console renders, in one round trip. */
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
    await ensurePaymentsSchema();
    const [payments, totals] = await Promise.all([listPayments(), paymentTotals()]);
    return Response.json({ ok: true, totals, payments });
  } catch (error) {
    console.error("[admin/payments] could not read payments", error);
    return Response.json(
      { ok: false, message: "The payments table could not be read just now." },
      { status: 500 },
    );
  }
}
