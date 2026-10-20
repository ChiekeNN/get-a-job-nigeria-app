import { BANK, planById } from "@/data/payment";
import { describeMailError, isMailerConfigured, notifyPaymentEmail } from "@/lib/mailer";
import { createPayment } from "@/lib/payments";
import { guardSubmission } from "@/lib/throttle";
import { cleanText, isEmail, isValidNigerianPhone } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Vercel caps the request body at 4.5 MB; leave room for the form fields. */
const MAX_PROOF_BYTES = 4 * 1024 * 1024;

const PROOF_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};

interface ParsedProof {
  name: string;
  mime: string;
  data: Buffer;
}

function extensionOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

interface ParsedBody {
  fields: Record<string, unknown>;
  proof: ParsedProof | null;
  proofError?: string;
}

async function parseRequest(request: Request): Promise<ParsedBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    const body = (await request.json()) as Record<string, unknown>;
    return { fields: body, proof: null };
  }

  const form = await request.formData();
  const fields: Record<string, unknown> = {};
  for (const key of ["planId", "fullName", "email", "phone", "note", "website"]) {
    const value = form.get(key);
    if (typeof value === "string") fields[key] = value;
  }

  const file = form.get("proof");
  if (!(file instanceof File) || file.size === 0) {
    return { fields, proof: null, proofError: "Upload a screenshot of your payment receipt" };
  }

  const extension = extensionOf(file.name);
  if (!PROOF_TYPES[extension]) {
    return {
      fields,
      proof: null,
      proofError: "Attach the receipt as a PNG, JPG or PDF",
    };
  }
  if (file.size > MAX_PROOF_BYTES) {
    return {
      fields,
      proof: null,
      proofError: "That image is larger than 4 MB — take a smaller screenshot and try again",
    };
  }

  return {
    fields,
    proof: {
      name: file.name.replace(/[^\w.\-() ]+/g, "_"),
      mime: file.type || PROOF_TYPES[extension],
      data: Buffer.from(await file.arrayBuffer()),
    },
  };
}

/**
 * Record a bank transfer the buyer says they have made.
 *
 * The amount is looked up from the plan catalogue, never taken from the form,
 * and the row is stored as `submitted` — only a human in the console can mark
 * it verified after seeing the money in the bank account.
 */
export async function POST(request: Request) {
  try {
    const verdict = await guardSubmission(request, "payment");
    if (!verdict.allowed) {
      return Response.json(
        {
          ok: false,
          message:
            verdict.scope === "global"
              ? "We are receiving an unusually high number of payment updates. Please try again shortly — nothing was submitted."
              : "You have submitted several payments in a short time. Please wait a few minutes and try again — nothing was submitted.",
        },
        {
          status: verdict.scope === "global" ? 503 : 429,
          headers: { "Retry-After": String(verdict.retryAfterSeconds) },
        },
      );
    }

    const { fields, proof, proofError } = await parseRequest(request);

    // Same honeypot as the apply form: answer normally, store nothing.
    if (cleanText(fields.website, 200).length > 0) {
      console.warn("[payments] honeypot filled — discarding silently");
      return Response.json({ ok: true, reference: "", plan: null });
    }

    if (proofError) return Response.json({ ok: false, message: proofError }, { status: 400 });

    const plan = planById(cleanText(fields.planId, 40));
    if (!plan) {
      return Response.json({ ok: false, message: "Choose what you are paying for" }, { status: 400 });
    }

    const fullName = cleanText(fields.fullName, 120);
    const email = cleanText(fields.email, 160).toLowerCase();
    const phone = cleanText(fields.phone, 30);
    const note = cleanText(fields.note, 600);

    if (fullName.length < 2) {
      return Response.json({ ok: false, message: "Enter your full name" }, { status: 400 });
    }
    if (!isEmail(email)) {
      return Response.json({ ok: false, message: "Enter a valid email address" }, { status: 400 });
    }
    if (!isValidNigerianPhone(phone)) {
      return Response.json(
        { ok: false, message: "Enter a valid Nigerian phone number" },
        { status: 400 },
      );
    }

    const created = await createPayment({
      planId: plan.id,
      fullName,
      email,
      phone,
      note: note || undefined,
      proof,
    });

    if (isMailerConfigured()) {
      try {
        await notifyPaymentEmail({
          reference: created.reference,
          planName: plan.name,
          amount: plan.amount,
          fullName,
          email,
          phone,
          note: note || null,
        });
      } catch (error) {
        // The record is safe; a failed email must not fail the buyer's form.
        console.error("[payments] saved, but the notification email failed", describeMailError(error));
      }
    }

    console.log(`[payments] ${created.reference} recorded — ${plan.name} — ${BANK.bank}`);

    return Response.json({
      ok: true,
      reference: created.reference,
      plan: { id: plan.id, name: plan.name, amount: plan.amount, price: plan.price },
      message: `Payment received for review. Your reference is ${created.reference}.`,
    });
  } catch (error) {
    console.error("[payments] could not record the payment", error);
    return Response.json(
      {
        ok: false,
        message:
          "We could not save your payment details just now. Please try again in a moment — nothing was submitted.",
      },
      { status: 500 },
    );
  }
}
