import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { CONTACT, PHONE, whatsappLink } from "@/data/contact";
import Link from "next/link";

import { EmployerDashboard } from "@/components/employers/EmployerDashboard";
import { listJobs } from "@/lib/jobs-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "For employers — post jobs and hire verified Nigerian talent",
  description:
    "Post a job free for 7 days and reach Nigerian job seekers across the 36 states and FCT. Screened shortlists in 48 hours.",
};

const PLANS = [
  {
    name: "Starter",
    price: "₦0",
    cadence: "first 7 days",
    blurb: "Test the platform with your next role.",
    features: ["1 live listing", "Basic applicant list", "Email support"],
    featured: false,
  },
  {
    name: "Growth",
    price: "₦45,000",
    cadence: "per role / month",
    blurb: "Best for SMEs hiring monthly.",
    features: [
      "5 live listings",
      "AI + human CV screening",
      "WhatsApp shortlist delivery",
      "Featured placement on homepage",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "₦180,000",
    cadence: "per month",
    blurb: "For banks, telcos and oil majors.",
    features: [
      "Unlimited listings",
      "Dedicated recruiter",
      "Assessment Centre support",
      "Employer brand page",
    ],
    featured: false,
  },
];

export default async function EmployersPage() {
  const jobs = await listJobs();
  // Everything the hero claims about the board is measured from the board.
  const liveRoles = jobs.length;
  const employers = new Set(jobs.map((job) => job.company)).size;
  const locations = new Set(jobs.map((job) => job.state)).size;
  const applicantTotal = jobs.reduce((sum, job) => sum + job.applicants, 0);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <div className="wrap relative py-10 sm:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/30 bg-brand-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-200">
            <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
            Employer view
          </span>
          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h1 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px]">
                Hire verified Nigerian talent in
                <span className="text-brand-300"> 48 hours.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
                Post your role free and put it beside {liveRoles.toLocaleString("en-NG")} live
                openings across {locations} states. Every applicant arrives with a CV, salary
                expectation and availability — priced in Naira, not dollars.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link href="#post-job" className="btn btn-primary">
                  Post a job — free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappLink("I want to hire on GetAJob")}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-outline !border-white/25 !bg-white/5 !text-white hover:!bg-white/10"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Talk to sales
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[11.5px] text-white/65">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-brand-400" aria-hidden="true" />
                  Vetted candidate pool
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-brand-400" aria-hidden="true" />
                  Free for the first 7 days
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-brand-400" aria-hidden="true" />
                  {applicantTotal.toLocaleString("en-NG")} applications recorded so far
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: BriefcaseBusiness,
                  value: liveRoles.toLocaleString("en-NG"),
                  label: "Live roles today",
                  note: "Open on the board",
                },
                {
                  icon: BadgeCheck,
                  value: employers.toLocaleString("en-NG"),
                  label: "Employers hiring",
                  note: "From banks to startups",
                },
                {
                  icon: Users,
                  value: applicantTotal.toLocaleString("en-NG"),
                  label: "Applications recorded",
                  note: "Since launch",
                },
                {
                  icon: Sparkles,
                  value: String(locations),
                  label: "Locations covered",
                  note: "States and the FCT",
                },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur"
                >
                  <tile.icon className="size-4 text-brand-300" aria-hidden="true" />
                  <p className="mt-2 font-display text-xl font-extrabold">{tile.value}</p>
                  <p className="text-xs font-semibold text-white/80">{tile.label}</p>
                  <p className="mt-0.5 text-[10.5px] text-white/50">{tile.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EmployerDashboard initialJobs={jobs.slice(0, 5)} totalJobs={jobs.length} />

      <section id="pricing" className="wrap scroll-mt-24">
        <div className="text-center">
          <p className="eyebrow mx-auto">
            <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
            Employer pricing in Naira
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Pay for outcomes, not impressions
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-500">
            Transparent monthly pricing. No hidden dollar charges, no per-click billing.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card relative flex flex-col p-5 ${
                plan.featured ? "border-brand-300 shadow-[0_24px_50px_-38px_rgba(7,142,88,0.8)]" : ""
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-2.5 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{plan.name}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-ink-900">
                {plan.price}
                <span className="ml-1 text-[11px] font-medium text-ink-400">{plan.cadence}</span>
              </p>
              <p className="mt-1 text-xs text-ink-500">{plan.blurb}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[12.5px] text-ink-600">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="#post-job"
                className={`btn mt-4 w-full ${plan.featured ? "btn-primary" : "btn-outline"}`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="talent" className="wrap mt-12 scroll-mt-24">
        <div className="grid gap-4 rounded-[26px] border border-ink-100 bg-white p-5 sm:p-7 lg:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Pre-screened shortlists",
              body: "We verify experience, certifications (COREN, NEBOSH, ICAN, NMCN) and availability before candidates reach you.",
            },
            {
              icon: Clock,
              title: "48-hour turnaround",
              body: "Your dedicated recruiter delivers a WhatsApp shortlist within two working days of publishing.",
            },
            {
              icon: BadgeCheck,
              title: "Salary benchmarking",
              body: "Real Naira benchmarks from live roles help you make offers that get accepted first time.",
            },
          ].map((item) => (
            <div key={item.title}>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="wrap mt-10 scroll-mt-24">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-brand-600 px-5 py-6 text-white sm:flex-row sm:px-7">
          <div>
            <h2 className="font-display text-xl font-extrabold">Need a hiring partner today?</h2>
            <p className="mt-1 text-sm text-white/85">
              WhatsApp our employer desk on {PHONE.display} or email {CONTACT.info}.
            </p>
          </div>
          <a
            href={whatsappLink("I need help hiring on GetAJob")}
            target="_blank"
            rel="noreferrer noopener"
            className="btn shrink-0 bg-white text-brand-800 hover:bg-brand-50"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Chat with the employer desk
          </a>
        </div>
      </section>
    </>
  );
}
