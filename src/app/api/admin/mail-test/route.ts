import { isAdmin } from "@/lib/admin";
import { mailConfigSummary, sendTestEmail, verifyMailer } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only mail check.
 *
 * `verify()` proves the host, port and password work without sending anything;
 * adding `?send=1` also posts a one-line test to the applications inbox, which
 * is the only way to know the message actually lands.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in to the admin console first" }, { status: 401 });
  }

  const wantSend = new URL(request.url).searchParams.get("send") !== "0";
  const config = mailConfigSummary();
  const verified = await verifyMailer();

  const sent = verified.ok && wantSend ? await sendTestEmail() : null;

  return Response.json({
    ok: verified.ok && (sent ? sent.ok : true),
    config,
    configured: verified.configured,
    attempts: verified.attempts,
    sent,
  });
}
