import { Briefcase, Building2, Map, Sparkles } from "lucide-react";

import type { JobStats } from "@/types";

const ITEMS = [
  {
    key: "liveJobs" as const,
    label: "Live job listings",
    icon: Briefcase,
    note: "Verified and open today",
  },
  {
    key: "hiringCompanies" as const,
    label: "Hiring companies",
    icon: Building2,
    note: "Employers with open roles",
  },
  {
    key: "newThisWeek" as const,
    label: "New this week",
    icon: Sparkles,
    note: "Posted in the last 7 days",
  },
  {
    key: "statesCovered" as const,
    label: "States with live roles",
    icon: Map,
    note: "Across the 36 states and FCT",
  },
];

export function StatsBanner({ stats }: { stats: JobStats }) {
  return (
    <section aria-label="GetAJob platform statistics" className="wrap -mt-2">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 shadow-[0_24px_50px_-40px_rgba(5,20,15,0.5)] lg:grid-cols-4">
        {ITEMS.map(({ key, label, icon: Icon, note }) => (
          <div key={key} className="bg-white px-4 py-5 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-500">
                {label}
              </p>
            </div>
            <p className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
              {stats[key].toLocaleString("en-NG")}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-400">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
