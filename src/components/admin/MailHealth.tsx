"use client";

import { AlertTriangle, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";

interface MailTestResult {
  ok: boolean;
  configured: boolean;
  config: { host: string; port: number; fallbackPort: number | null; user: string; inbox: string };
  attempts: Array<{ port: number; secure: boolean; ok: boolean; error?: string }>;
  sent: { ok: boolean; error?: string } | null;
}

/**
 * One-click proof that application email works.
 *
 * `verify()` alone can pass while the message still bounces, so the check sends
 * a real one-liner to the inbox and reports exactly which port answered — or
 * the SMTP error code, which is the thing needed to fix it.
 */
export function MailHealth({ configured, inbox }: { configured: boolean; inbox: string }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MailTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/admin/mail-test", { method: "POST" });
      const payload = (await response.json()) as MailTestResult & { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "The check could not run");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The check could not run");
    } finally {
      setRunning(false);
    }
  }

  const failed = result?.attempts.find((attempt) => !attempt.ok);
  const workedOn = result?.attempts.find((attempt) => attempt.ok);

  return (
    <div className="mb-3 rounded-xl border border-ink-100 bg-ink-50/50 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-800">
          <Mail className="size-3.5 text-brand-600" aria-hidden="true" />
          Application email
          <span className="font-normal text-ink-400">· {inbox}</span>
        </p>
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[10.5px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
        >
          {running ? (
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-3" aria-hidden="true" />
          )}
          {running ? "Testing…" : "Test email"}
        </button>
      </div>

      {!configured ? (
        <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-amber-800">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          SMTP_PASS is not set. Applications — CV included — are still saved in the applications
          console; only the email heads-up is skipped.
        </p>
      ) : null}

      {error ? <p className="mt-2 text-[10.5px] text-rose-700">{error}</p> : null}

      {result ? (
        result.ok ? (
          <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-brand-800">
            <CheckCircle2 className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            Connected on port {workedOn?.port ?? result.config.port} — a test message was sent to{" "}
            {result.config.inbox}. Check that inbox (and spam) to confirm it arrived.
          </p>
        ) : (
          <div className="mt-2 space-y-1">
            <p className="flex items-start gap-1.5 text-[10.5px] font-semibold leading-relaxed text-rose-700">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              {result.configured ? "The mail server refused the connection." : "SMTP is not configured."}
            </p>
            {result.attempts.map((attempt) => (
              <p key={attempt.port} className="text-[10px] leading-relaxed text-rose-700/90">
                Port {attempt.port}
                {attempt.secure ? " (SSL)" : " (STARTTLS)"}: {attempt.ok ? "ok" : attempt.error}
              </p>
            ))}
            {failed ? (
              <p className="text-[10px] leading-relaxed text-ink-400">
                Most fixes are one of: wrong mailbox password, mailbox not yet active, or the host
                expecting a different port. Update the Vercel variables, redeploy, and test again.
              </p>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}
