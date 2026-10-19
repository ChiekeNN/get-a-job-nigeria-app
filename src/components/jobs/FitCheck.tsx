"use client";

import { Check, ChevronDown, Minus, ShieldQuestion, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  analyzeJob,
  EDUCATION_OPTIONS,
  EMPTY_PROFILE,
  EXPERIENCE_OPTIONS,
  evaluateFit,
  fieldsToAsk,
  summarizeFit,
  type CandidateProfile,
  type FitStatus,
} from "@/lib/fit";
import type { Job } from "@/types";

const STORAGE_KEY = "getajob:candidate";

const STATUS_STYLE: Record<FitStatus, { Icon: typeof Check; chip: string; label: string }> = {
  met: { Icon: Check, chip: "bg-brand-50 text-brand-700", label: "You meet this" },
  gap: { Icon: X, chip: "bg-rose-50 text-rose-600", label: "Short of this" },
  open: { Icon: Minus, chip: "bg-ink-50 text-ink-400", label: "Not answered" },
};

const TONE_STYLE = {
  good: "border-brand-100 bg-brand-50 text-brand-900",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  bad: "border-rose-200 bg-rose-50 text-rose-900",
  unknown: "border-ink-100 bg-cream text-ink-700",
} as const;

export function FitCheck({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile>(EMPTY_PROFILE);

  const items = useMemo(
    () => analyzeJob({ description: job.description, requirements: job.requirements }).items,
    [job.description, job.requirements],
  );

  const asked = useMemo(() => fieldsToAsk(items), [items]);
  const rows = evaluateFit(items, profile);
  const summary = summarizeFit(rows);
  const answered = rows.filter((row) => row.status !== "open").length;

  if (items.length === 0) return null;

  function save(next: CandidateProfile) {
    setProfile(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or storage disabled: the answers still work for this visit.
    }
  }

  function update(patch: Partial<CandidateProfile>) {
    save({ ...profile, ...patch });
  }

  function toggle() {
    if (!open) {
      // Read only on demand, so the server and the first client render agree.
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<CandidateProfile>;
          setProfile({ ...EMPTY_PROFILE, ...saved });
        }
      } catch {
        // Ignore unreadable storage and start from an empty profile.
      }
    }
    setOpen(!open);
  }

  function clear() {
    save(EMPTY_PROFILE);
  }

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="fit-check-body"
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <ShieldQuestion className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold text-ink-900">
            Will you pass the first screen?
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-ink-500">
            We read this advert&apos;s own words and check them against your profile. No account, and
            nothing leaves your device.
          </span>
          {!open ? (
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {items.map((item) => (
                <span
                  key={item.field}
                  className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-600"
                >
                  {item.label}
                  {item.soft ? " (preferred)" : ""}
                </span>
              ))}
              <span className="text-[11px] font-medium text-ink-400">Check it in 20 seconds</span>
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`mt-1 size-4 shrink-0 text-ink-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div id="fit-check-body" className="border-t border-ink-100 px-5 pb-5 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {asked.includes("education") ? (
              <label className="block">
                <span className="label">Highest qualification</span>
                <select
                  className="field mt-1"
                  value={profile.education ?? ""}
                  onChange={(event) =>
                    update({ education: event.target.value ? Number(event.target.value) : null })
                  }
                >
                  <option value="">Select…</option>
                  {EDUCATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {asked.includes("experience") ? (
              <label className="block">
                <span className="label">Relevant experience</span>
                <select
                  className="field mt-1"
                  value={profile.years ?? ""}
                  onChange={(event) =>
                    update({ years: event.target.value ? Number(event.target.value) : null })
                  }
                >
                  <option value="">Select…</option>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {asked.includes("nysc") ? (
              <div>
                <span className="label">NYSC</span>
                <div className="mt-1 flex gap-1.5">
                  {(
                    [
                      { value: "yes", label: "Completed" },
                      { value: "exempt", label: "Exempt" },
                      { value: "no", label: "Not yet" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update({ nysc: option.value })}
                      aria-pressed={profile.nysc === option.value}
                      className={`flex-1 rounded-lg border px-2 py-2 text-[11.5px] font-semibold transition ${
                        profile.nysc === option.value
                          ? "border-brand-300 bg-brand-50 text-brand-800"
                          : "border-ink-200 bg-white text-ink-600 hover:border-brand-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {asked.includes("licence") ? (
              <div>
                <span className="label">Driver&apos;s licence</span>
                <div className="mt-1 flex gap-1.5">
                  {(
                    [
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update({ licence: option.value })}
                      aria-pressed={profile.licence === option.value}
                      className={`flex-1 rounded-lg border px-2 py-2 text-[11.5px] font-semibold transition ${
                        profile.licence === option.value
                          ? "border-brand-300 bg-brand-50 text-brand-800"
                          : "border-ink-200 bg-white text-ink-600 hover:border-brand-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {asked.includes("certification") ? (
              <label className="block sm:col-span-2">
                <span className="label">Certifications you hold</span>
                <input
                  className="field mt-1"
                  value={profile.certifications}
                  onChange={(event) => update({ certifications: event.target.value })}
                  placeholder="e.g. ICAN, STCW, PMP — leave blank if none"
                />
              </label>
            ) : null}
          </div>

          <ul className="mt-5 space-y-2">
            {rows.map((row) => {
              const style = STATUS_STYLE[row.status];
              return (
                <li key={row.field} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${style.chip}`}>
                      <style.Icon className="size-3" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">
                        {row.label}
                        {row.soft ? (
                          <span className="ml-1.5 rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                            preferred
                          </span>
                        ) : null}
                        <span className="sr-only"> — {style.label}</span>
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                        From the advert: <span className="italic">“{row.quote}”</span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={`mt-4 rounded-xl border p-3.5 ${TONE_STYLE[summary.tone]}`}>
            <p className="text-sm font-bold">{summary.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed opacity-90">{summary.body}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-ink-400">
              {answered} of {rows.length} answered · saved on this device only
            </p>
            {answered > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 transition hover:text-rose-600"
              >
                <Trash2 className="size-3" aria-hidden="true" />
                Clear my answers
              </button>
            ) : null}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            Based only on what this advert states. Employers also screen on interviews, tests and
            references, and a gap here is not a rejection — it is something to address in your cover
            letter.
          </p>
        </div>
      ) : null}
    </section>
  );
}
