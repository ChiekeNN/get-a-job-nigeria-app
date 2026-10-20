import {
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CONTACT, PHONE, SOCIAL, mailto, whatsappLink } from "@/data/contact";
import { PRO } from "@/data/pro";
import { BRAND } from "@/data/site";

const WHATSAPP = whatsappLink("Hello GetAJob, I need help with my job search");

/** Facebook's mark, drawn inline because lucide no longer ships brand icons. */
function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.2h2.4l.36-2.8H13.5V9.2c0-.81.22-1.36 1.38-1.36h1.48V5.34c-.26-.03-1.14-.11-2.17-.11-2.15 0-3.62 1.31-3.62 3.72v2.05H8.16v2.8h2.41V21h2.93Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-950 text-white">
      <div className="wrap py-14">
        {/* Job Seeker Pro gets its own row here: the footer is on every page,
            and this is where a visitor who has read to the bottom decides. */}
        <div className="mb-10 flex flex-col gap-4 overflow-hidden rounded-2xl border border-amber-300/25 bg-gradient-to-r from-amber-300/[0.09] via-amber-300/[0.04] to-transparent p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber-300">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {PRO.name}
            </p>
            <p className="mt-1.5 font-display text-[17px] font-extrabold leading-snug text-white sm:text-xl">
              {PRO.headline} <span className="text-brand-300">{PRO.headlineAccent}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/60">
              <span className="font-semibold text-white/85">
                {PRO.price} {PRO.cadence}
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3 text-brand-400" aria-hidden="true" />
                Nothing renews
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3 text-brand-400" aria-hidden="true" />
                No monthly fee
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link href="/pro#start" className="btn btn-amber w-full justify-center sm:w-auto">
              {PRO.cta}
            </Link>
            <Link
              href="/pro"
              className="btn w-full justify-center border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              See what is included
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label={`${BRAND.tradingName} home`} className="inline-flex">
              {/* The supplied logo is green and black, so it sits on a light plate
                  rather than being recoloured for the dark footer. */}
              <span className="inline-flex rounded-2xl bg-white px-4 py-3">
                <Image
                  src="/brand/logo.png"
                  alt={`${BRAND.tradingName} — ${BRAND.domain}`}
                  width={220}
                  height={145}
                  className="h-auto w-[190px] sm:w-[210px]"
                />
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              The placement-first job network for Nigerian talent. Verified employers, transparent
              Naira salaries, and human follow-up — from Lagos to Maiduguri.
            </p>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>

            <div className="mt-5 space-y-2 text-sm text-white/70">
              <a href={`tel:${PHONE.tel}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="size-4 text-brand-400" aria-hidden="true" />
                {PHONE.display}
              </a>
              <a
                href={mailto(CONTACT.support, "Support request")}
                className="flex items-center gap-2 hover:text-white"
              >
                <Mail className="size-4 text-brand-400" aria-hidden="true" />
                {CONTACT.support}
              </a>
              <a
                href={mailto(CONTACT.info, "Enquiry")}
                className="flex items-center gap-2 hover:text-white"
              >
                <Mail className="size-4 text-brand-400" aria-hidden="true" />
                {CONTACT.info}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden="true" />
                14 Adeola Odeku Street, Victoria Island, Lagos
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              For job seekers
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1.5 font-semibold text-amber-300 transition hover:text-amber-200"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  {PRO.name}
                </Link>
              </li>
              {[
                ["Home", "/"],
                ["Find jobs", "/jobs"],
                ["Career advice", "/blog"],
                ["Browse categories", "/#categories"],
                ["All states", "/states"],
                ["CV writing service", "/cv-writing"],
                // Both CV paths end in a WhatsApp hand-off; the writing service
                // is the one that is actually a rewrite.
                ["Upload your CV", "/cv-writing#order"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              For employers
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {[
                ["Post a job", "/employers#post-job"],
                ["Employer dashboard", "/employers"],
                ["Hiring advice", "/blog/topic/hiring"],
                ["Talent sourcing", "/employers#talent"],
                ["Pricing in Naira", "/employers#pricing"],
                ["Talk to sales", "/employers#contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {[
                [`About ${BRAND.name}`, "/#how-it-works"],
                ["Success stories", "/#stories"],
                ["Privacy policy", "/legal#privacy"],
                ["Terms & conditions", "/terms"],
                ["CV & data policy", "/legal#cv"],
                ["Contact us", "/contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${BRAND.name} on Facebook`}
                className="grid size-8 place-items-center rounded-lg bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <FacebookMark className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.tradingName} · Owned by {BRAND.legalName} ·{" "}
            {BRAND.legalRegistration}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-white/60">
              <ShieldCheck className="size-3.5 text-brand-400" aria-hidden="true" />
              Verified employers only
            </span>
            <Link href="/legal" className="inline-flex items-center gap-1 hover:text-white">
              Legal & policies
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
