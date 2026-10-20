import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { PHONE } from "@/data/contact";
import { applications, jobs } from "@/db/schema";
import { applyToJob } from "@/lib/jobs-service";
import {
  describeMailError,
  isMailerConfigured,
  notifyApplicationEmail,
  sendApplicationEmail,
  type ApplicationMailCv,
  type ApplicationMailInput,
} from "@/lib/mailer";
import { cleanText, isEmail, isValidNigerianPhone, toNumber } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Room for the SMTP handshake and a 4 MB attachment. */
export const maxDuration = 30;

/** Vercel caps a serverless request body at 4.5 MB; leave headroom for the form. */
const MAX_CV_BYTES = 4 * 1024 * 1024;

const CV_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

interface ParsedBody {
  fields: Record<string, unknown>;
  cv: ApplicationMailCv | null;
  cvError?: string;
}

function extensionOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/** Accepts multipart (the current forms) and plain JSON (older cached clients). */
async function parseRequest(request: Request): Promise<ParsedBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    const body = (await request.json()) as Record<string, unknown>;
    return { fields: body, cv: null };
  }

  const form = await request.formData();
  const fields: Record<string, unknown> = {};
  for (const key of ["jobId", "fullName", "email", "phone", "location", "coverLetter"]) {
    const value = form.get(key);
    if (typeof value === "string") fields[key] = value;
  }

  const file = form.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return { fields, cv: null };
  }

  const extension = extensionOf(file.name);
  if (!CV_TYPES[extension]) {
    return { fields, cv: null, cvError: "Attach your CV as a PDF or Word document" };
  }
  if (file.size > MAX_CV_BYTES) {
    return { fields, cv: null, cvError: "Your CV is larger than 4 MB — compress it and attach again" };
  }

  return {
    fields,
    cv: {
      filename: file.name.replace(/[^\w.\-() ]+/g, "_"),
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || CV_TYPES[extension],
    },
  };
}

export async function POST(request: Request) {
  try {
    const { fields, cv, cvError } = await parseRequest(request);

    if (cvError) return Response.json({ ok: false, message: cvError }, { status: 400 });

    const jobId = toNumber(fields.jobId);
    const fullName = cleanText(fields.fullName, 120);
    const email = cleanText(fields.email, 160).toLowerCase();
    const phone = cleanText(fields.phone, 30);
    const location = cleanText(fields.location, 120);
    const coverLetter = cleanText(fields.coverLetter, 2000);

    if (!jobId) return Response.json({ ok: false, message: "Job not found" }, { status: 400 });
    if (fullName.length < 2)
      return Response.json({ ok: false, message: "Enter your full name" }, { status: 400 });
    if (!isEmail(email))
      return Response.json({ ok: false, message: "Enter a valid email address" }, { status: 400 });
    if (!isValidNigerianPhone(phone))
      return Response.json(
        { ok: false, message: `Enter a valid Nigerian phone number (e.g. ${PHONE.local})` },
        { status: 400 },
      );
    if (!cv) {
      return Response.json(
        { ok: false, message: "Attach your CV (PDF or Word) so the employer can read it" },
        { status: 400 },
      );
    }

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

    const mail: ApplicationMailInput = {
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        category: job.category,
        state: job.state,
        city: job.city,
        jobType: job.jobType,
        slug: job.slug,
        employerEmail: job.employerEmail ?? null,
      },
      applicant: { fullName, email, phone, location, coverLetter },
      cv,
      submittedAt: new Date(),
    };

    // Save first. The console — not the mailbox — is the record of an
    // application now, CV included, so the candidate is never turned away
    // because SMTP is unhappy.
    let savedId = 0;
    try {
      savedId = await applyToJob({
        jobId,
        fullName,
        email,
        phone,
        location,
        coverLetter,
        cvFileName: cv.filename,
        cv: {
          filename: cv.filename,
          mime: cv.contentType,
          size: cv.content.length,
          data: cv.content,
        },
      });
    } catch (error) {
      console.error("[applications] could not save the application", describeMailError(error));
    }

    if (savedId > 0) {
      // The record is safe. The email is a heads-up, and a failed one is only
      // worth a log line — never a message that worries the applicant.
      try {
        await notifyApplicationEmail(mail);
      } catch (error) {
        console.error(
          "[applications] saved, but the notification email failed",
          describeMailError(error),
        );
      }

      console.log(`[applications] saved application #${savedId} for ${job.title}`);
      return Response.json({
        ok: true,
        message: `Application received. Our placement team has your CV on file and will review it — expect to hear from us within 7 working days.`,
      });
    }

    // The database write failed. Email the full record instead so one broken
    // store does not lose the candidate.
    let mailed = false;
    try {
      if (!isMailerConfigured()) {
        console.error("[applications] database save failed and SMTP is not configured");
      } else {
        const result = await sendApplicationEmail(mail);
        mailed = result.attempted;
      }
    } catch (error) {
      console.error("[applications] save failed and email delivery failed", describeMailError(error));
    }

    if (mailed) {
      console.log(`[applications] saved nothing, but emailed the application for ${job.title}`);
      return Response.json({
        ok: true,
        message: `Application delivered. Our placement team has your CV and forwards shortlists to ${job.company} — expect to hear from us within 7 working days.`,
      });
    }

    console.error("[applications] nothing stored — database and mailbox both failed");
    return Response.json(
      {
        ok: false,
        message:
          "We could not save your application just now. Please try again in a moment — nothing was submitted.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("application failed", error);
    return Response.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
