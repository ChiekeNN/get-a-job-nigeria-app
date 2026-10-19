"use client";

import { ArrowRight, BadgeCheck, Check, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

import { PRO, PRO_FEATURES, PRO_INCLUDED } from "@/data/pro";
import { whatsappLink } from "@/data/contact";

/**
 * The homepage face of Job Seeker Pro.
 *
 * Deliberately one decision: start the trial. The price, the free window and
 * the three things people care about most sit above the button, and everything
 * else lives on /pro.
 */
export function ProSection() {
  const highlights = PRO_FEATURES.slice(0, 3);

  return (
    <section id="pro" className="wrap mt-14 scroll-mt-24 sm:mt-16">
      <div className="relative overflow-hidden rounded-[26px] bg-ink-950 text-white shadow-[0_40px_90px_-50px_rgba(5,20,15,0.9)]">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-4 size-72 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 gap-7 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10 lg:p-10">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-amber-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {PRO.name} · {PRO.trialDays}-day free trial
            </span>

            <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.08] tracking-tight sm:text-[36px]">
              {PRO.headline}
              <span className="mt-1 block text-brand-300">{PRO.headlineAccent}</span>
            </h2>

            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-white/70 sm:text-[14px]">
              A professional CV rewrite, verified WhatsApp job alerts and interview coaching — the
              three things that actually get a Nigerian recruiter to call you back.
            </p>

            <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {highlights.map((feature) => (
                <li
                  key={feature.title}
                  className="flex min-w-0 items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-500/20 text-brand-300">
                    <feature.icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-snug text-white">{feature.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-sm sm:p-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="flex flex-wrap items-baseline gap-x-1.5 font-display text-[34px] font-extrabold leading-none">
                {PRO.price}
                <span className="text-[11px] font-medium text-white/50">{PRO.cadence}</span>
              </p>
              <span className="shrink-0 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink-950">
                Free for {PRO.trialDays} days
              </span>
            </div>

            <ul className="mt-3 space-y-1.5">
              {PRO_INCLUDED.slice(0, 5).map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11.5px] leading-relaxed">
                  <Check className="mt-0.5 size-3 shrink-0 text-brand-400" aria-hidden="true" />
                  <span className="min-w-0 text-white/75">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/pro#start"
              className="btn btn-amber mt-4 w-full justify-center"
            >
              Start my free trial
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/pro"
              className="mt-2 block text-center text-[11.5px] font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline"
            >
              See everything included
            </Link>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <span className="inline-flex items-center gap-1 text-[10.5px] text-white/50">
                <BadgeCheck className="size-3.5 text-brand-400" aria-hidden="true" />
                Cancel anytime
              </span>
              <a
                href={whatsappLink(`Hi GetAJob, I'd like to know more about ${PRO.name}.`)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-300 hover:text-brand-200"
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
