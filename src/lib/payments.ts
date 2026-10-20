import { randomBytes } from "node:crypto";

import { desc, eq, sql } from "drizzle-orm";

import { db, getPool } from "@/db";
import { payments, subscribers } from "@/db/schema";
import { PAY_PLANS, planById, type PayPlan } from "@/data/payment";
import { PRO } from "@/data/pro";

/**
 * The payment record.
 *
 * Money changes hands outside the app — a bank transfer — so this module has
 * two jobs: keep the buyer's claim together with the receipt they uploaded, and
 * give the console the numbers it needs to reconcile a day's transfers.
 *
 * Nothing here trusts the browser for an amount: the price is read from
 * PAY_PLANS by plan id, never from the form.
 */

let schemaReady: Promise<void> | null = null;

export function ensurePaymentsSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const pool = getPool();
    await pool.query(`
      create table if not exists payments (
        id serial primary key,
        reference text not null,
        plan_id text not null,
        plan_name text not null,
        amount integer not null,
        full_name text not null,
        email text not null,
        phone text not null,
        note text,
        proof_data bytea,
        proof_mime text,
        proof_name text,
        proof_size integer,
        status text not null default 'submitted',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        paid_at timestamptz
      )
    `);
    await pool.query(
      `create unique index if not exists payments_reference_unique on payments (reference)`,
    );
    await pool.query(
      `create index if not exists payments_created_idx on payments (created_at)`,
    );
    await pool.query(`create index if not exists payments_status_idx on payments (status)`);
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

/** GAJ-PRO-4K7Q: short enough to read out on the phone, unique enough to trust. */
function makeReference(plan: PayPlan): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0, no I/1
  const bytes = randomBytes(4);
  const tail = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
  return `GAJ-${plan.code}-${tail}`;
}

export interface NewPaymentInput {
  planId: string;
  fullName: string;
  email: string;
  phone: string;
  note?: string;
  proof?: { name: string; mime: string; data: Buffer } | null;
}

export interface CreatedPayment {
  id: number;
  reference: string;
  plan: PayPlan;
}

/**
 * Record the buyer's claim. The amount comes from the plan catalogue, never
 * from the request, so a crafted form cannot register ₦100 for Pro.
 */
export async function createPayment(input: NewPaymentInput): Promise<CreatedPayment> {
  const plan = planById(input.planId);
  if (!plan) throw new Error("Unknown plan");

  await ensurePaymentsSchema();

  // A collision is vanishingly unlikely, but the unique index makes it a
  // loud failure instead of a silent overwrite, so retry once before giving up.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reference = makeReference(plan);
    try {
      const inserted = await db
        .insert(payments)
        .values({
          reference,
          planId: plan.id,
          planName: plan.name,
          amount: plan.amount,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          note: input.note ?? null,
          proofData: input.proof?.data ?? null,
          proofMime: input.proof?.mime ?? null,
          proofName: input.proof?.name ?? null,
          proofSize: input.proof?.data.length ?? null,
          status: "submitted",
        })
        .returning({ id: payments.id });

      return { id: inserted[0]?.id ?? 0, reference, plan };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/payments_reference_unique|duplicate key/i.test(message)) throw error;
      console.warn("[payments] reference collision, retrying");
    }
  }

  throw new Error("Could not allocate a reference");
}

export interface PaymentRecord {
  id: number;
  reference: string;
  planId: string;
  planName: string;
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  note: string | null;
  hasProof: boolean;
  proofName: string | null;
  proofSize: number | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentTotals {
  /** Verified money, in naira. */
  collected: number;
  paidCount: number;
  /** Submitted but not yet matched against the bank. */
  awaitingCount: number;
  awaitingValue: number;
  thisMonth: number;
  thisMonthCount: number;
}

export async function listPayments(limit = 400): Promise<PaymentRecord[]> {
  const rows = await db
    .select({
      id: payments.id,
      reference: payments.reference,
      planId: payments.planId,
      planName: payments.planName,
      amount: payments.amount,
      fullName: payments.fullName,
      email: payments.email,
      phone: payments.phone,
      note: payments.note,
      proofName: payments.proofName,
      proofSize: payments.proofSize,
      hasProof: sql<boolean>`${payments.proofData} is not null`,
      status: payments.status,
      createdAt: payments.createdAt,
      paidAt: payments.paidAt,
    })
    .from(payments)
    .orderBy(desc(payments.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    hasProof: Boolean(row.hasProof),
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  }));
}

/** Real money, counted from rows that a human marked verified. */
export async function paymentTotals(): Promise<PaymentTotals> {
  const result = await getPool().query<{
    collected: number;
    paid_count: number;
    awaiting_count: number;
    awaiting_value: number;
    month: number;
    month_count: number;
  }>(`
    select
      coalesce(sum(amount) filter (where status = 'verified'), 0)::int as collected,
      count(*) filter (where status = 'verified')::int as paid_count,
      count(*) filter (where status = 'submitted')::int as awaiting_count,
      coalesce(sum(amount) filter (where status = 'submitted'), 0)::int as awaiting_value,
      coalesce(sum(amount) filter (
        where status = 'verified'
          and paid_at >= date_trunc('month', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos'
      ), 0)::int as month,
      count(*) filter (
        where status = 'verified'
          and paid_at >= date_trunc('month', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos'
      )::int as month_count
    from payments
  `);

  const row = result.rows[0];
  return {
    collected: row?.collected ?? 0,
    paidCount: row?.paid_count ?? 0,
    awaitingCount: row?.awaiting_count ?? 0,
    awaitingValue: row?.awaiting_value ?? 0,
    thisMonth: row?.month ?? 0,
    thisMonthCount: row?.month_count ?? 0,
  };
}

export async function getProof(id: number): Promise<{
  reference: string;
  fullName: string;
  planName: string;
  proofName: string | null;
  proofMime: string | null;
  data: Buffer | null;
} | null> {
  const rows = await db
    .select({
      reference: payments.reference,
      fullName: payments.fullName,
      planName: payments.planName,
      proofName: payments.proofName,
      proofMime: payments.proofMime,
      data: payments.proofData,
    })
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { ...row, data: row.data ?? null };
}

/**
 * Move a payment between states.
 *
 * Marking one verified is the only place a subscriber row is created — Pro
 * includes WhatsApp alerts, but nobody joins that list until the money has
 * actually been seen in the account.
 */
export async function setPaymentStatus(
  id: number,
  status: "verified" | "submitted" | "cancelled",
): Promise<{ ok: boolean; status?: string }> {
  const rows = await db
    .select({
      id: payments.id,
      planId: payments.planId,
      amount: payments.amount,
      fullName: payments.fullName,
      email: payments.email,
      phone: payments.phone,
    })
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return { ok: false };

  await db
    .update(payments)
    .set({
      status,
      updatedAt: new Date(),
      paidAt: status === "verified" ? new Date() : null,
    })
    .where(eq(payments.id, id));

  if (status === "verified" && planById(row.planId)?.kind === "pro") {
    await ensureProSubscriber(row);
  }

  return { ok: true, status };
}

/** Add the buyer to the Pro list, once, without duplicating an existing row. */
async function ensureProSubscriber(row: {
  fullName: string;
  email: string;
  phone: string;
}): Promise<void> {
  try {
    const existing = await db
      .select({ id: subscribers.id })
      .from(subscribers)
      .where(sql`lower(${subscribers.email}) = lower(${row.email}) and ${subscribers.kind} = 'pro'`)
      .limit(1);

    if (existing.length > 0) return;

    await db.insert(subscribers).values({
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      plan: PRO.plan,
      kind: "pro",
    });
    console.log(`[payments] added ${row.email} to the Pro list`);
  } catch (error) {
    // The money is verified either way; a failed list insert must not undo that.
    console.error("[payments] verified, but the Pro subscriber row failed", error);
  }
}

export async function deletePayment(id: number): Promise<boolean> {
  const removed = await db
    .delete(payments)
    .where(eq(payments.id, id))
    .returning({ id: payments.id });
  return removed.length > 0;
}

/** Used by the checkout screen so the buyer sees the same catalogue. */
export function plansForDisplay(): PayPlan[] {
  return PAY_PLANS;
}
