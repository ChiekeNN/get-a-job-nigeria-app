import type { Metadata } from "next";

import { JobBoard } from "@/components/jobs/JobBoard";
import { listJobs } from "@/lib/jobs-service";
import type { FilterState, SortOption } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find jobs in Nigeria",
  description:
    "Browse verified jobs across Lagos, Abuja, Port Harcourt, Ibadan and all 36 states. Filter by industry, job type and Naira salary.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SORTS: SortOption[] = ["newest", "salary-high", "salary-low", "applicants"];

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const jobs = await listJobs();

  const sortParam = first(params.sort) as SortOption;
  const minSalary = Number.parseInt(first(params.minSalary), 10);

  const initialFilters: Partial<FilterState> = {
    keyword: first(params.keyword) || first(params.q),
    state: first(params.state),
    category: first(params.category),
    jobType: first(params.jobType) || first(params.type),
    minSalary: Number.isFinite(minSalary) ? minSalary : 0,
    sort: SORTS.includes(sortParam) ? sortParam : "newest",
  };

  return <JobBoard initialJobs={jobs} initialFilters={initialFilters} />;
}
