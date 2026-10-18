import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { applyToJob } from "@/lib/jobs-service";
import { cleanText, isEmail, isValidNigerianPhone, toNumber } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const jobId = toNumber(body.jobId);
    const fullName = cleanText(body.fullName, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 30);
    const location = cleanText(body.location, 120);
    const coverLetter = cleanText(body.coverLetter, 2000);
    const cvFileName = cleanText(body.cvFileName, 180);

    if (!jobId) return Response.json({ ok: false, message: "Job not found" }, { status: 400 });
    if (fullName.length < 2)
      return Response.json({ ok: false, message: "Enter your full name" }, { status: 400 });
    if (!isEmail(email))
      return Response.json({ ok: false, message: "Enter a valid email address" }, { status: 400 });
    if (!isValidNigerianPhone(phone))
      return Response.json(
        { ok: false, message: "Enter a valid Nigerian phone number (e.g. 0803 000 4421)" },
        { status: 400 },
      );

    const jobRows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    const job = jobRows[0];
    if (!job) return Response.json({ ok: false, message: "This job is no longer available" }, { status: 404 });

    const existing = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.email, email)))
      .limit(1);

    if (existing.length > 0) {
      return Response.json(
        {
          ok: true,
          message: `You already applied for this role at ${job.company}. Check your inbox for updates.`,
        },
        { status: 200 },
      );
    }

    await applyToJob({
      jobId,
      fullName,
      email,
      phone,
      location,
      coverLetter,
      cvFileName: cvFileName || "candidate-cv.pdf",
    });

    return Response.json({
      ok: true,
      message: `Application sent to ${job.company}. They typically respond within 7 working days.`,
    });
  } catch (error) {
    console.error("application failed", error);
    return Response.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
