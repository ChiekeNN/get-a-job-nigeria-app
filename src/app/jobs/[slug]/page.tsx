import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/jobs/ApplyForm";
import { CONTACT } from "@/data/contact";
import {
  companyTint,
  daysUntil,
  formatDate,
  formatNaira,
  salaryRange,
  timeAgo,
} from "@/lib/format";
import { getJobBySlug, listJobs } from "@/lib/jobs-service";

export const dynamic = "force-dynamic";


interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} at ${job.company}`,
    description: `${job.title} in ${job.city}, ${job.state}. ${salaryRange(job.salaryMin, job.salaryMax)} per month. Apply on NaijaHire.`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const allJobs = await listJobs();
  const related = allJobs
    .filter((item) => item.slug !== job.slug)
    .sort((a, b) => {
      const score = (candidate: typeof a) =>
        (candidate.category === job.category ? 2 : 0) + (candidate.state === job.state ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);

  const closingIn = daysUntil(job.deadline);
  const salaryDisclosed = job.salaryMax > 0;

  return (
    <div>
      <div className="border-b border-ink-100 bg-white">
        <div className="wrap py-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-brand-700"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to all jobs
          </Link>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3.5">
              <div
                className={`grid size-14 shrink-0 place-items-center rounded-2xl text-base font-extrabold ${companyTint(job.companyColor)}`}
                aria-hidden="true"
              >
                {job.companyInitials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                  <span className="font-semibold text-ink-700">{job.company}</span>
                  <span aria-hidden="true">·</span>
                  <span>Posted {timeAgo(job.postedAt)}</span>
                  {job.isFeatured ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      Verified employer
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-1 font-display text-[24px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[34px]">
                  {job.title}
                </h1>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip !bg-white !px-2.5 !py-1">
                    <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
                    {job.city}, {job.state}
                  </span>
                  <span className="chip !bg-white !px-2.5 !py-1">
                    <BriefcaseBusiness className="size-3.5 text-ink-400" aria-hidden="true" />
                    {job.jobType}
                  </span>
                  <span className="chip !bg-white !px-2.5 !py-1">
                    <Users className="size-3.5 text-ink-400" aria-hidden="true" />
                    {job.applicants} applicants
                  </span>
                  <span className="chip !bg-white !px-2.5 !py-1">
                    <Clock className="size-3.5 text-ink-400" aria-hidden="true" />
                    {job.experienceLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 lg:min-w-[260px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-800/70">
                Monthly salary (gross)
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-brand-800">
                {salaryDisclosed
                  ? `${formatNaira(job.salaryMin)} – ${formatNaira(job.salaryMax)}`
                  : "Not disclosed"}
              </p>
              <a href="#apply" className="btn btn-primary mt-3 w-full">
                Apply for this job
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <p className="mt-2 flex items-center justify-center gap-1 text-[10.5px] text-brand-800/70">
                <CalendarDays className="size-3" aria-hidden="true" />
                {closingIn !== null && closingIn > 0
                  ? `Closes in ${closingIn} days`
                  : "Open until filled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">About the role</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {job.description}
            </p>

            {job.responsibilities.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-sm font-bold text-ink-900">What you will do</h3>
                <ul className="mt-2 space-y-2">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
                      <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                        <Check className="size-2.5" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.requirements.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-sm font-bold text-ink-900">What we are looking for</h3>
                <ul className="mt-2 space-y-2">
                  {job.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.benefits.length > 0 ? (
              <div className="mt-5 rounded-xl bg-cream p-4">
                <h3 className="text-sm font-bold text-ink-900">Benefits & perks</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {job.benefits.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-ink-600">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">How to apply</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Apply directly on NaijaHire with your profile. {job.company} reviews applications on a
              rolling basis and contacts shortlisted candidates by email and phone.
            </p>
            <div className="mt-3 grid gap-2 text-xs text-ink-600 sm:grid-cols-3">
              <div className="rounded-lg border border-ink-100 p-2.5">
                <p className="font-semibold text-ink-900">Deadline</p>
                <p className="mt-0.5">{formatDate(job.deadline)}</p>
              </div>
              <div className="rounded-lg border border-ink-100 p-2.5">
                <p className="font-semibold text-ink-900">Applications</p>
                <p className="mt-0.5">{job.applicants} candidates so far</p>
              </div>
              <div className="rounded-lg border border-ink-100 p-2.5">
                <p className="font-semibold text-ink-900">Salary</p>
                <p className="mt-0.5">
                  {salaryDisclosed ? `${salaryRange(job.salaryMin, job.salaryMax)} / month` : "Not disclosed"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50/70 p-3 text-[11.5px] leading-relaxed text-brand-900">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <p>
                <span className="font-semibold">Safety note:</span> this employer will never ask you
                to pay a recruitment fee. Report any request for money to {CONTACT.support}.
              </p>
            </div>
          </section>

          {related.length > 0 ? (
            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">Similar roles</h2>
              <div className="mt-3 space-y-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/jobs/${item.slug}`}
                    className="card flex items-center justify-between gap-3 p-3.5 transition hover:border-brand-200"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${companyTint(item.companyColor)}`}
                      >
                        {item.companyInitials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">{item.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500">
                          <MapPin className="size-3" aria-hidden="true" />
                          {item.city}, {item.state} · {item.jobType}
                        </p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 text-xs font-bold text-brand-700 sm:block">
                      {salaryRange(item.salaryMin, item.salaryMax)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" id="apply">
          <ApplyForm job={job} />

          <div className="card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">About the employer</h3>
            <div className="mt-3 flex items-center gap-2.5">
              <span
                className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${companyTint(job.companyColor)}`}
              >
                {job.companyInitials}
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{job.company}</p>
                <p className="flex items-center gap-1 text-[11px] text-ink-500">
                  <Building2 className="size-3" aria-hidden="true" />
                  Verified employer · {job.state}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              {job.company} hires through NaijaHire and has agreed to our transparent salary and
              no-fee candidate policy.
            </p>
            <a
              href={`https://wa.me/2348030004421?text=${encodeURIComponent(`I need help applying for ${job.title} at ${job.company}`)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-outline btn-sm mt-3 w-full"
            >
              Ask a career adviser
            </a>
          </div>

          <div className="card bg-ink-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-300">Pro tip</p>
            <p className="mt-1.5 text-sm font-semibold">Most candidates lose out on salary talk.</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/60">
              Job Seeker Pro includes a Naira-specific negotiation script for this exact role level.
            </p>
            <Link href="/pro" className="btn btn-amber btn-sm mt-3 w-full">
              Upgrade · ₦8,000/mo
            </Link>
          </div>

          <div className="card p-4 text-xs text-ink-500">
            <p className="flex items-center gap-1.5 font-semibold text-ink-800">
              <Wallet className="size-3.5 text-brand-600" aria-hidden="true" />
              Salary transparency
            </p>
            <p className="mt-1 leading-relaxed">
              Ranges are gross monthly amounts in Nigerian Naira, disclosed by the employer before
              candidates apply.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
