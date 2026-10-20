import { BlogTeaser } from "@/components/blog/BlogTeaser";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { AfterYouApply, EmployerCta, HowItWorks, StateStrip } from "@/components/home/Sections";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { Hero } from "@/components/home/Hero";
import { ProSection } from "@/components/home/ProSection";
import { StatsBanner } from "@/components/home/StatsBanner";
import { countBy, getStats, listJobs } from "@/lib/jobs-service";
import type { Job } from "@/types";

export const dynamic = "force-dynamic";

/**
 * The employers a visitor can actually click through to today, most listings
 * first. Taken from the board itself, so the strip under the hero can never
 * name a company that is not hiring here.
 */
function topCompanies(jobs: Job[], limit = 7): string[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const name = job.company.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

/** The best-paid role on the board, for a fact no competitor can argue with. */
function topSalary(jobs: Job[]) {
  const paid = jobs
    .filter((job) => job.salaryMax > 0)
    .sort((a, b) => b.salaryMax - a.salaryMax);
  const best = paid[0];
  if (!best) return null;
  return {
    title: best.title,
    company: best.company,
    amount: best.salaryMax,
    location: best.city || best.state,
  };
}

export default async function HomePage() {
  const jobs = await listJobs();
  const stats = await getStats(jobs);
  const categoryCounts = countBy(jobs, "category");

  return (
    <>
      <Hero stats={stats} topCompanies={topCompanies(jobs)} topSalary={topSalary(jobs)} />
      <StatsBanner stats={stats} />
      <FeaturedJobs jobs={jobs} />
      {/* Featured service, directly under the listings it is meant to help with. */}
      <ProSection />
      <CategoryGrid counts={categoryCounts} />
      <HowItWorks />
      <StateStrip jobs={jobs} />
      <BlogTeaser />
      <AfterYouApply />
      <EmployerCta stats={stats} />
    </>
  );
}
