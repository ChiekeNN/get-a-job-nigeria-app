import { BadgeCheck, Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ProSection } from "@/components/home/ProSection";
import { Testimonials } from "@/components/home/Sections";

export const metadata: Metadata = {
  title: "Job Seeker Pro — CV rewrites, referrals and WhatsApp job alerts",
  description:
    "Career support priced in Naira: professional CV rewrite, daily WhatsApp job alerts and direct referrals from ₦8,000 per month.",
};

const FAQS = [
  {
    question: "Do I pay before I get any value?",
    answer:
      "No card is collected upfront. A career adviser confirms your goals on WhatsApp first, then sends a Naira payment link only after you accept the plan.",
  },
  {
    question: "Which states do you cover for alerts?",
    answer:
      "All 36 states and the FCT. You choose your state, industry and salary expectation, and we send matching verified roles every morning by 8am.",
  },
  {
    question: "How does the referral track work?",
    answer:
      "We match you to hiring managers in our employer network who have active roles. You get a warm introduction plus interview prep tailored to that company.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Monthly plans can be cancelled from WhatsApp before the next cycle. There are no lock-in contracts or exit fees.",
  },
];

export default function ProPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <div className="wrap py-10 sm:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Job Seeker Pro
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px]">
            The career support that makes Nigerian employers call you.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
            CV rewrites by recruiters, daily WhatsApp alerts and direct referrals — all priced in
            Naira, starting at ₦8,000/month. Built for the reality of the Nigerian job market.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11.5px] text-white/65">
            {["Cancel anytime", "Human recruiter support", "No card needed to start", "36 states + FCT"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-brand-400" aria-hidden="true" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <div className="-mt-6">
        <ProSection />
      </div>

      <section className="wrap mt-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">
              <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
              Questions, answered
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[30px]">
              Straight answers before you pay
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              We keep the process transparent — the same standard we ask employers to follow on
              GetAJob.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5 text-[11.5px] leading-relaxed text-brand-900">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <p>
                GetAJob never asks candidates to pay for a job offer. Pro is an optional career
                service, not a placement fee.
              </p>
            </div>
            <a
              href="https://wa.me/2348030004421?text=I%20have%20a%20question%20about%20Job%20Seeker%20Pro"
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-outline mt-4"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="card group p-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink-900">
                  {faq.question}
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink-50 text-ink-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="wrap mt-14">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-brand-600 px-5 py-6 text-white sm:flex-row sm:px-7">
          <div>
            <h2 className="font-display text-xl font-extrabold">Still job hunting without replies?</h2>
            <p className="mt-1 text-sm text-white/85">
              Upload your CV for a free review — no payment, no obligation.
            </p>
          </div>
          <Link href="/jobs" className="btn shrink-0 bg-white text-brand-800 hover:bg-brand-50">
            Find your next role
          </Link>
        </div>
      </section>
    </>
  );
}
