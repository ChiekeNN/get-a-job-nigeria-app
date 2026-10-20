import nodemailer, { type Transporter } from "nodemailer";

import { BRAND } from "@/data/site";

/**
 * Outbound mail for job applications.
 *
 * Every application — details, cover note and the CV itself — is emailed to the
 * applications@ mailbox, which is the queue the team forwards from. The DB row
 * is a record of what happened; the mailbox is the delivery.
 *
 * Credentials live in env only: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 * Nothing here reads a password from source, and nothing logs one.
 */

const HOST = process.env.SMTP_HOST?.trim() || "getajob.com.ng";
const PORT = Number(process.env.SMTP_PORT) || 465;
const USER = process.env.SMTP_USER?.trim() || "applications@getajob.com.ng";
const PASS = process.env.SMTP_PASS ?? "";

/** Where applications land. Defaults to the authenticated mailbox. */
export const APPLICATIONS_INBOX = process.env.APPLICATIONS_INBOX?.trim() || USER;

/** True once SMTP_PASS is set. Until then applications are recorded but not mailed. */
export function isMailerConfigured(): boolean {
  return PASS.length > 0;
}

let transport: Transporter | null = null;

function mailer(): Transporter | null {
  if (!isMailerConfigured()) return null;
  transport ??= nodemailer.createTransport({
    host: HOST,
    port: PORT,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

export interface ApplicationMailJob {
  id: number;
  title: string;
  company: string;
  category: string;
  state: string;
  city: string;
  jobType: string;
  slug: string;
  employerEmail: string | null;
}

export interface ApplicationMailApplicant {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  coverLetter: string;
}

export interface ApplicationMailCv {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface ApplicationMailInput {
  job: ApplicationMailJob;
  applicant: ApplicationMailApplicant;
  cv: ApplicationMailCv | null;
  submittedAt: Date;
}

export interface ApplicationMailResult {
  /** False when SMTP is not configured, so the caller can decide how to answer. */
  attempted: boolean;
}

const LAGOS = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eef2f0;color:#5b6b64;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eef2f0;color:#0d1b16;font-size:13px;vertical-align:top;">${value}</td>
  </tr>`;
}

export function applicationEmail(input: ApplicationMailInput): {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
} {
  const { job, applicant, cv, submittedAt } = input;
  const jobUrl = `${BRAND.url}/jobs/${job.slug}`;
  const submitted = LAGOS.format(submittedAt);

  const subject = `[${BRAND.name}] Application: ${job.title} — ${applicant.fullName}`;

  const text = [
    `New application — ${job.title}`,
    `${job.company} · ${job.city || job.state} · ${job.category} · ${job.jobType}`,
    ``,
    `Name:     ${applicant.fullName}`,
    `Email:    ${applicant.email}`,
    `Phone:    ${applicant.phone}`,
    `Location: ${applicant.location || "Not provided"}`,
    `CV:       ${cv ? cv.filename : "Not attached"}`,
    `Received: ${submitted}`,
    ``,
    `Cover note:`,
    applicant.coverLetter || "(none)",
    ``,
    `Listing: ${jobUrl}`,
    job.employerEmail ? `Employer contact on file: ${job.employerEmail}` : "",
    ``,
    `Reply to this email to answer ${applicant.fullName} directly.`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f5f8f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e3ebe7;border-radius:14px;overflow:hidden;">
    <div style="background:#0d1b16;padding:20px 24px;">
      <p style="margin:0;color:#8fd6b4;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">New job application</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;line-height:1.3;">${escapeHtml(job.title)}</h1>
      <p style="margin:4px 0 0;color:#c9d8d1;font-size:13px;">${escapeHtml(job.company)} · ${escapeHtml(job.city || job.state)} · ${escapeHtml(job.category)}</p>
    </div>
    <div style="padding:20px 24px;">
      <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #eef2f0;border-radius:10px;overflow:hidden;">
        ${row("Name", escapeHtml(applicant.fullName))}
        ${row("Email", `<a href="mailto:${escapeHtml(applicant.email)}" style="color:#0f766e;">${escapeHtml(applicant.email)}</a>`)}
        ${row("Phone", escapeHtml(applicant.phone))}
        ${row("Location", escapeHtml(applicant.location || "Not provided"))}
        ${row("CV", cv ? `${escapeHtml(cv.filename)} <span style="color:#5b6b64;">(attached)</span>` : "Not attached")}
        ${row("Received", escapeHtml(submitted))}
        ${row("Listing", `<a href="${escapeHtml(jobUrl)}" style="color:#0f766e;">${escapeHtml(jobUrl)}</a>`)}
        ${job.employerEmail ? row("Employer contact on file", escapeHtml(job.employerEmail)) : ""}
      </table>

      <h2 style="margin:20px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#5b6b64;">Cover note</h2>
      <p style="margin:0;white-space:pre-wrap;color:#0d1b16;font-size:14px;line-height:1.6;">${applicant.coverLetter ? escapeHtml(applicant.coverLetter) : "<span style=\"color:#8a9992;\">No cover note provided.</span>"}</p>

      <p style="margin:22px 0 0;color:#5b6b64;font-size:12px;line-height:1.6;">
        Reply to this email to answer ${escapeHtml(applicant.fullName)} directly — the reply address is theirs.
        Forward it to the employer once you have screened the CV.
      </p>
    </div>
    <div style="padding:14px 24px;background:#f5f8f6;border-top:1px solid #e3ebe7;color:#8a9992;font-size:11px;">
      ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.domain)} · Application #${job.id}
    </div>
  </div>
</body></html>`;

  return { subject, text, html, replyTo: applicant.email };
}

/**
 * Send one application to the applications@ inbox.
 *
 * Throws if SMTP is configured and the server rejects the message — the caller
 * turns that into a visible error so nobody is told "sent" when it was not.
 */
export async function sendApplicationEmail(input: ApplicationMailInput): Promise<ApplicationMailResult> {
  const client = mailer();
  if (!client) {
    console.error("[mail] SMTP_PASS is not set — application recorded but NOT emailed");
    return { attempted: false };
  }

  const { subject, text, html, replyTo } = applicationEmail(input);

  await client.sendMail({
    from: `"${BRAND.name} Applications" <${USER}>`,
    to: APPLICATIONS_INBOX,
    replyTo,
    subject,
    text,
    html,
    attachments: input.cv
      ? [
          {
            filename: input.cv.filename,
            content: input.cv.content,
            contentType: input.cv.contentType,
          },
        ]
      : [],
  });

  return { attempted: true };
}
