import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";

import { BRAND } from "@/data/site";

/**
 * Outbound mail for job applications.
 *
 * The admin console is now the record: the application, its cover note and the
 * CV file are stored in the database and read there. Email is a notification —
 * a short heads-up that something new arrived, with a link to the console. That
 * keeps a 4 MB CV out of the inbox and means a bounced mailbox no longer costs
 * a candidate their application.
 *
 * `sendApplicationEmail` still sends the full record, and is used only as a
 * fallback when the database write fails.
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

/** Non-secret connection facts, for the admin diagnostics panel. */
export function mailConfigSummary(): {
  host: string;
  port: number;
  fallbackPort: number | null;
  user: string;
  inbox: string;
} {
  return { host: HOST, port: PORT, fallbackPort: FALLBACK_PORT, user: USER, inbox: APPLICATIONS_INBOX };
}

/** True once SMTP_PASS is set. Until then applications are recorded but not mailed. */
export function isMailerConfigured(): boolean {
  return PASS.length > 0;
}

/**
 * Ports are tried in order. Shared hosts sometimes disable AUTH on one port
 * while leaving the other open, so a failed 465 can still succeed on 587.
 * Set SMTP_FALLBACK_PORT=off to disable the second attempt.
 */
const FALLBACK_PORT =
  process.env.SMTP_FALLBACK_PORT === "off"
    ? null
    : Number(process.env.SMTP_FALLBACK_PORT ?? 587) || null;

/** Remember a port that has worked, so the next application skips the retry. */
let workingPort: number | null = null;

function portsToTry(): number[] {
  const primary = workingPort ?? PORT;
  const ports = [primary];
  if (FALLBACK_PORT && !ports.includes(FALLBACK_PORT)) ports.push(FALLBACK_PORT);
  return ports;
}

function transportFor(port: number): Transporter {
  return nodemailer.createTransport({
    host: HOST,
    port,
    // 465 is implicit TLS; 587 (and 25) start plain and must upgrade with STARTTLS.
    secure: port === 465,
    requireTLS: port === 587 || port === 25,
    auth: { user: USER, pass: PASS },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 20_000,
    tls: { servername: HOST },
  });
}

/** A short, password-free description of a send failure. */
export function describeMailError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error).slice(0, 200);
  const mail = error as { code?: string; responseCode?: number; response?: string; message?: string };
  const bits = [mail.code, mail.responseCode ? String(mail.responseCode) : null]
    .filter(Boolean)
    .join(" ");
  const detail = (mail.response || mail.message || "Unknown error").replace(/\s+/g, " ").trim();
  return `${bits ? `${bits}: ` : ""}${detail}`.slice(0, 240);
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

/** One line per port attempted, for the admin diagnostics panel. */
export interface MailAttempt {
  port: number;
  secure: boolean;
  ok: boolean;
  error?: string;
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
 * One message, tried on each port in turn. Throws the last failure, so callers
 * can tell the difference between "not configured" and "the server said no".
 */
async function sendViaPorts(build: (port: number) => SendMailOptions): Promise<void> {
  let lastError: unknown = null;
  for (const port of portsToTry()) {
    try {
      await transportFor(port).sendMail(build(port));
      workingPort = port;
      return;
    } catch (error) {
      lastError = error;
      console.error(`[mail] send failed on port ${port}:`, describeMailError(error));
    }
  }
  throw lastError ?? new Error("SMTP send failed");
}

/**
 * Send one application to the applications@ inbox — the full record, CV
 * attached. Kept for the case where the database write failed: an applicant
 * must never be turned away because one of the two stores is down.
 */
export async function sendApplicationEmail(input: ApplicationMailInput): Promise<ApplicationMailResult> {
  if (!isMailerConfigured()) {
    console.error("[mail] SMTP_PASS is not set — application recorded but NOT emailed");
    return { attempted: false };
  }

  const { subject, text, html, replyTo } = applicationEmail(input);

  await sendViaPorts(() => ({
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
  }));

  return { attempted: true };
}

/**
 * The heads-up: someone applied, here is who and for what, open the console.
 *
 * Deliberately short and attachment-free. The record — cover note, phone, the
 * CV file — lives in the dashboard, so this message cannot leak a candidate's
 * file into a mailbox or a spam folder.
 */
export async function notifyApplicationEmail(
  input: ApplicationMailInput,
): Promise<ApplicationMailResult> {
  if (!isMailerConfigured()) {
    console.error("[mail] SMTP_PASS is not set — application saved, no notification sent");
    return { attempted: false };
  }

  const { job, applicant, submittedAt } = input;
  const consoleUrl = `${BRAND.url}/admin/applications`;
  const submitted = LAGOS.format(submittedAt);

  const subject = `[${BRAND.name}] New application: ${job.title} — ${applicant.fullName}`;

  const text = [
    `New application — ${job.title}`,
    `${job.company} · ${job.city || job.state}`,
    ``,
    `${applicant.fullName} <${applicant.email}>`,
    `Received: ${submitted}`,
    ``,
    `The CV, phone number and cover note are in the admin console:`,
    consoleUrl,
    ``,
    `Reply to this email to answer ${applicant.fullName} directly.`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f5f8f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3ebe7;border-radius:14px;overflow:hidden;">
    <div style="background:#0d1b16;padding:18px 22px;">
      <p style="margin:0;color:#8fd6b4;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">New application</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:18px;line-height:1.3;">${escapeHtml(job.title)}</h1>
      <p style="margin:4px 0 0;color:#c9d8d1;font-size:13px;">${escapeHtml(job.company)} · ${escapeHtml(job.city || job.state)}</p>
    </div>
    <div style="padding:18px 22px;">
      <p style="margin:0 0 4px;color:#0d1b16;font-size:15px;font-weight:600;">${escapeHtml(applicant.fullName)}</p>
      <p style="margin:0 0 14px;color:#5b6b64;font-size:13px;">
        <a href="mailto:${escapeHtml(applicant.email)}" style="color:#0f766e;">${escapeHtml(applicant.email)}</a>
        · received ${escapeHtml(submitted)}
      </p>
      <p style="margin:0 0 14px;color:#5b6b64;font-size:13px;line-height:1.6;">
        The CV, phone number and cover note are in the console — open the application to read it,
        download the file, or delete it.
      </p>
      <p style="margin:0;">
        <a href="${escapeHtml(consoleUrl)}" style="display:inline-block;background:#078e58;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 16px;border-radius:10px;">Open applications</a>
      </p>
    </div>
    <div style="padding:12px 22px;background:#f5f8f6;border-top:1px solid #e3ebe7;color:#8a9992;font-size:11px;">
      ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.domain)} · No attachment — the CV stays in the console.
    </div>
  </div>
</body></html>`;

  await sendViaPorts(() => ({
    from: `"${BRAND.name} Applications" <${USER}>`,
    to: APPLICATIONS_INBOX,
    replyTo: applicant.email,
    subject,
    text,
    html,
  }));

  return { attempted: true };
}

/**
 * A payment has been claimed — tell the inbox, without the receipt.
 *
 * Same rule as applications: the console holds the evidence, so this message is
 * a notification with a reference to look up, not an attachment.
 */
export async function notifyPaymentEmail(input: {
  reference: string;
  planName: string;
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  note: string | null;
}): Promise<ApplicationMailResult> {
  if (!isMailerConfigured()) {
    console.error("[mail] SMTP_PASS is not set — payment recorded, no notification sent");
    return { attempted: false };
  }

  const consoleUrl = `${BRAND.url}/admin/payments`;
  const subject = `[${BRAND.name}] Payment to verify: ${input.reference} — ₦${input.amount.toLocaleString("en-NG")}`;

  const text = [
    `Payment submitted for verification — ${input.reference}`,
    `${input.planName} · ₦${input.amount.toLocaleString("en-NG")}`,
    ``,
    `${input.fullName} <${input.email}> · ${input.phone}`,
    input.note ? `Note: ${input.note}` : "",
    ``,
    `The proof of payment is in the console:`,
    consoleUrl,
    ``,
    `Match it against the Fidelity Bank account before marking it verified.`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f5f8f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3ebe7;border-radius:14px;overflow:hidden;">
    <div style="background:#0d1b16;padding:18px 22px;">
      <p style="margin:0;color:#8fd6b4;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">Payment to verify</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;line-height:1.3;">₦${input.amount.toLocaleString("en-NG")}</h1>
      <p style="margin:4px 0 0;color:#c9d8d1;font-size:13px;">${escapeHtml(input.planName)} · ${escapeHtml(input.reference)}</p>
    </div>
    <div style="padding:18px 22px;">
      <p style="margin:0 0 4px;color:#0d1b16;font-size:15px;font-weight:600;">${escapeHtml(input.fullName)}</p>
      <p style="margin:0 0 14px;color:#5b6b64;font-size:13px;">
        <a href="mailto:${escapeHtml(input.email)}" style="color:#0f766e;">${escapeHtml(input.email)}</a>
        · ${escapeHtml(input.phone)}
      </p>
      <p style="margin:0 0 14px;color:#5b6b64;font-size:13px;line-height:1.6;">
        The proof of payment is in the console. Match it against the Fidelity Bank account before
        marking the payment verified.
      </p>
      <p style="margin:0;">
        <a href="${escapeHtml(consoleUrl)}" style="display:inline-block;background:#078e58;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 16px;border-radius:10px;">Open payments</a>
      </p>
    </div>
    <div style="padding:12px 22px;background:#f5f8f6;border-top:1px solid #e3ebe7;color:#8a9992;font-size:11px;">
      ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.domain)} · No attachment — the receipt stays in the console.
    </div>
  </div>
</body></html>`;

  await sendViaPorts(() => ({
    from: `"${BRAND.name} Payments" <${USER}>`,
    to: APPLICATIONS_INBOX,
    replyTo: input.email,
    subject,
    text,
    html,
  }));

  return { attempted: true };
}

/**
 * Checks the mailbox without sending anything, trying each port in turn.
 * Used by the admin console so a broken password is visible in one click.
 */
export async function verifyMailer(): Promise<{
  configured: boolean;
  ok: boolean;
  attempts: MailAttempt[];
}> {
  if (!isMailerConfigured()) return { configured: false, ok: false, attempts: [] };

  const attempts: MailAttempt[] = [];
  for (const port of portsToTry()) {
    try {
      await transportFor(port).verify();
      workingPort = port;
      attempts.push({ port, secure: port === 465, ok: true });
      return { configured: true, ok: true, attempts };
    } catch (error) {
      attempts.push({
        port,
        secure: port === 465,
        ok: false,
        error: describeMailError(error),
      });
    }
  }

  return { configured: true, ok: false, attempts };
}

/** Sends a one-line message to the applications inbox, end to end. */
export async function sendTestEmail(): Promise<{ ok: boolean; error?: string }> {
  if (!isMailerConfigured()) return { ok: false, error: "SMTP_PASS is not set" };

  let lastError: unknown = null;
  for (const port of portsToTry()) {
    try {
      await transportFor(port).sendMail({
        from: `"${BRAND.name} Applications" <${USER}>`,
        to: APPLICATIONS_INBOX,
        subject: `[${BRAND.name}] Mail test — admin console`,
        text: `SMTP is working. This message was sent from ${BRAND.domain} at ${new Date().toISOString()} on port ${port}.`,
      });
      workingPort = port;
      return { ok: true };
    } catch (error) {
      lastError = error;
    }
  }

  return { ok: false, error: describeMailError(lastError) };
}
