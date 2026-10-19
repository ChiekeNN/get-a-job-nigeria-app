import { CategoryGrid } from "@/components/home/CategoryGrid";
import { EmployerCta, HowItWorks, StateStrip, Testimonials } from "@/components/home/Sections";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { Hero } from "@/components/home/Hero";
import { ProSection } from "@/components/home/ProSection";
import { StatsBanner } from "@/components/home/StatsBanner";
import { countBy, getStats, listJobs } from "@/lib/jobs-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jobs = await listJobs();
  const stats = await getStats(jobs);
  const categoryCounts = countBy(jobs, "category");

  return (
    <>
      <Hero />
      <StatsBanner stats={stats} />
      <FeaturedJobs jobs={jobs} />
      {/* Featured service, directly under the listings it is meant to help with. */}
      <ProSection />
      <CategoryGrid counts={categoryCounts} />
      <HowItWorks />
      <StateStrip jobs={jobs} />
      <Testimonials />
      <EmployerCta />
    </>
  );
}
