"use client";

import { Banknote, BriefcaseBusiness, MapPin, RotateCcw, Tag } from "lucide-react";

import { NIGERIAN_STATES, SALARY_BRACKETS } from "@/data/site";
import { formatNaira } from "@/lib/format";
import { CATEGORIES, JOB_TYPES, type FilterState } from "@/types";

interface Props {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  stateCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  total: number;
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
      {icon}
      {children}
    </p>
  );
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
  stateCounts,
  categoryCounts,
  total,
}: Props) {
  const activeCount = [
    filters.state,
    filters.category,
    filters.jobType,
    filters.keyword,
    filters.minSalary > 0 ? "salary" : "",
  ].filter(Boolean).length;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-3.5">
        <div>
          <p className="text-sm font-bold text-ink-900">Filter jobs</p>
          <p className="text-[11px] text-ink-400">
            {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active` : "Refine your search"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <SectionTitle icon={<MapPin className="size-3.5 text-brand-600" aria-hidden="true" />}>
            Location
          </SectionTitle>
          <select
            value={filters.state}
            onChange={(event) => onChange({ state: event.target.value })}
            className="field mt-2"
            aria-label="Filter by state"
          >
            <option value="">All 36 states + FCT</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
                {stateCounts[state] ? ` (${stateCounts[state]})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-ink-50 pt-4">
          <SectionTitle icon={<Tag className="size-3.5 text-brand-600" aria-hidden="true" />}>
            Industry
          </SectionTitle>
          <div className="mt-2 flex flex-wrap gap-1.5 lg:max-h-64 lg:flex-col lg:flex-nowrap lg:overflow-y-auto lg:pr-1">
            <button
              type="button"
              onClick={() => onChange({ category: "" })}
              className={`flex w-auto items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition lg:w-full ${
                filters.category === ""
                  ? "bg-brand-600 text-white"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              }`}
            >
              <span>All industries</span>
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  filters.category === "" ? "bg-white/20" : "bg-white text-ink-500"
                }`}
              >
                {total}
              </span>
            </button>
            {CATEGORIES.map((category) => {
              const count = categoryCounts[category] ?? 0;
              const active = filters.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onChange({ category })}
                  className={`flex w-auto items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition lg:w-full ${
                    active ? "bg-brand-600 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                  }`}
                >
                  <span className="truncate">{category}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold ${
                      active ? "bg-white/20" : "bg-white text-ink-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-ink-50 pt-4">
          <SectionTitle
            icon={<BriefcaseBusiness className="size-3.5 text-brand-600" aria-hidden="true" />}
          >
            Job type
          </SectionTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ jobType: "" })}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                filters.jobType === ""
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"
              }`}
            >
              Any
            </button>
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ jobType: filters.jobType === type ? "" : type })}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  filters.jobType === type
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-ink-50 pt-4">
          <div className="flex items-center justify-between">
            <SectionTitle
              icon={<Banknote className="size-3.5 text-brand-600" aria-hidden="true" />}
            >
              Monthly salary
            </SectionTitle>
            <span className="text-[11px] font-bold text-brand-700">
              {filters.minSalary > 0 ? `${formatNaira(filters.minSalary)}+` : "Any"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1000000}
            step={50000}
            value={filters.minSalary}
            onChange={(event) => onChange({ minSalary: Number(event.target.value) })}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-100 accent-brand-600"
            aria-label="Minimum monthly salary in Naira"
          />
          <div className="mt-1 flex justify-between text-[10px] text-ink-400">
            <span>₦0</span>
            <span>₦500k</span>
            <span>₦1m+</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SALARY_BRACKETS.slice(1, 6).map((bracket) => (
              <button
                key={bracket.value}
                type="button"
                onClick={() => onChange({ minSalary: bracket.value })}
                className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition ${
                  filters.minSalary === bracket.value
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"
                }`}
              >
                {bracket.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-ink-400">
            Salaries are gross monthly figures in Nigerian Naira, as disclosed by employers.
          </p>
        </div>
      </div>
    </div>
  );
}
