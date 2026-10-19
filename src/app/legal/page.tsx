import { FileCheck2, Lock, Scale } from "lucide-react";
import type { Metadata } from "next";

import { CONTACT, PHONE } from "@/data/contact";
import { BRAND } from "@/data/site";

export const metadata: Metadata = {
  title: "Legal, privacy and candidate policies",
  description:
    "GetAJob privacy policy, terms of use and CV data policy for candidates and employers in Nigeria.",
};

export default function LegalPage() {
  return (
    <div className="wrap py-10">
      <p className="eyebrow">
        <Scale className="size-3.5 text-brand-600" aria-hidden="true" />
        Legal centre
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Policies written in plain language
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
        {BRAND.tradingName} is owned and operated by {BRAND.legalName}, registered in Nigeria (
        {BRAND.legalRegistration}). These policies explain how we handle candidate data, employer
        listings and payments in Naira. Last updated January 2026.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section id="privacy" className="card p-5 scroll-mt-24">
          <Lock className="size-5 text-brand-600" aria-hidden="true" />
          <h2 className="mt-2 font-display text-lg font-bold text-ink-900">Privacy policy</h2>
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-ink-600">
            <p>
              We collect your name, email, phone number, location, CV file and job preferences when
              you create a profile, apply for a role or subscribe to alerts.
            </p>
            <p>
              Your profile is shared only with employers you explicitly apply to. We do not sell
              personal data to third parties or list your CV publicly.
            </p>
            <p>
              Email is sent through reputable providers; WhatsApp alerts are delivered only after you
              opt in and can be stopped by replying STOP.
            </p>
            <p>
              Request deletion of your data any time at {CONTACT.support} — we action verified
              requests within 7 working days.
            </p>
          </div>
        </section>

        <section id="terms" className="card p-5 scroll-mt-24">
          <FileCheck2 className="size-5 text-brand-600" aria-hidden="true" />
          <h2 className="mt-2 font-display text-lg font-bold text-ink-900">Terms of use</h2>
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-ink-600">
            <p>
              GetAJob is a job discovery platform, not an employer or recruitment agency. Hiring
              decisions and employment contracts are between you and the employer.
            </p>
            <p>
              Candidates must provide accurate information. Employers must disclose a genuine
              salary range and may not charge candidates any fee.
            </p>
            <p>
              Pro subscriptions are optional career services billed in Naira. Monthly plans renew
              unless cancelled before the next cycle.
            </p>
            <p>
              We may remove listings that violate these terms, including misleading salaries or
              unverified company details.
            </p>
          </div>
        </section>

        <section id="cv" className="card p-5 scroll-mt-24">
          <FileCheck2 className="size-5 text-brand-600" aria-hidden="true" />
          <h2 className="mt-2 font-display text-lg font-bold text-ink-900">CV & data policy</h2>
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-ink-600">
            <p>
              Uploaded CVs are stored securely, encrypted at rest, and reviewed only by GetAJob
              career advisers and the employers you apply to.
            </p>
            <p>
              We retain application records for up to 24 months unless you request earlier deletion,
              so we can recommend you for similar roles.
            </p>
            <p>
              File attachments are capped at 5MB and accepted in PDF, DOC or DOCX format. Virus
              scanning is applied to every upload.
            </p>
            <p>
              You may ask for the CV you uploaded to be removed by emailing {CONTACT.support} from
              the address on your profile.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-6 card p-5 text-sm leading-relaxed text-ink-600">
        <h2 className="font-display text-base font-bold text-ink-900">Contact our data protection team</h2>
        <p className="mt-1">
          Email <span className="font-semibold text-brand-700">{CONTACT.support}</span> or call{" "}
          <span className="font-semibold text-brand-700">{PHONE.display}</span> (Mon–Fri, 9am–5pm
          WAT). Postal address: 14 Adeola Odeku Street, Victoria Island, Lagos.
        </p>
      </div>
    </div>
  );
}
