import { ArrowUpRight, Clock, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import {
  CONTACT,
  CONTACT_CHANNELS,
  PHONE,
  mailto,
  whatsappLink,
  type ContactAudience,
} from "@/data/contact";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Reach the right GetAJob team — support, job alerts, Job Seeker Pro, CV writing, billing, orders and escalations.",
};

const audiences: ContactAudience[] = ["Everyone", "Job seekers", "Employers"];

const groupCopy: Record<ContactAudience, string> = {
  Everyone: "Use these for anything that is not specific to a job seeker or an employer.",
  "Job seekers": "Alerts, Pro membership, CV rewrites and reporting a closed or broken listing.",
  Employers: "Hiring, posting roles and account questions for companies.",
};

export default function ContactPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-white">
        <div className="wrap py-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-800">
            <Mail className="size-3.5" aria-hidden="true" />
            We reply within one working day
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Contact GetAJob
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
            Email the desk that handles your question and you will skip the queue. Every address is
            monitored by a real person, Monday to Friday, 9am–5pm WAT.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href={mailto(CONTACT.support, "Support request")} className="btn btn-primary">
              <Mail className="size-4" aria-hidden="true" />
              Email support
            </a>
            <a
              href={whatsappLink("Hello GetAJob, I need help")}
              target="_blank"
              rel="noreferrer noopener"
              className="btn border border-ink-200 bg-white text-ink-900 hover:bg-ink-50"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${PHONE.tel}`}
              className="btn border border-ink-200 bg-white text-ink-900 hover:bg-ink-50"
            >
              <Phone className="size-4" aria-hidden="true" />
              {PHONE.display}
            </a>
          </div>
        </div>
      </section>

      <div className="wrap py-8">
        <div className="space-y-8">
          {audiences.map((audience) => {
            const channels = CONTACT_CHANNELS.filter((channel) => channel.audience === audience);
            if (channels.length === 0) return null;

            return (
              <section key={audience}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-ink-900">{audience}</h2>
                  <p className="text-xs text-ink-500">{groupCopy[audience]}</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {channels.map((channel) => (
                    <article key={channel.key} className="card flex flex-col p-4">
                      <h3 className="text-sm font-bold text-ink-900">{channel.label}</h3>
                      <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-600">
                        {channel.purpose}
                      </p>
                      <a
                        href={mailto(channel.email, channel.subject)}
                        className="mt-3 inline-flex items-center gap-1.5 break-all text-xs font-semibold text-brand-700 hover:text-brand-900"
                      >
                        <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                        {channel.email}
                        <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="card flex items-start gap-3 p-4">
            <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Response times</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                Support and general enquiries within one working day. Pro and CV services within 48
                hours. Billing questions within two working days.
              </p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Never pay for a job</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                GetAJob never charges candidates to apply and never asks for payment to secure an
                offer. Report any request for money to{" "}
                <a
                  href={mailto(CONTACT.support, "Report a recruiter requesting payment")}
                  className="font-semibold text-brand-700 hover:text-brand-900"
                >
                  {CONTACT.support}
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-500">
          Postal address: 14 Adeola Odeku Street, Victoria Island, Lagos. For data protection and
          privacy requests, email{" "}
          <a
            href={mailto(CONTACT.support, "Data protection request")}
            className="font-semibold text-brand-700 hover:text-brand-900"
          >
            {CONTACT.support}
          </a>{" "}
          with &ldquo;Data protection&rdquo; in the subject line.
        </p>
      </div>
    </div>
  );
}
