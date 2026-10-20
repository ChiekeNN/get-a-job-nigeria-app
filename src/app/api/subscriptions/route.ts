import { CV_WRITING } from "@/data/cv-writing";
import { createSubscription } from "@/lib/jobs-service";
import { cleanText, isEmail, isValidNigerianPhone } from "@/lib/validation";

export const dynamic = "force-dynamic";

const KINDS = new Set(["alerts", "pro", "cv"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = cleanText(body.fullName, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 30);
    const state = cleanText(body.state, 60);
    const category = cleanText(body.category, 60);
    const plan = cleanText(body.plan, 80) || "Job Seeker Pro";
    const kindRaw = cleanText(body.kind, 20) || "alerts";
    const kind = KINDS.has(kindRaw) ? (kindRaw as "alerts" | "pro" | "cv") : "alerts";
    const cvFileName = cleanText(body.cvFileName, 180);

    if (fullName.length < 2)
      return Response.json({ ok: false, message: "Enter your full name" }, { status: 400 });
    if (!isEmail(email))
      return Response.json({ ok: false, message: "Enter a valid email address" }, { status: 400 });
    if ((kind === "alerts" || kind === "pro") && !isValidNigerianPhone(phone)) {
      return Response.json(
        { ok: false, message: "Enter a valid Nigerian WhatsApp number" },
        { status: 400 },
      );
    }
    if (kind === "cv" && !cvFileName) {
      return Response.json(
        { ok: false, message: "Attach your CV file before submitting" },
        { status: 400 },
      );
    }

    await createSubscription({
      fullName,
      email,
      phone: phone || undefined,
      state: state || undefined,
      category: category || undefined,
      plan,
      kind,
      cvFileName: cvFileName || undefined,
    });

    const messages: Record<typeof kind, string> = {
      alerts: `Your daily job alerts are active${state ? ` for ${state}` : ""}. Check WhatsApp shortly.`,
      pro: `You're on ${plan}. Your recruiter will reach out on WhatsApp within 24 hours.`,
      cv: "CV received. A recruiter will review it and send matching roles within 48 hours.",
    };

    // A paid CV-writing order is a different promise from the free review:
    // the writer needs the file and the receipt, and delivery is 2–3 days.
    const cvWriting =
      kind === "cv" && plan.startsWith(CV_WRITING.planPrefix);
    const message = cvWriting
      ? `Order received. Send your CV and payment receipt on WhatsApp to start the rewrite — delivery is ${CV_WRITING.turnaround}.`
      : messages[kind];

    return Response.json({ ok: true, message }, { status: 201 });
  } catch (error) {
    console.error("subscription failed", error);
    return Response.json(
      { ok: false, message: "Could not save your details. Please try again." },
      { status: 500 },
    );
  }
}
