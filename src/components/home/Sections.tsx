import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  FileText,
  MapPin,
  MessageSquareQuote,
  Rocket,
  Search,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TESTIMONIALS } from "@/data/site";
import type { Job } from "@/types";

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
              How NaijaHire works
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

export function Testimonials() {
  return (
    <section id="stories" className="wrap mt-16 scroll-mt-24">
      <div className="text-center">
        <p className="eyebrow mx-auto">
          <MessageSquareQuote className="size-3.5 text-brand-600" aria-hidden="true" />
          Real placement stories
        </p>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
          They stopped applying. Then employers called.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
          Candidates across Lagos, Port Harcourt and Enugu share what changed after using the
          NaijaHire playbook.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <figure key={testimonial.name} className="card flex flex-col p-5">
            <div className="flex items-center gap-1 text-amber-500" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-ink-700">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5 border-t border-ink-50 pt-3.5">
              <span
                className={`grid size-9 place-items-center rounded-full text-xs font-bold ${testimonial.tint}`}
              >
                {testimonial.initials}
              </span>
              <div>
                <p className="text-xs font-bold text-ink-900">{testimonial.name}</p>
                <p className="text-[11px] text-ink-500">
                  {testimonial.role} · {testimonial.location}
                </p>
              </div>
            </figcaption>
          </figure>
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

export function EmployerCta() {
  return (
    <section className="wrap mt-16">
      <div className="grid overflow-hidden rounded-[26px] border border-brand-100 bg-brand-50/70 lg:grid-cols-[1fr_0.9fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-800">
            <Building2 className="size-3.5" aria-hidden="true" />
            For employers
          </p>
          <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[30px]">
            Hire pre-screened Nigerian talent in 48 hours
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
            Post a role free for 7 days and reach 47,000+ active candidates. Every shortlist comes
            with verified contact details, salary expectations and availability.
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
              Average time to hire
            </p>
            <p className="font-display text-lg font-extrabold text-ink-900">11 days</p>
            <p className="text-[11px] text-ink-500">Across 326 employers on NaijaHire</p>
          </div>
        </div>
      </div>
    </section>
  );
}
