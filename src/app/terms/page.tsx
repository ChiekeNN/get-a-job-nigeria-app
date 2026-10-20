import { AlertTriangle, ArrowRight, Info, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT, PHONE, whatsappLink } from "@/data/contact";
import { BRAND } from "@/data/site";
import {
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  type TermsSection,
} from "@/data/terms";

export const metadata: Metadata = {
  title: "Terms & Conditions — GetAJob Nigeria",
  description:
    "The terms that govern GetAJob.com.ng: job seeker and employer rules, paid career services, payments and refunds, privacy, and liability. Operated by Jojuni Technologies Ltd.",
};

type Block = TermsSection["blocks"][number];

/** Renders one block of terms copy. Sub-sections recurse one level. */
function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === "p") {
          return (
            <p key={index} className="mt-2 text-[13px] leading-relaxed text-ink-600">
              {block.text}
            </p>
          );
        }

        if (block.kind === "list") {
          return (
            <ul key={index} className="mt-2.5 space-y-1.5">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-600"
                >
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "warn") {
          return (
            <div
              key={index}
              className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[12.5px] leading-relaxed text-amber-900"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="min-w-0">{block.text}</p>
            </div>
          );
        }

        return (
          <div key={index} className="mt-4">
            <h3 className="font-display text-[13.5px] font-bold text-ink-900">{block.title}</h3>
            <Blocks blocks={block.blocks} />
          </div>
        );
      })}
    </>
  );
}

export default function TermsPage() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-brand-50/70 to-white">
        <div className="wrap py-9 sm:py-12">
          <p className="eyebrow">
            <Scale className="size-3.5 text-brand-600" aria-hidden="true" />
            Legal centre
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{TERMS_INTRO}</p>

          <dl className="mt-5 flex flex-wrap gap-2 text-[11.5px]">
            {[
              ["Last updated", TERMS_LAST_UPDATED],
              ["Owned by", `${BRAND.legalName} · ${BRAND.legalRegistration}`],
              ["Website", BRAND.domain],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-ink-100 bg-white px-3 py-1.5 text-ink-600"
              >
                <dt className="inline font-semibold text-ink-900">{label}: </dt>
                <dd className="inline">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Contents ─────────────────────────────────────────────────── */}
      <section className="wrap mt-8">
        <div className="card p-4 sm:p-5">
          <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
            <Info className="size-3.5" aria-hidden="true" />
            On this page
          </h2>
          <nav aria-label="Terms contents" className="mt-3">
            <ol className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {TERMS_SECTIONS.map((section) => (
                <li key={section.id} className="min-w-0">
                  <a
                    href={`#${section.id}`}
                    className="flex items-baseline gap-2 py-1 text-[12.5px] text-ink-600 transition hover:text-brand-700"
                  >
                    <span className="w-5 shrink-0 font-mono text-[11px] text-ink-300">
                      {section.number.padStart(2, "0")}
                    </span>
                    <span className="min-w-0">{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* ── Sections ─────────────────────────────────────────────────── */}
      <div className="wrap mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {TERMS_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="card scroll-mt-24 p-5 sm:p-6"
            >
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink-950 font-mono text-[11px] font-bold text-white">
                  {section.number.padStart(2, "0")}
                </span>
                <h2 className="min-w-0 pt-0.5 font-display text-lg font-bold leading-snug text-ink-900">
                  {section.title}
                </h2>
              </div>
              <div className="mt-1">
                <Blocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="wrap my-10 sm:my-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink-950 px-5 py-6 text-white sm:flex-row sm:items-center sm:px-7">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold sm:text-xl">
              Questions about any of this?
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/70">
              {CONTACT.info} · WhatsApp {PHONE.local} · replies within 24–48 hours on business days.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <a
              href={whatsappLink("Hi GetAJob, I have a question about your terms.")}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-amber w-full justify-center sm:w-auto"
            >
              Ask on WhatsApp
            </a>
            <Link
              href="/legal"
              className="btn w-full justify-center border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Legal centre
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
