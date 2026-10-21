"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Landmark,
  Loader2,
  Lock,
  MessageCircle,
  ReceiptText,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { PHONE, whatsappLink } from "@/data/contact";
import {
  BANK,
  PAY_PLANS,
  PROOF_HINT,
  PROOF_LABEL,
  naira,
  planById,
  type PayPlan,
} from "@/data/payment";

const MAX_PROOF_BYTES = 4 * 1024 * 1024;
const PROOF_ACCEPT = ".png,.jpg,.jpeg,.webp,.pdf";

interface Receipt {
  reference: string;
  plan: { id: string; name: string; amount: number; price: string } | null;
}

/**
 * Pay by bank transfer, then upload the receipt.
 *
 * The screenshot is the whole point: it is the only evidence the platform has
 * that the money moved, and it is what the console verifies against the bank
 * account. Nothing here claims the payment is complete — the page says
 * "waiting for us to confirm" until a human says otherwise.
 */
export function CheckoutFlow({
  initialPlan,
  controlledPlan,
  compact = false,
}: {
  initialPlan?: string;
  /** When set, changing this prop switches the plan without losing the form. */
  controlledPlan?: string;
  compact?: boolean;
}) {
  const { toast } = useToast();
  const [planId, setPlanId] = useState(planById(initialPlan)?.id ?? "pro");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofName, setProofName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [copied, setCopied] = useState<"number" | "amount" | null>(null);

  // A controlled plan wins: on /cv-writing the package cards above drive this
  // form, so the price on the bank card always matches the package clicked.
  const plan = useMemo<PayPlan>(
    () => planById(controlledPlan) ?? planById(planId) ?? PAY_PLANS[0],
    [controlledPlan, planId],
  );

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy(value: string, which: "number" | "amount") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      toast({
        title: "Copy did not work",
        description: `Select and copy manually: ${value}`,
        variant: "error",
      });
    }
  }

  function pickProof(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setProofFile(null);
      setProofName("");
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      toast({
        title: "Screenshot too large",
        description: "Keep it under 4 MB — or send the receipt on WhatsApp instead.",
        variant: "error",
      });
      event.target.value = "";
      setProofFile(null);
      setProofName("");
      return;
    }
    setError(null);
    setProofFile(file);
    setProofName(file.name);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError(null);

    try {
      const body = new FormData();
      body.set("planId", plan.id);
      for (const key of ["fullName", "email", "phone", "note", "website"]) {
        body.set(key, String(data.get(key) ?? ""));
      }
      if (proofFile) body.set("proof", proofFile);

      const response = await fetch("/api/payments", { method: "POST", body });
      const payload = (await response.json()) as Receipt & { ok: boolean; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not record your payment");

      setReceipt({ reference: payload.reference, plan: payload.plan });
      toast({
        title: "Receipt uploaded 🎉",
        description: "We will check it against the bank account and confirm by email.",
        variant: "success",
      });
      form.reset();
      setProofFile(null);
      setProofName("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Network error. Please try again.";
      setError(message);
      toast({ title: "Payment not recorded", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  if (receipt) {
    return (
      <div className="min-w-0 rounded-2xl border border-brand-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(5,20,15,0.35)] sm:p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight text-ink-900">
          Receipt received
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
          We have your proof of payment and will match it against the bank account. You will get an
          email at the address you gave us once it is confirmed — usually the same working day.
        </p>
        {plan.kind === "cv" ? (
          <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-[12px] leading-relaxed text-brand-900">
            Next step for a CV rewrite: send your current CV on WhatsApp. The writers cannot start
            without it.
          </p>
        ) : null}

        <dl className="mt-4 grid gap-2 rounded-xl border border-ink-100 bg-cream p-3 text-[12.5px] sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Reference</dt>
            <dd className="mt-0.5 font-mono text-[13px] font-bold text-ink-900">
              {receipt.reference}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-400">For</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">
              {receipt.plan?.name ?? plan.name} · {naira(receipt.plan?.amount ?? plan.amount)}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-500">
          Keep that reference — quote it in any message about this payment.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={whatsappLink(
              `Hi GetAJob, I have paid for ${receipt.plan?.name ?? plan.name}. My reference is ${receipt.reference}.`,
            )}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-primary w-full justify-center sm:w-auto"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Tell the team on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setReceipt(null)}
            className="btn btn-outline w-full justify-center sm:w-auto"
          >
            Submit another payment
          </button>
        </div>
      </div>
    );
  }

  return (
    /**
     * Bank card and form, side by side once there is room. The parent must give
     * this full width: nested in a half-width column the two cards end up around
     * 240px each and the form's fields overflow the section.
     */
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ── The account ─────────────────────────────────────────────── */}
      <section className="min-w-0 rounded-2xl border border-ink-900/10 bg-ink-950 p-5 text-white sm:p-6">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-300">
          <Landmark className="size-3.5" aria-hidden="true" />
          Pay by bank transfer
        </p>
        <p className="mt-2 font-display text-[30px] font-extrabold leading-none tracking-tight">
          {naira(plan.amount)}
        </p>
        <p className="mt-1 text-[12px] text-white/60">
          {plan.name} · one payment, nothing recurring
        </p>

        <dl className="mt-5 space-y-3 rounded-xl border border-white/12 bg-white/5 p-3.5 text-[13px]">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Account name
            </dt>
            <dd className="mt-0.5 font-semibold leading-snug">{BANK.accountName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Bank</dt>
            <dd className="mt-0.5 font-semibold">{BANK.bank}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Account number
            </dt>
            <dd className="mt-0.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="min-w-0 break-all font-mono text-[16px] font-bold tracking-[0.06em]">
                {BANK.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => void copy(BANK.accountNumber, "number")}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/20 px-2 py-1 text-[10.5px] font-semibold text-white/80 transition hover:bg-white/10"
              >
                {copied === "number" ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <Copy className="size-3" aria-hidden="true" />
                )}
                {copied === "number" ? "Copied" : "Copy"}
              </button>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Amount
            </dt>
            <dd className="mt-0.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="min-w-0 font-mono text-[15px] font-bold">{naira(plan.amount)}</span>
              <button
                type="button"
                onClick={() => void copy(String(plan.amount), "amount")}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/20 px-2 py-1 text-[10.5px] font-semibold text-white/80 transition hover:bg-white/10"
              >
                {copied === "amount" ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <Copy className="size-3" aria-hidden="true" />
                )}
                {copied === "amount" ? "Copied" : "Copy"}
              </button>
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[11px] leading-relaxed text-white/45">
          Transfer the exact amount and use <span className="text-white/70">{BANK.narrationHint}</span>{" "}
          as the narration, so we can match it quickly.
        </p>

        <ol className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[11.5px] leading-relaxed text-white/60">
          {[
            "Transfer the amount above to the account.",
            "Screenshot the receipt from your bank app.",
            `Upload it as your ${PROOF_LABEL.toLowerCase()} in the form.`,
            "We confirm it, then email you the next step.",
          ].map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-brand-400/20 text-[9px] font-bold text-brand-200">
                {index + 1}
              </span>
              <span className="min-w-0">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── The form ────────────────────────────────────────────────── */}
      <form
        onSubmit={submit}
        className="relative min-w-0 max-w-full rounded-2xl border border-ink-100 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(5,20,15,0.3)] sm:p-6"
      >
        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="pay-website">Website</label>
          <input id="pay-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900">
          {compact ? "Confirm your payment" : "Upload your proof of payment"}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
          Paid already? Send us the receipt and we will confirm it against the account.
        </p>

        {!compact ? (
          <fieldset className="mt-4">
            <legend className="label">What are you paying for?</legend>
            <div className="mt-1.5 grid gap-2">
              {PAY_PLANS.map((option) => {
                const active = option.id === planId;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition ${
                      active
                        ? "border-brand-400 bg-brand-50/70 ring-1 ring-brand-200"
                        : "border-ink-200 bg-white hover:border-brand-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="planId"
                      value={option.id}
                      checked={active}
                      onChange={() => setPlanId(option.id)}
                      className="mt-1 size-3.5 shrink-0 accent-brand-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="text-[12.5px] font-semibold text-ink-900">{option.name}</span>
                        <span className="text-[12.5px] font-bold tabular-nums text-brand-800">
                          {option.price}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
                        {option.blurb}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <input type="hidden" name="planId" value={plan.id} />
        )}

        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <label className="label" htmlFor="pay-name">
              Full name
            </label>
            <input
              id="pay-name"
              name="fullName"
              required
              autoComplete="name"
              className="field mt-1"
              placeholder="As it appears on the transfer"
            />
          </div>
          <div className="min-w-0">
            <label className="label" htmlFor="pay-email">
              Email
            </label>
            <input
              id="pay-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field mt-1"
              placeholder="you@example.com"
            />
          </div>
          <div className="min-w-0">
            <label className="label" htmlFor="pay-phone">
              Phone
            </label>
            <input
              id="pay-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className="field mt-1"
              placeholder={PHONE.local}
            />
          </div>
          <div className="min-w-0 sm:col-span-2">
            <label className="label" htmlFor="pay-note">
              Anything we should know? <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <textarea
              id="pay-note"
              name="note"
              rows={2}
              className="field mt-1 resize-y"
              placeholder="The role you are targeting, or the name on the account you paid from."
            />
          </div>
        </div>

        <div className="mt-3">
          <span className="label">{PROOF_LABEL}</span>
          <label
            htmlFor="pay-proof"
            className="mt-1 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-3 py-2.5 text-sm transition hover:border-brand-300 hover:bg-brand-50/60"
          >
            <span className="flex min-w-0 items-center gap-2 font-medium text-ink-700">
              <UploadCloud className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="truncate">{proofName || "Upload payment screenshot *"}</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-brand-700">
              {proofName ? "Change" : "Browse"}
            </span>
            <input
              id="pay-proof"
              type="file"
              accept={PROOF_ACCEPT}
              className="sr-only"
              onChange={pickProof}
              required
            />
          </label>
          <p className="mt-1.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-400">
            <ReceiptText className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            {PROOF_HINT}
          </p>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11.5px] leading-relaxed text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary mt-4 w-full justify-center"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          {pending ? "Uploading…" : `Submit ${PROOF_LABEL.toLowerCase()}`}
        </button>

        <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[10.5px] leading-relaxed text-ink-400">
          <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          Your receipt is stored privately and seen only by the GetAJob team.
        </p>

        <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink-400">
          Paid but cannot upload? Send the screenshot to{" "}
          <a
            href={whatsappLink(`Hi GetAJob, I have paid for ${plan.name} but could not upload my receipt.`)}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-brand-700 hover:underline"
          >
            {PHONE.display}
          </a>{" "}
          on WhatsApp.
        </p>
      </form>
    </div>
  );
}
