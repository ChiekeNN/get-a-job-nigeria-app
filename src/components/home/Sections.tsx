import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  FileText,
  Lock,
  MapPin,
  Rocket,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Job, JobStats } from "@/types";

const STEPS = [
  {
    icon: FileText,
    title: "Create your free profile",
    body: "Upload your CV once. We parse it, clean it up and turn it into a recruiter-ready profile.",
  },
  {
    icon: Search,
    title: "Get matched, not spammed",
    body: "Tell us your field, state and salary expectation. We surface roles that actually fit you.",
  },
  {
    icon: Rocket,
    title: "Apply in one click",
    body: "One profile, many employers. Track every application and get alerts when they respond.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="wrap mt-16 scroll-mt-24">
      <div className="rounded-[26px] border border-ink-100 bg-white px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">
              <Rocket className="size-3.5 text-brand-600" aria-hidden="true" />
              How GetAJob works
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[30px]">
              Three steps to your next offer
            </h2>
          </div>
          <Link href="/jobs" className="btn btn-outline self-start sm:self-auto">
            Start with jobs
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-ink-100 bg-cream/70 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-display text-2xl font-extrabold text-ink-200">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-50 pt-4 text-[11.5px] font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
            Verified employers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-brand-600" aria-hidden="true" />
            Human follow-up
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-brand-600" aria-hidden="true" />
            Salary disclosed upfront
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
            All 36 states + FCT
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * What actually happens to an application.
 *
 * This replaced a wall of invented candidate testimonials. A visitor can verify
 * every line of it by applying once, which is the only kind of proof a new
 * platform honestly has.
 */
const APPLY_STEPS = [
  {
    icon: FileText,
    title: "Your CV reaches a person",
    body: "Every application lands in our placement desk with the CV attached to the role — not in a queue nobody opens.",
  },
  {
    icon: Lock,
    title: "It is never made public",
    body: "Your CV is stored privately and shown only to the GetAJob team. It is never posted on a board, sold, or passed to a stranger.",
  },
  {
    icon: Clock,
    title: "You hear back within 7 working days",
    body: "Shortlisted candidates are contacted directly. If a role closes without you, you can apply to the next one in a single click.",
  },
  {
    icon: Trash2,
    title: "You can have it deleted",
    body: "Ask us to remove your application and CV and it is gone from our records — no forms, no waiting periods.",
  },
];

export function AfterYouApply() {
  return (
    <section id="stories" className="wrap mt-16 scroll-mt-24">
      <div className="text-center">
        <p className="eyebrow mx-auto">
          <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
          Plain terms
        </p>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
          What happens after you apply
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
          No recruiter fees, no CV sold to the highest bidder. These four things are true of every
          application sent through GetAJob — apply once and check for yourself.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {APPLY_STEPS.map((step) => (
          <div key={step.title} className="card flex flex-col p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <step.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[13px] font-bold leading-snug text-ink-900">{step.title}</h3>
            <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-500">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StateStrip({ jobs }: { jobs: Job[] }) {
  const counts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.state] = (acc[job.state] ?? 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <section className="wrap mt-12">
      <div className="card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-ink-900">Hiring right now across Nigeria</p>
            <p className="text-xs text-ink-500">
              Tap a state to see verified openings, salaries and deadlines.
            </p>
          </div>
          <Link href="/states" className="btn btn-outline btn-sm self-start sm:self-auto">
            All 37 locations
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {top.map(([state, count]) => (
            <Link
              key={state}
              href={`/jobs?state=${encodeURIComponent(state)}`}
              className="group inline-flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
              {state}
              <span className="rounded-full bg-ink-50 px-1.5 text-[10px] font-bold text-ink-500 group-hover:bg-white">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmployerCta({ stats }: { stats: JobStats }) {
  return (
    <section className="wrap mt-16">
      <div className="grid grid-cols-1 overflow-hidden rounded-[26px] border border-brand-100 bg-brand-50/70 lg:grid-cols-[1fr_0.9fr]">
        <div className="min-w-0 p-6 sm:p-8 lg:p-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-800">
            <Building2 className="size-3.5" aria-hidden="true" />
            For employers
          </p>
          <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            Hire pre-screened Nigerian talent in 48 hours
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
            Post a role free for 7 days and put it beside {stats.liveJobs.toLocaleString("en-NG")}{" "}
            openings across {stats.statesCovered} states. Every shortlist comes with verified contact
            details, salary expectations and availability.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              "Free first listing",
              "Candidate screening included",
              "Naira pricing, no dollar cards",
              "Dedicated account manager",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs font-medium text-ink-700">
                <span className="grid size-4 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="size-2.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href="/employers#post-job" className="btn btn-primary">
              Post a job in 2 minutes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/employers" className="btn btn-outline">
              Explore employer dashboard
            </Link>
          </div>
        </div>
        <div className="relative min-h-[220px] lg:min-h-full">
          <Image
            src="https://images.pexels.com/photos/30677714/pexels-photo-30677714.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
            alt="Hiring team collaborating in a Lagos office"
            width={1200}
            height={800}
            unoptimized
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
              Live on the board today
            </p>
            <p className="font-display text-lg font-extrabold text-ink-900">
              {stats.hiringCompanies.toLocaleString("en-NG")} employers
            </p>
            <p className="text-[11px] text-ink-500">
              Hiring across {stats.liveJobs.toLocaleString("en-NG")} open roles
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
