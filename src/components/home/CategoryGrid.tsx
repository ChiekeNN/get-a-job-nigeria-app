import {
  ArrowUpRight,
  Briefcase,
  Flame,
  GraduationCap,
  HardHat,
  Headset,
  Landmark,
  Laptop,
  Megaphone,
  Sprout,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { CATEGORIES } from "@/types";

/**
 * Icons for the industries most likely to be populated. Anything else falls back
 * to a briefcase — with sixty-odd industries, hand-picking an icon for each would
 * be false precision.
 */
const ICONS: Record<string, LucideIcon> = {
  "Programming / Software Jobs": Laptop,
  "Software Developer Jobs": Laptop,
  "Web Developer Jobs Nigeria": Laptop,
  "Banking Jobs in Nigeria": Landmark,
  "Finance Jobs in Nigeria": Landmark,
  "Accounting Jobs in Nigeria": Landmark,
  "Oil & Gas Jobs in Nigeria": Flame,
  "Medical & Healthcare Jobs": Stethoscope,
  "Customer Service Jobs": Headset,
  "Engineering Jobs in Nigeria": HardHat,
  "Civil Engineering Jobs": Wrench,
  "Agriculture Jobs in Nigeria": Sprout,
  "Teaching Jobs in Nigeria": GraduationCap,
  "Marketing & Sales Jobs": Megaphone,
  "Sales Jobs": Megaphone,
  "Cook / Chef Jobs": UtensilsCrossed,
};

/** How many industries the homepage shows before sending people to /jobs. */
const VISIBLE_INDUSTRIES = 12;

interface Props {
  counts: Record<string, number>;
}

export function CategoryGrid({ counts }: Props) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  // Only industries that actually hold listings, busiest first. With a large
  // taxonomy most buckets are empty at any moment, and a wall of "0 open" cards
  // reads as a broken site.
  const populated = CATEGORIES.map((name) => ({ name, count: counts[name] ?? 0 }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const visible = populated.slice(0, VISIBLE_INDUSTRIES);

  return (
    <section id="categories" className="wrap mt-16 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            Browse by industry
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[34px]">
            Find work in the field you know best
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-[15px]">
            {total} verified roles across {populated.length} industries, with salary bands disclosed
            before you apply — no more guessing what a job pays.
          </p>
        </div>
        <Link href="/jobs" className="btn btn-outline self-start sm:self-auto">
          Browse all jobs
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry) => {
          const Icon = ICONS[entry.name] ?? Briefcase;
          return (
            <Link
              key={entry.name}
              href={`/jobs?category=${encodeURIComponent(entry.name)}`}
              className="group card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_18px_40px_-32px_rgba(5,20,15,0.5)]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-ink-900">{entry.name}</h3>
                <span className="chip shrink-0 !bg-ink-50 !px-2 !text-[10.5px]">
                  {entry.count} open
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {populated.length > VISIBLE_INDUSTRIES ? (
        <Link
          href="/jobs"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
        >
          See all {populated.length} industries
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
