import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutFlow } from "@/components/payments/CheckoutFlow";
import { PROOF_LABEL, planById } from "@/data/payment";
import { BANK } from "@/data/payment";

export const metadata: Metadata = {
  title: "Pay by bank transfer",
  description:
    "Pay for Job Seeker Pro or a CV rewrite by bank transfer to Jojuni Technologies Ltd, then upload your proof of payment.",
};

interface PageProps {
  searchParams: Promise<{ plan?: string | string[] }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const plan = planById(requested) ?? null;

  return (
    <section className="wrap py-8 sm:py-12">
      <Link
        href="/pro"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back
      </Link>

      <div className="mt-4 max-w-2xl">
        <p className="eyebrow">
          <ShieldCheck className="size-3.5 text-brand-600" aria-hidden="true" />
          Secure bank transfer
        </p>
        <h1 className="mt-3 font-display text-[28px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[36px]">
          Pay into the account, then send us the receipt.
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
          Transfer the exact amount{plan ? ` for ${plan.name}` : ""} to {BANK.bank} — the account is
          in the name of {BANK.accountName}. Then upload a screenshot of your{" "}
          {PROOF_LABEL.toLowerCase()} so we can confirm the payment and start work.
        </p>
      </div>

      <div className="mt-6">
        <CheckoutFlow initialPlan={requested} />
      </div>

      <p className="mt-6 max-w-2xl text-[11px] leading-relaxed text-ink-400">
        {BANK.accountName} · {BANK.bank} · {BANK.accountNumber}. We never ask for your card details,
        your PIN or an OTP, and no one from GetAJob will send you a different account number. If
        anything looks wrong, call {""}
        <span className="font-semibold text-ink-600">+234 802 656 8715</span> before you transfer.
      </p>
    </section>
  );
}
