import { ArrowRight, BellRing, Map, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { statePageForName } from "@/data/state-pages";
import { listJobs } from "@/lib/jobs-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jobs by state across Nigeria",
  description:
    "Browse verified job openings in all 36 Nigerian states and the FCT — Lagos, Abuja, Rivers, Oyo, Kano, Kaduna, Enugu and more.",
};

const ZONES: Array<{ name: string; states: string[] }> = [
  {
    name: "North Central",
    states: ["Benue", "FCT Abuja", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
  },
  { name: "North East", states: ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"] },
  {
    name: "North West",
    states: ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  },
  { name: "South East", states: ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"] },
  {
    name: "South South",
    states: ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  },
  { name: "South West", states: ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"] },
];

export default async function StatesPage() {
  const jobs = await listJobs();
  const counts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.state] = (acc[job.state] ?? 0) + 1;
    return acc;
  }, {});
  const topCategoryByState = jobs.reduce<Record<string, string>>((acc, job) => {
    acc[job.state] = job.category;
    return acc;
  }, {});

  return (
    <div className="wrap py-8 sm:py-10">
      <div className="rounded-[26px] border border-brand-100 bg-brand-50/70 p-5 sm:p-8">
        <p className="eyebrow">
          <Map className="size-3.5 text-brand-600" aria-hidden="true" />
          Location directory
        </p>
        <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
          Jobs in every Nigerian state
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-[15px]">
          From Lagos tech hubs to Kaduna agribusiness and Rivers oil & gas — choose your state to see
          verified openings across Nigeria.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href="/jobs" className="btn btn-primary">
            See all {jobs.length} live jobs
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/pro" className="btn btn-outline">
            <BellRing className="size-4" aria-hidden="true" />
            Get state-specific alerts
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {ZONES.map((zone) => (
          <section key={zone.name} className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-ink-900">{zone.name}</h2>
              <span className="chip">
                {zone.states.reduce((sum, state) => sum + (counts[state] ?? 0), 0)} open roles
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {zone.states.map((state) => {
                const count = counts[state] ?? 0;
                const page = statePageForName(state);
                return (
                  <Link
                    key={state}
                    href={page ? `/states/${page.slug}` : `/jobs?state=${encodeURIComponent(state)}`}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2.5 transition hover:border-brand-300 hover:bg-brand-50/60"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                      <span className="truncate text-sm font-medium text-ink-800">{state}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span
                        className={`block text-xs font-bold ${count > 0 ? "text-brand-700" : "text-ink-400"}`}
                      >
                        {count > 0 ? `${count} ${count === 1 ? "role" : "roles"}` : "Alert me"}
                      </span>
                      {count > 0 && topCategoryByState[state] ? (
                        <span className="block text-[10px] text-ink-400">
                          {topCategoryByState[state]}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl bg-ink-950 px-5 py-6 text-white sm:flex-row">
        <div>
          <p className="font-display text-lg font-bold">No openings in your state yet?</p>
          <p className="mt-1 text-sm text-white/65">
            We will WhatsApp you the moment a verified employer posts a role near you.
          </p>
        </div>
        <Link href="/pro" className="btn btn-primary shrink-0">
          Set up job alerts
        </Link>
      </div>
    </div>
  );
}
