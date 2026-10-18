import {
  ArrowUpRight,
  AtSign,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rss,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { CONTACT, mailto } from "@/data/contact";
import { BRAND } from "@/data/site";

const WHATSAPP = "https://wa.me/2348030004421?text=Hello%20GetAJob%2C%20I%20need%20help%20with%20my%20job%20search";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-950 text-white">
      <div className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight">
              {BRAND.wordmarkLead}
              <span className="text-brand-400">{BRAND.wordmarkAccent}</span>
            </p>
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
              <a href="tel:+2348030004421" className="flex items-center gap-2 hover:text-white">
                <Phone className="size-4 text-brand-400" aria-hidden="true" />
                +234 803 000 4421
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
              {[
                ["Find jobs", "/jobs"],
                ["Browse categories", "/#categories"],
                ["All states", "/states"],
                ["Job Seeker Pro", "/pro"],
                ["Upload your CV", "/#pro"],
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
                ["Terms of use", "/legal#terms"],
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
              {[Globe, AtSign, Rss].map((Icon, index) => (
                <a
                  key={index}
                  href="https://wa.me/2348030004421"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${BRAND.name} social profile`}
                  className="grid size-8 place-items-center rounded-lg bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. {BRAND.legalRegistration}. All rights reserved.</p>
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
