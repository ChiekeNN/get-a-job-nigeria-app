import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  FileText,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CvOrder } from "@/components/cv/CvOrder";
import { CONTACT, PHONE, mailto, whatsappLink } from "@/data/contact";
import {
  CV_FAQS,
  CV_PROMISES,
  CV_STEPS,
  CV_WRITING,
} from "@/data/cv-writing";

export const metadata: Metadata = {
  title: "Professional CV Writing — a recruiter-ready CV in 2–3 days",
  description:
    "Pay ₦5,000 once and Nigerian HR experts rewrite your CV. ATS-friendly, delivered in PDF and Word within 2–3 working days. Basic, Standard and Premium packages.",
};

export default function CvWritingPage() {
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
            <FileText className="size-3.5" aria-hidden="true" />
            CV Writing · from {CV_WRITING.fromPrice}
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-[30px] font-extrabold leading-[1.06] tracking-tight sm:text-[46px]">
            Get a professional CV that gets you interviews.
            <span className="mt-1 block text-brand-300">Written by Nigerian HR experts.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-white/70 sm:text-[15px]">
            {CV_WRITING.promise}
          </p>

          <p className="mt-4 inline-flex flex-wrap items-baseline gap-x-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-[12.5px] text-white/80">
            <span className="font-display text-lg font-extrabold text-white">
              {CV_WRITING.fromPrice}
              <span className="ml-1 text-[11px] font-medium text-white/50">one-time</span>
            </span>
            <span className="hidden text-white/45 sm:inline">·</span>
            <span>PDF &amp; Word in {CV_WRITING.turnaround}</span>
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <a href="#packages" className="btn btn-amber w-full justify-center sm:w-auto">
              {CV_WRITING.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href={whatsappLink("Hi GetAJob, I'd like to ask about the CV writing service.")}
              target="_blank"
              rel="noreferrer noopener"
              className="btn w-full justify-center border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/65">
            {[
              "One payment",
              "ATS-friendly",
              "PDF & Word",
              "100% confidential",
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-brand-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What you get out of it ───────────────────────────────────── */}
      <section className="wrap mt-10 sm:mt-14">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CV_PROMISES.map((promise) => (
            <article key={promise.title} className="card min-w-0 p-4">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                <CheckCircle2 className="size-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-display text-[14.5px] font-bold leading-snug text-ink-900">
                {promise.title}
              </h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{promise.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Packages + order form ────────────────────────────────────── */}
      <section className="wrap mt-12 sm:mt-16">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
            Choose your package
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            One payment. No subscription.
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            Whether you are a fresh graduate, mid-level professional or senior executive, there is a
            package for you. Everything is a single payment — nothing renews.
          </p>
        </div>

        <div className="mt-6">
          <CvOrder />
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
            Four steps, then a CV that works
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            No long forms and no back-and-forth by email. Everything happens in one WhatsApp thread.
          </p>
        </div>

        <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CV_STEPS.map((step, index) => (
            <li key={step.title} className="card min-w-0 p-4">
              <span className="grid size-8 place-items-center rounded-full bg-ink-950 font-display text-[13px] font-extrabold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 font-display text-[14.5px] font-bold leading-snug text-ink-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{step.body}</p>
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
              Still unsure which package fits? Send us the role you are targeting and we will tell you
              honestly.
            </p>
            <a
              href={whatsappLink("Hi GetAJob, which CV writing package should I pick?")}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-outline mt-4 w-full justify-center sm:w-auto"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <p className="mt-3 text-[11.5px] text-ink-400">
              Or email{" "}
              <a
                href={mailto(CONTACT.cvWriting, "CV writing service")}
                className="font-semibold text-brand-700 hover:text-brand-900"
              >
                {CONTACT.cvWriting}
              </a>
            </p>
            <p className="mt-1 text-[11.5px] text-ink-400">
              Or call {PHONE.display}, Monday to Saturday.
            </p>
          </div>

          <div className="min-w-0 space-y-2.5">
            {CV_FAQS.map((faq) => (
              <details
                key={faq.question}
                className="card group p-4 [&_summary::-webkit-details-marker]:hidden"
              >
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

      {/* ── Closing ──────────────────────────────────────────────────── */}
      <section className="wrap my-12 sm:my-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-600 px-5 py-6 text-white sm:flex-row sm:items-center sm:px-7">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">
              Ready for a CV that gets replies?
            </h2>
            <p className="mt-1 text-[13px] text-white/85">
              One payment from {CV_WRITING.fromPrice}, delivered in {CV_WRITING.turnaround}.
            </p>
          </div>
          <a
            href="#packages"
            className="btn w-full shrink-0 justify-center bg-white text-brand-800 hover:bg-brand-50 sm:w-auto"
          >
            Order my CV rewrite
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* A quiet line so nobody buys the CV here after already paying for Pro. */}
      <section className="wrap -mt-6 mb-12 sm:-mt-8 sm:mb-16">
        <p className="text-center text-[11.5px] leading-relaxed text-ink-400">
          Already a Job Seeker Pro member? Your CV rewrite is already included —{" "}
          <Link href="/pro" className="font-semibold text-brand-700 hover:text-brand-900">
            see what else Pro covers
          </Link>
          .
        </p>
      </section>
    </>
  );
}
