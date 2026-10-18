"use client";

import {
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Check,
  MapPin,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { companyTint, salaryLabel, timeAgo } from "@/lib/format";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  saved?: boolean;
  onToggleSave?: (slug: string) => void;
  applied?: boolean;
  showDescription?: boolean;
}

export function JobCard({
  job,
  onApply,
  saved = false,
  onToggleSave,
  applied = false,
  showDescription = true,
}: JobCardProps) {
  const isNew = Date.now() - new Date(job.postedAt).getTime() < 36 * 3_600_000;

  return (
    <article className="card group relative flex flex-col p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_20px_44px_-30px_rgba(5,20,15,0.45)] sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold tracking-wide ${companyTint(job.companyColor)}`}
          aria-hidden="true"
        >
          {job.companyInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            <span className="truncate font-semibold text-ink-700">{job.company}</span>
            <span className="text-ink-300" aria-hidden="true">
              ·
            </span>
            <span suppressHydrationWarning>{timeAgo(job.postedAt)}</span>
            {isNew ? (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                New
              </span>
            ) : null}
            {job.isFeatured ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Featured
              </span>
            ) : null}
          </div>

          <Link href={`/jobs/${job.slug}`} className="mt-1 block">
            <h3 className="font-display text-[16px] font-bold leading-snug text-ink-900 transition group-hover:text-brand-700 sm:text-[17px]">
              {job.title}
            </h3>
          </Link>
        </div>

        {onToggleSave ? (
          <button
            type="button"
            onClick={() => onToggleSave(job.slug)}
            aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            aria-pressed={saved}
            className={`rounded-lg border p-1.5 transition ${
              saved
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-ink-100 bg-white text-ink-400 hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            {saved ? (
              <BookmarkCheck className="size-4" aria-hidden="true" />
            ) : (
              <Bookmark className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="chip">
          <MapPin className="size-3 text-brand-600" aria-hidden="true" />
          {job.city}, {job.state}
        </span>
        <span className="chip">
          <BriefcaseBusiness className="size-3 text-ink-400" aria-hidden="true" />
          {job.jobType}
        </span>
        <span className="chip">
          <Wallet className="size-3 text-ink-400" aria-hidden="true" />
          {job.experienceLevel}
        </span>
        {job.isRemote ? (
          <span className="chip !border-sky-100 !bg-sky-50 !text-sky-700">Remote friendly</span>
        ) : null}
      </div>

      {showDescription ? (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{job.description}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-ink-50 pt-3.5 sm:pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-400">
            Monthly salary
          </p>
          <p className="text-sm font-bold text-brand-700">
            {salaryLabel(job.salaryMin, job.salaryMax)}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-400">
            <Users className="size-3" aria-hidden="true" />
            {job.applicants} applicants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/jobs/${job.slug}`} className="btn btn-outline btn-sm">
            Details
          </Link>
          <button
            type="button"
            onClick={() => onApply(job)}
            disabled={applied}
            className={`btn btn-sm ${applied ? "btn-soft" : "btn-primary"}`}
          >
            {applied ? (
              <>
                <Check className="size-3.5" aria-hidden="true" />
                Applied
              </>
            ) : (
              <>
                <Zap className="size-3.5" aria-hidden="true" />
                Quick Apply
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
