"use client";

import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { JobCard } from "@/components/jobs/JobCard";
import { QuickApplyModal } from "@/components/jobs/QuickApplyModal";
import { useToast } from "@/components/providers/Toaster";
import { useSavedJobs } from "@/lib/useSavedJobs";
import type { Job } from "@/types";

export function FeaturedJobs({ jobs }: { jobs: Job[] }) {
  const { toast } = useToast();
  const [active, setActive] = useState<Job | null>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const { saved, isSaved, toggle } = useSavedJobs();

  const visible = jobs.slice(0, 4);

  return (
    <section className="wrap mt-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <Flame className="size-3.5 text-amber-500" aria-hidden="true" />
            Hot this week
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[34px]">
            Fresh roles, verified by real recruiters
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-[15px]">
            Salaries shown in Naira, hiring teams confirmed by our team. Apply with one click — no
            re-typing your CV for every employer.
          </p>
        </div>
        <Link href="/jobs" className="btn btn-primary self-start sm:self-auto">
          See all {jobs.length} jobs
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {visible.map((job) => (
          <JobCard
            key={job.slug}
            job={job}
            onApply={setActive}
            saved={isSaved(job.slug)}
            applied={appliedIds.includes(job.id)}
            onToggleSave={(slug) => {
              const wasSaved = isSaved(slug);
              toggle(slug);
              if (!wasSaved) {
                toast({
                  title: "Job saved",
                  description: "You'll find it in your saved list on the jobs page.",
                  variant: "info",
                });
              }
            }}
          />
        ))}
      </div>

      <QuickApplyModal
        job={active}
        onClose={() => setActive(null)}
        onApplied={(job) => setAppliedIds((current) => [...current, job.id])}
      />
    </section>
  );
}
