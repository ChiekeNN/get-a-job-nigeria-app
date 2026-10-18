import {
  ArrowUpRight,
  Flame,
  GraduationCap,
  HardHat,
  Headset,
  Landmark,
  Laptop,
  Megaphone,
  Sprout,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { CATEGORY_INFO } from "@/data/site";

const ICONS: Record<string, LucideIcon> = {
  Technology: Laptop,
  "Banking & Finance": Landmark,
  "Oil & Gas": Flame,
  Healthcare: Stethoscope,
  "Customer Service": Headset,
  Engineering: HardHat,
  Agriculture: Sprout,
  Education: GraduationCap,
  "Sales & Marketing": Megaphone,
};

interface Props {
  counts: Record<string, number>;
}

export function CategoryGrid({ counts }: Props) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

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
            {total} verified roles across nine sectors, with salary bands disclosed before you
            apply — no more guessing what a job pays.
          </p>
        </div>
        <Link href="/jobs" className="btn btn-outline self-start sm:self-auto">
          Browse all jobs
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_INFO.map((category) => {
          const Icon = ICONS[category.name] ?? Laptop;
          const count = counts[category.name] ?? 0;
          return (
            <Link
              key={category.slug}
              href={`/jobs?category=${encodeURIComponent(category.name)}`}
              className="group card flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_18px_40px_-32px_rgba(5,20,15,0.5)]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink-900">{category.name}</h3>
                  <span className="chip shrink-0 !bg-ink-50 !px-2 !text-[10.5px]">
                    {count} open
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{category.blurb}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
