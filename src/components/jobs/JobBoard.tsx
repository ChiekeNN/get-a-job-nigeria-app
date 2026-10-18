"use client";

import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FilterPanel } from "@/components/jobs/FilterPanel";
import { JobCard } from "@/components/jobs/JobCard";
import { QuickApplyModal } from "@/components/jobs/QuickApplyModal";
import { CONTACT, mailto } from "@/data/contact";
import { useToast } from "@/components/providers/Toaster";
import { formatNaira } from "@/lib/format";
import { useSavedJobs } from "@/lib/useSavedJobs";
import { EMPTY_FILTERS, type FilterState, type Job, type SortOption } from "@/types";

interface Props {
  initialJobs: Job[];
  initialFilters?: Partial<FilterState>;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "salary-high", label: "Highest salary" },
  { value: "salary-low", label: "Lowest salary" },
  { value: "applicants", label: "Fewest applicants" },
];

export function JobBoard({ initialJobs, initialFilters }: Props) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS, ...initialFilters });
  const [visibleCount, setVisibleCount] = useState(6);
  const [showFilters, setShowFilters] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const { saved, isSaved, toggle } = useSavedJobs();

  const stateCounts = useMemo(() => {
    return initialJobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.state] = (acc[job.state] ?? 0) + 1;
      return acc;
    }, {});
  }, [initialJobs]);

  const categoryCounts = useMemo(() => {
    return initialJobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.category] = (acc[job.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [initialJobs]);

  const results = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const filtered = initialJobs.filter((job) => {
      if (filters.state && job.state !== filters.state) return false;
      if (filters.category && job.category !== filters.category) return false;
      if (filters.jobType && job.jobType !== filters.jobType) return false;
      if (filters.minSalary > 0 && job.salaryMax < filters.minSalary) return false;
      if (savedOnly && !saved.includes(job.slug)) return false;
      if (!keyword) return true;
      return `${job.title} ${job.company} ${job.category} ${job.city} ${job.state} ${job.experienceLevel} ${job.description} ${job.requirements.join(" ")}`
        .toLowerCase()
        .includes(keyword);
    });

    return [...filtered].sort((a, b) => {
      switch (filters.sort) {
        case "salary-high":
          return b.salaryMax - a.salaryMax;
        case "salary-low":
          return a.salaryMin - b.salaryMin;
        case "applicants":
          return a.applicants - b.applicants;
        default:
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
    });
  }, [initialJobs, filters, saved, savedOnly]);

  useEffect(() => {
    setVisibleCount(6);
  }, [filters, savedOnly]);

  function update(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function clear() {
    setFilters({ ...EMPTY_FILTERS });
    setSavedOnly(false);
  }

  function onApplied(job: Job) {
    setAppliedIds((current) => (current.includes(job.id) ? current : [...current, job.id]));
  }

  function onToggleSave(slug: string) {
    const wasSaved = isSaved(slug);
    toggle(slug);
    if (!wasSaved) {
      toast({
        title: "Saved to your list",
        description: "Find it under “Saved” whenever you come back.",
        variant: "info",
      });
    }
  }

  const activeChips: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.keyword)
    activeChips.push({ label: `“${filters.keyword}”`, onRemove: () => update({ keyword: "" }) });
  if (filters.state)
    activeChips.push({ label: filters.state, onRemove: () => update({ state: "" }) });
  if (filters.category)
    activeChips.push({ label: filters.category, onRemove: () => update({ category: "" }) });
  if (filters.jobType)
    activeChips.push({ label: filters.jobType, onRemove: () => update({ jobType: "" }) });
  if (filters.minSalary > 0)
    activeChips.push({
      label: `${formatNaira(filters.minSalary)}+`,
      onRemove: () => update({ minSalary: 0 }),
    });
  if (savedOnly) activeChips.push({ label: "Saved only", onRemove: () => setSavedOnly(false) });

  const remoteCount = initialJobs.filter((job) => job.isRemote || job.jobType === "Remote").length;

  return (
    <div className="wrap py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            Live openings · updated hourly
          </p>
          <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            Job discovery, built for Nigeria
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-[15px]">
            {initialJobs.length} verified openings with disclosed Naira salaries. Filter by state,
            industry and pay — then apply in one click.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="chip !bg-white !px-2.5 !py-1.5">
            <Briefcase className="size-3.5 text-brand-600" aria-hidden="true" />
            {initialJobs.length} roles
          </span>
          <span className="chip !bg-white !px-2.5 !py-1.5">
            <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
            {Object.keys(stateCounts).length} states hiring
          </span>
          <span className="chip !bg-white !px-2.5 !py-1.5">
            <Sparkles className="size-3.5 text-amber-500" aria-hidden="true" />
            {remoteCount} remote
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[286px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <button
            type="button"
            onClick={() => setShowFilters((open) => !open)}
            className="btn btn-outline w-full justify-between lg:hidden"
            aria-expanded={showFilters}
            aria-controls="job-filters"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters
              {activeChips.length > 0 ? (
                <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {activeChips.length}
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={`size-4 transition ${showFilters ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <div id="job-filters" className={`${showFilters ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>
            <FilterPanel
              filters={filters}
              onChange={update}
              onClear={clear}
              stateCounts={stateCounts}
              categoryCounts={categoryCounts}
              total={initialJobs.length}
            />
            <div className="card mt-4 hidden bg-ink-900 p-4 text-white lg:block">
              <p className="text-sm font-semibold">Get roles before everyone else</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                Daily WhatsApp alerts for your field and state. No spam, unsubscribe anytime.
              </p>
              <a href="/pro" className="btn btn-primary btn-sm mt-3 w-full">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Start alerts · ₦8,000/mo
              </a>
            </div>
          </div>
        </div>

        <div>
          <div className="card p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={filters.keyword}
                  onChange={(event) => update({ keyword: event.target.value })}
                  placeholder="Job title, company or keyword"
                  className="field !pl-9"
                  aria-label="Search jobs by keyword"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-[168px] sm:flex-none">
                  <select
                    value={filters.sort}
                    onChange={(event) => update({ sort: event.target.value as SortOption })}
                    className="field appearance-none pr-8"
                    aria-label="Sort job results"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                    aria-hidden="true"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSavedOnly((value) => !value)}
                  className={`btn shrink-0 ${
                    savedOnly ? "btn-soft" : "btn-outline"
                  }`}
                  aria-pressed={savedOnly}
                >
                  <Bookmark className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                    {saved.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-ink-500">
                <span className="font-bold text-ink-900">{results.length}</span>{" "}
                {results.length === 1 ? "job" : "jobs"} match your search
                {activeChips.length > 0 ? " · filters applied" : ""}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800 transition hover:bg-brand-100"
                  >
                    {chip.label}
                    <X className="size-3" aria-hidden="true" />
                  </button>
                ))}
                {activeChips.length > 1 ? (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-[11px] font-semibold text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="card mt-4 flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-ink-50">
                <Search className="size-6 text-ink-400" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">
                No jobs match those filters yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-ink-500">
                Try widening your salary range or choosing a nearby state. New roles are added every
                morning.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={clear} className="btn btn-primary">
                  Clear filters
                </button>
                <a href="/pro" className="btn btn-outline">
                  Get WhatsApp alerts
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {results.slice(0, visibleCount).map((job) => (
                <JobCard
                  key={job.slug}
                  job={job}
                  onApply={setApplyJob}
                  saved={isSaved(job.slug)}
                  onToggleSave={onToggleSave}
                  applied={appliedIds.includes(job.id)}
                />
              ))}
            </div>
          )}

          {results.length > visibleCount ? (
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 6)}
                className="btn btn-outline px-6"
              >
                Load {Math.min(6, results.length - visibleCount)} more jobs
              </button>
              <p className="text-[11px] text-ink-400">
                Showing {Math.min(visibleCount, results.length)} of {results.length}
              </p>
            </div>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5 text-xs leading-relaxed text-brand-900">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <p>
                <span className="font-semibold">Every employer is verified.</span> NaijaHire never
                charges candidates to apply, and salaries are displayed exactly as disclosed by the
                hiring company. Spotted a listing that has closed? Tell{" "}
                <a
                  href={mailto(CONTACT.expiredListings, "Expired job listing")}
                  className="font-semibold underline decoration-brand-300 underline-offset-2"
                >
                  {CONTACT.expiredListings}
                </a>
                .
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <QuickApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onApplied={onApplied}
      />
    </div>
  );
}
