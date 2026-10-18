import { Briefcase, Building2, Map, Users } from "lucide-react";

import type { JobStats } from "@/types";

const ITEMS = [
  {
    key: "liveJobs" as const,
    label: "Live job listings",
    icon: Briefcase,
    note: "Verified this week",
  },
  {
    key: "hiringCompanies" as const,
    label: "Hiring companies",
    icon: Building2,
    note: "Banks, telcos, oil & tech",
  },
  {
    key: "activeSeekers" as const,
    label: "Active job seekers",
    icon: Users,
    note: "Matched in the last 90 days",
  },
  {
    key: "statesCovered" as const,
    label: "States covered",
    icon: Map,
    note: "All 36 states + FCT",
  },
];

export function StatsBanner({ stats }: { stats: JobStats }) {
  return (
    <section aria-label="NaijaHire platform statistics" className="wrap -mt-2">
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
              <span className="text-brand-600">+</span>
            </p>
            <p className="mt-0.5 text-[11px] text-ink-400">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
