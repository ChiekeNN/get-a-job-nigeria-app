"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  PlusCircle,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { NIGERIAN_STATES } from "@/data/site";
import { companyTint, formatNaira, formatDate, timeAgo } from "@/lib/format";
import { CATEGORIES, JOB_TYPES, type ActionState, type Job } from "@/types";

interface Props {
  initialJobs: Job[];
  totalJobs: number;
}

interface PostJobResponse extends ActionState {
  job?: Job;
}

interface FormState {
  title: string;
  company: string;
  employerEmail: string;
  contactName: string;
  state: string;
  city: string;
  category: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  deadline: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  isRemote: boolean;
}

const EXPERIENCE_LEVELS = ["Internship", "Entry level", "Junior level", "Mid level", "Senior level"];

const DEFAULT_FORM: FormState = {
  title: "",
  company: "",
  employerEmail: "",
  contactName: "",
  state: "Lagos",
  city: "",
  category: "Technology",
  jobType: "Full-Time",
  experienceLevel: "Mid level",
  salaryMin: "250000",
  salaryMax: "450000",
  deadline: "",
  description: "",
  requirements: "",
  responsibilities: "",
  benefits: "",
  isRemote: false,
};

export function EmployerDashboard({ initialJobs, totalJobs }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ActionState | null>(null);
  const [myPostings, setMyPostings] = useState<Job[]>([]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: Number(form.salaryMin),
          salaryMax: Number(form.salaryMax),
        }),
      });
      const payload = (await response.json()) as PostJobResponse;
      if (!response.ok || !payload.job) {
        throw new Error(payload.message || "Could not publish this job");
      }
      setMyPostings((current) => [payload.job as Job, ...current]);
      setStatus({ ok: true, message: payload.message });
      toast({
        title: "Job published 🎉",
        description: payload.message,
        variant: "success",
      });
      setForm({ ...DEFAULT_FORM, company: form.company, employerEmail: form.employerEmail, contactName: form.contactName, state: form.state });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      setStatus({ ok: false, message });
      toast({ title: "Publishing failed", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  const minSalary = Number(form.salaryMin) || 0;
  const maxSalary = Number(form.salaryMax) || 0;
  const applications = initialJobs.reduce((sum, job) => sum + job.applicants, 0);

  return (
    <div className="wrap py-8 sm:py-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active roles", value: totalJobs.toLocaleString("en-NG"), icon: BriefcaseBusiness, note: "Live on the network" },
          { label: "Your postings", value: String(myPostings.length), icon: ClipboardList, note: "This session" },
          { label: "Applications", value: applications.toLocaleString("en-NG"), icon: Users, note: "Recent listings" },
          { label: "Profile views", value: "1,248", icon: Eye, note: "Last 30 days" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                {stat.label}
              </p>
              <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{stat.value}</p>
            <p className="text-[11px] text-ink-400">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" id="post-job">
        <form onSubmit={handleSubmit} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900">Post a new job</h2>
              <p className="mt-0.5 text-xs text-ink-500">
                First listing is free for 7 days. Candidates see your salary range upfront.
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700 sm:inline-flex">
              <Sparkles className="size-3" aria-hidden="true" />
              Free trial
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <fieldset>
              <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
                1. Role basics
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="job-title">
                    Job title
                  </label>
                  <input
                    id="job-title"
                    required
                    className="field"
                    value={form.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-company">
                    Company name
                  </label>
                  <input
                    id="job-company"
                    required
                    className="field"
                    value={form.company}
                    onChange={(event) => update("company", event.target.value)}
                    placeholder="e.g. NaijaPay Technologies"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-email">
                    Work email
                  </label>
                  <input
                    id="job-email"
                    type="email"
                    required
                    className="field"
                    value={form.employerEmail}
                    onChange={(event) => update("employerEmail", event.target.value)}
                    placeholder="talent@company.com"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-contact">
                    Contact person
                  </label>
                  <input
                    id="job-contact"
                    className="field"
                    value={form.contactName}
                    onChange={(event) => update("contactName", event.target.value)}
                    placeholder="Recruiter name"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-experience">
                    Experience level
                  </label>
                  <select
                    id="job-experience"
                    className="field"
                    value={form.experienceLevel}
                    onChange={(event) => update("experienceLevel", event.target.value)}
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="border-t border-ink-50 pt-4">
              <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
                2. Location & category
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="job-state">
                    State
                  </label>
                  <select
                    id="job-state"
                    className="field"
                    value={form.state}
                    onChange={(event) => update("state", event.target.value)}
                  >
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="job-city">
                    City / area
                  </label>
                  <input
                    id="job-city"
                    required
                    className="field"
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    placeholder="e.g. Lekki"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-category">
                    Industry
                  </label>
                  <select
                    id="job-category"
                    className="field"
                    value={form.category}
                    onChange={(event) => update("category", event.target.value)}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="job-type">
                    Job type
                  </label>
                  <select
                    id="job-type"
                    className="field"
                    value={form.jobType}
                    onChange={(event) => update("jobType", event.target.value)}
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="job-deadline">
                    Application deadline
                  </label>
                  <input
                    id="job-deadline"
                    type="date"
                    className="field"
                    value={form.deadline}
                    onChange={(event) => update("deadline", event.target.value)}
                  />
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={form.isRemote}
                    onChange={(event) => update("isRemote", event.target.checked)}
                    className="size-4 rounded border-ink-300 accent-brand-600"
                  />
                  Remote friendly role
                </label>
              </div>
            </fieldset>

            <fieldset className="border-t border-ink-50 pt-4">
              <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
                3. Salary in Naira
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="job-salary-min">
                    Minimum (₦ / month)
                  </label>
                  <input
                    id="job-salary-min"
                    type="number"
                    min={10000}
                    step={10000}
                    required
                    className="field"
                    value={form.salaryMin}
                    onChange={(event) => update("salaryMin", event.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-salary-max">
                    Maximum (₦ / month)
                  </label>
                  <input
                    id="job-salary-max"
                    type="number"
                    min={10000}
                    step={10000}
                    required
                    className="field"
                    value={form.salaryMax}
                    onChange={(event) => update("salaryMax", event.target.value)}
                  />
                  {minSalary > maxSalary ? (
                    <p className="mt-1 text-[11px] font-medium text-rose-600">
                      Maximum must be above the minimum.
                    </p>
                  ) : null}
                </div>
              </div>
            </fieldset>

            <fieldset className="border-t border-ink-50 pt-4">
              <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
                4. Role details
              </legend>
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="job-description">
                    Job description
                  </label>
                  <textarea
                    id="job-description"
                    required
                    rows={4}
                    className="field resize-y"
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                    placeholder="Describe the company, the role and who it is for. Minimum 40 characters."
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-responsibilities">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    id="job-responsibilities"
                    rows={3}
                    className="field resize-y"
                    value={form.responsibilities}
                    onChange={(event) => update("responsibilities", event.target.value)}
                    placeholder={"Lead weekly sprint planning\nMentor junior engineers"}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-requirements">
                    Requirements (one per line)
                  </label>
                  <textarea
                    id="job-requirements"
                    rows={3}
                    className="field resize-y"
                    value={form.requirements}
                    onChange={(event) => update("requirements", event.target.value)}
                    placeholder={"3+ years experience\nCOREN / relevant certification"}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="job-benefits">
                    Benefits (one per line)
                  </label>
                  <textarea
                    id="job-benefits"
                    rows={2}
                    className="field resize-y"
                    value={form.benefits}
                    onChange={(event) => update("benefits", event.target.value)}
                    placeholder={"HMO for you and dependants\nHybrid work"}
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {status ? (
            <p
              className={`mt-4 rounded-xl px-3 py-2 text-sm ${
                status.ok ? "bg-brand-50 text-brand-800" : "bg-rose-50 text-rose-700"
              }`}
            >
              {status.message}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn btn-primary flex-1" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <PlusCircle className="size-4" aria-hidden="true" />
              )}
              {pending ? "Publishing…" : "Publish job for free"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setForm(DEFAULT_FORM);
                setStatus(null);
              }}
            >
              Clear form
            </button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-ink-100 bg-ink-50/60 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
                Live candidate preview
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${companyTint("emerald")}`}
                >
                  {(form.company || "Your Company")
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((word) => word[0]?.toUpperCase())
                    .join("") || "NG"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink-600">
                    {form.company || "Your company name"}
                  </p>
                  <p className="mt-0.5 truncate font-display text-sm font-bold text-ink-900">
                    {form.title || "Your job title appears here"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip">
                  <MapPin className="size-3 text-brand-600" aria-hidden="true" />
                  {form.city || "City"}, {form.state}
                </span>
                <span className="chip">
                  <BriefcaseBusiness className="size-3 text-ink-400" aria-hidden="true" />
                  {form.jobType}
                </span>
              </div>
              <div className="mt-3 rounded-lg bg-brand-50/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800/70">
                  Monthly salary
                </p>
                <p className="text-sm font-bold text-brand-800">
                  {formatNaira(minSalary)} – {formatNaira(maxSalary)}
                </p>
              </div>
              <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-ink-500">
                {form.description || "Your role description will preview here for candidates."}
              </p>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900">Your postings</h3>
              <span className="chip !text-[10px]">{myPostings.length} live</span>
            </div>
            {myPostings.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-ink-200 bg-cream/70 p-4 text-center">
                <ClipboardList className="mx-auto size-5 text-ink-300" aria-hidden="true" />
                <p className="mt-1.5 text-xs font-medium text-ink-600">No postings yet</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">
                  Fill the form and publish — your first role appears here instantly.
                </p>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {myPostings.map((job) => (
                  <li key={job.slug} className="rounded-lg border border-ink-100 p-2.5">
                    <p className="truncate text-xs font-semibold text-ink-900">{job.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-ink-500">
                      {job.state} · {formatNaira(job.salaryMin)} – {formatNaira(job.salaryMax)}
                    </p>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="mt-1 inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-brand-700 hover:underline"
                    >
                      View listing
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card bg-ink-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-300">Hiring support</p>
            <p className="mt-1.5 text-sm font-semibold">Need a shortlist by Friday?</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/60">
              Our sourcing team can screen 50 candidates for your role in 48 hours.
            </p>
            <a
              href="https://wa.me/2348030004421?text=I%20need%20a%20shortlist%20for%20my%20role"
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary btn-sm mt-3 w-full"
            >
              Talk to sourcing
            </a>
          </div>
        </aside>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Recently posted on NaijaHire</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Benchmark your salary and requirements against live roles.
            </p>
          </div>
          <Link href="/jobs" className="btn btn-outline btn-sm shrink-0">
            Browse all
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-ink-50/70 text-[10.5px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Role</th>
                <th className="px-4 py-2.5 font-semibold">Location</th>
                <th className="px-4 py-2.5 font-semibold">Salary (monthly)</th>
                <th className="px-4 py-2.5 font-semibold">Applicants</th>
                <th className="px-4 py-2.5 font-semibold">Posted</th>
              </tr>
            </thead>
            <tbody>
              {[...myPostings, ...initialJobs].slice(0, 6).map((job) => (
                <tr key={job.slug} className="border-t border-ink-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/jobs/${job.slug}`} className="font-semibold text-ink-900 hover:text-brand-700">
                      {job.title}
                    </Link>
                    <p className="text-[11px] text-ink-400">{job.company} · {job.category}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-600">
                    {job.city}, {job.state}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-brand-700">
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="size-3" aria-hidden="true" />
                      {formatNaira(job.salaryMin)} – {formatNaira(job.salaryMax)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-600">{job.applicants}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-500">
                    {timeAgo(job.postedAt)}
                    <span className="block text-[10px] text-ink-400">
                      closes {formatDate(job.deadline)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-400">
          <CheckCircle2 className="size-3.5 text-brand-600" aria-hidden="true" />
          Employer workspace demo — postings are saved to the live database instantly.
        </p>
      </section>
    </div>
  );
}
