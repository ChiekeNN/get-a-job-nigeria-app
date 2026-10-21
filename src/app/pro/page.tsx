import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AlertsForm } from "@/components/pro/ProForms";
import { CheckoutFlow } from "@/components/payments/CheckoutFlow";
import { CONTACT, PHONE, mailto, whatsappLink } from "@/data/contact";
import {
  PRO,
  PRO_FAQS,
  PRO_FEATURES,
  PRO_INCLUDED,
  PRO_PAIN_POINTS,
  PRO_STEPS,
} from "@/data/pro";

export const metadata: Metadata = {
  title: "Job Seeker Pro — CV rewrite, WhatsApp job alerts and interview coaching",
  description:
    "Job Seeker Pro: a professional CV rewrite, verified WhatsApp job alerts, referrals and interview coaching for a one-time payment of ₦15,300.",
};

export default function ProPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 size-64 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="wrap relative py-9 sm:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-amber-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Placement-first, not application-first
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-[30px] font-extrabold leading-[1.06] tracking-tight sm:text-[46px]">
            {PRO.headline}
            <span className="mt-1 block text-brand-300">{PRO.headlineAccent}</span>
          </h1>

          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-white/70 sm:text-[15px]">
            {PRO.promise}
          </p>

          <p className="mt-4 inline-flex flex-wrap items-baseline gap-x-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-[12.5px] text-white/80">
            <span className="font-display text-lg font-extrabold text-white">
              {PRO.price}
              <span className="ml-1 text-[11px] font-medium text-white/50">{PRO.cadence}</span>
            </span>
            <span className="text-white/45">·</span>
            <span>
              <strong className="font-semibold text-brand-300">No monthly fees</strong>, nothing renews
            </span>
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <a href="#start" className="btn btn-amber w-full justify-center sm:w-auto">
              {PRO.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href={whatsappLink(`Hi GetAJob, I'd like to know more about ${PRO.name}.`)}
              target="_blank"
              rel="noreferrer noopener"
              className="btn w-full justify-center border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/65">
            {["Pay once", "No monthly fees", "36 states + FCT", "Priority WhatsApp support"].map(
              (item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-brand-400" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────────────── */}
      <section className="wrap mt-10 sm:mt-14">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="min-w-0">
            <p className="eyebrow">
              <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
              Sound familiar?
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
              Are you struggling to get interview calls?
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
              Applying more is not the answer. Being seen by the right person, with the right CV, is.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5 text-[11.5px] leading-relaxed text-brand-900">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <p>
                GetAJob never asks candidates to pay for a job offer. Pro is an optional career
                service, not a placement fee.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-2.5">
            {PRO_PAIN_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-white p-3.5"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
                  <X className="size-3" aria-hidden="true" />
                </span>
                <p className="min-w-0 text-[12.5px] leading-relaxed text-ink-700">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Everything included ──────────────────────────────────────── */}
      <section className="wrap mt-12 sm:mt-16">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
            What you get
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Everything included in Job Seeker Pro
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            One payment, five things that actually move a Nigerian recruiter.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PRO_FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`card min-w-0 p-4 sm:p-5 ${
                index === 0 ? "border-brand-200 bg-brand-50/40" : ""
              }`}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                <feature.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-display text-[15px] font-bold leading-snug text-ink-900">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="wrap mt-12 sm:mt-16">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="min-w-0">
            <p className="eyebrow">
              <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
              Simple pricing
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
              One price. No hidden fees.
            </h2>
            <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-ink-500">
              One payment of {PRO.price} covers everything below, paid by bank transfer. There is no
              monthly charge and nothing renews.
            </p>
            <p className="mt-3 text-[11.5px] text-ink-400">
              Questions about a plan?{" "}
              <a
                href={mailto(CONTACT.jobSeekerPro, "Job Seeker Pro")}
                className="font-semibold text-brand-700 hover:text-brand-900"
              >
                {CONTACT.jobSeekerPro}
              </a>{" "}
              · Billing:{" "}
              <a
                href={mailto(CONTACT.billings, "Billing")}
                className="font-semibold text-brand-700 hover:text-brand-900"
              >
                {CONTACT.billings}
              </a>
            </p>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-[22px] border border-ink-950/10 bg-ink-950 p-5 text-white shadow-[0_30px_70px_-40px_rgba(5,20,15,0.9)] sm:p-6">
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-500/25 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-ink-950">
                One-time payment · no renewals
              </span>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/55">
                {PRO.name}
              </p>
              <p className="mt-1 font-display text-[40px] font-extrabold leading-none">
                {PRO.price}
                <span className="ml-1.5 text-[12px] font-medium text-white/50">{PRO.cadence}</span>
              </p>

              <ul className="mt-4 space-y-2">
                {PRO_INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
                    <CheckCircle2
                      className="mt-0.5 size-3.5 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 text-white/80">{item}</span>
                  </li>
                ))}
              </ul>

              <a href="#start" className="btn btn-amber mt-5 w-full justify-center">
                {PRO.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <p className="mt-2 text-center text-[10.5px] text-white/40">
                Paid once — no monthly charge, nothing renewing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="wrap mt-12 sm:mt-16">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
            How it works
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            From sign-up to interview call in five steps
          </h2>
        </div>

        <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PRO_STEPS.map((step, index) => (
            <li key={step.title} className="card min-w-0 p-4">
              <span className="grid size-8 place-items-center rounded-full bg-ink-950 font-display text-[13px] font-extrabold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 font-display text-[14.5px] font-bold leading-snug text-ink-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="wrap mt-12 sm:mt-16">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="min-w-0">
            <p className="eyebrow">
              <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
              Questions, answered
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
              Straight answers before you pay
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
              Still unsure? Message the team on WhatsApp — the same people who will coach you.
            </p>
            <a
              href={whatsappLink(`I have a question about ${PRO.name}`)}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-outline mt-4 w-full justify-center sm:w-auto"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <p className="mt-3 text-[11.5px] text-ink-400">
              Or call {PHONE.display}, Monday to Saturday.
            </p>
          </div>

          <div className="min-w-0 space-y-2.5">
            {PRO_FAQS.map((faq) => (
              <details key={faq.question} className="card group p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start justify-between gap-3 text-[13px] font-semibold text-ink-900">
                  <span className="min-w-0">{faq.question}</span>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink-50 text-ink-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-500">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Start ────────────────────────────────────────────────────── */}
      <section id="start" className="wrap mt-12 scroll-mt-24 sm:mt-16">
        <div className="relative overflow-hidden rounded-[26px] bg-ink-950 p-5 text-white sm:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden="true"
          />
          {/* Copy first, then the checkout at full width: the bank card and
              the form each need room, and a third column inside this card left
              them too narrow to read. */}
          <div className="relative grid grid-cols-1 gap-6 lg:gap-8">
            <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[1fr_16rem] lg:items-start">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-300">
                Start here
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">
                Start with one payment
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/65">
                Transfer {PRO.price} to Jojuni Technologies Ltd at Fidelity Bank, then upload the
                receipt below. We confirm it and the rewrite starts — no monthly fee, nothing
                renewing.
              </p>

              <ul className="mt-4 space-y-2.5">
                {[
                  `${PRO.price} once. No monthly fee, nothing renewing.`,
                  "Upload your proof of payment and we confirm it the same working day.",
                  "Your details are never sold or shared with employers without your say-so.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[12px] leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-400" aria-hidden="true" />
                    <span className="min-w-0 text-white/70">{line}</span>
                  </li>
                ))}
              </ul>

            </div>

            <div className="rounded-xl border border-white/12 bg-white/5 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                Prefer to talk first?
              </p>
              <a
                href={whatsappLink(`Hi GetAJob, I'd like to start ${PRO.name}.`)}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1.5 flex items-center gap-2 text-[13px] font-semibold text-brand-300 hover:text-brand-200"
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                {PHONE.display}
              </a>
              <p className="mt-1 text-[11px] text-white/40">Monday to Saturday, 9am – 6pm.</p>
            </div>
            </div>

            <div className="min-w-0 rounded-[22px] bg-cream p-3 sm:p-4">
              <CheckoutFlow initialPlan="pro" compact />
            </div>
          </div>
        </div>
      </section>

      {/* ── Free alerts ──────────────────────────────────────────────── */}
      <section className="wrap mt-10 sm:mt-12">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
              Not ready for Pro? Start with the free digest.
            </h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
              Every morning we send verified openings that match your state and field. No cost, no
              card, unsubscribe any time — and you can upgrade to Pro whenever you want the CV work
              and the coaching.
            </p>
            <Link href="/jobs" className="btn btn-outline mt-4 w-full justify-center sm:w-auto">
              Browse the job board
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="min-w-0">
            <AlertsForm />
          </div>
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────────────────────── */}
      <section className="wrap my-12 sm:my-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-600 px-5 py-6 text-white sm:flex-row sm:items-center sm:px-7">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">
              Your dream job is waiting. Don&apos;t keep it waiting.
            </h2>
            <p className="mt-1 text-[13px] text-white/85">
              Join the members getting hired faster — one payment of {PRO.price}, nothing monthly.
            </p>
          </div>
          <a href="#start" className="btn w-full shrink-0 justify-center bg-white text-brand-800 hover:bg-brand-50 sm:w-auto">
            {PRO.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
