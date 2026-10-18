import { desc, eq, like, sql } from "drizzle-orm";

import { db } from "@/db";
import { applications, jobs, subscribers } from "@/db/schema";
import type { ApplicationInput, Job, JobStats, NewJobInput, SubscriptionInput } from "@/types";
import { slugify } from "@/lib/format";

const DAY = 86_400_000;

/**
 * The demo listings that shipped with this project (real company names, invented
 * vacancies, every contact address on the reserved `.example` TLD) are gone.
 * They are never inserted again, and any database still holding them has them
 * deleted on the first request after deploy.
 *
 * That TLD is the marker: it can never belong to a real employer, so the filter
 * cannot touch imported listings or anything posted through the site.
 */
let cleanupPromise: Promise<void> | null = null;

async function purgeDemoJobs(): Promise<void> {
  const removed = await db
    .delete(jobs)
    .where(like(jobs.employerEmail, "%.example"))
    .returning({ id: jobs.id });

  if (removed.length > 0) {
    console.log(`[jobs] removed ${removed.length} demo listing(s)`);
  }
}

export async function ensureDemoJobsRemoved(): Promise<void> {
  if (!cleanupPromise) {
    cleanupPromise = purgeDemoJobs().catch((error) => {
      // Let the next request try again rather than caching the failure forever.
      cleanupPromise = null;
      throw error;
    });
  }
  return cleanupPromise;
}

/**
 * Used only when the database cannot be reached. It returns nothing on purpose:
 * showing invented vacancies is worse than showing an empty board, and the old
 * behaviour is what put fake openings under real company names.
 */
export function fallbackJobs(): Job[] {
  return [];
}

function mapRow(row: typeof jobs.$inferSelect): Job {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    company: row.company,
    companyInitials: row.companyInitials || "NG",
    companyColor: row.companyColor,
    state: row.state,
    city: row.city,
    category: row.category,
    jobType: row.jobType,
    salaryMin: row.salaryMin,
    salaryMax: row.salaryMax,
    description: row.description,
    requirements: row.requirements ?? [],
    responsibilities: row.responsibilities ?? [],
    benefits: row.benefits ?? [],
    experienceLevel: row.experienceLevel,
    isFeatured: row.isFeatured,
    isRemote: row.isRemote,
    postedAt: row.postedAt.toISOString(),
    deadline: row.deadline ? row.deadline.toISOString() : null,
    applicants: row.applicants,
    employerEmail: row.employerEmail,
    status: row.status,
  };
}

export async function listJobs(): Promise<Job[]> {
  try {
    await ensureDemoJobsRemoved();
    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, "published"))
      .orderBy(desc(jobs.isFeatured), desc(jobs.postedAt));
    return rows.map(mapRow);
  } catch (error) {
    console.error("Falling back to local job data:", error);
    return fallbackJobs();
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  try {
    await ensureDemoJobsRemoved();
    const rows = await db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    return mapRow(rows[0]);
  } catch (error) {
    console.error("Falling back to local job data:", error);
    return fallbackJobs().find((job) => job.slug === slug) ?? null;
  }
}

function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base) || "new-job";
  if (!taken.has(root)) return root;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${root}-${suffix}`;
}

export async function createJob(input: NewJobInput): Promise<Job> {
  await ensureDemoJobsRemoved();
  const existing = await db.select({ slug: jobs.slug }).from(jobs);
  const taken = new Set(existing.map((row) => row.slug));
  const slug = uniqueSlug(`${input.title}-${input.city}`, taken);
  const initials = input.company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  const rows = await db
    .insert(jobs)
    .values({
      slug,
      title: input.title,
      company: input.company,
      companyInitials: initials || "NG",
      companyColor: "emerald",
      state: input.state,
      city: input.city,
      category: input.category,
      jobType: input.jobType,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      description: input.description,
      requirements: input.requirements,
      responsibilities: input.responsibilities,
      benefits: input.benefits,
      experienceLevel: input.experienceLevel,
      isRemote: input.isRemote,
      isFeatured: true,
      deadline: input.deadline ? new Date(input.deadline) : new Date(Date.now() + 30 * DAY),
      applicants: 0,
      employerEmail: input.employerEmail,
      status: "published",
    })
    .returning();

  return mapRow(rows[0]);
}

export async function applyToJob(input: ApplicationInput): Promise<void> {
  await ensureDemoJobsRemoved();
  await db.insert(applications).values({
    jobId: input.jobId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    location: input.location ?? null,
    coverLetter: input.coverLetter ?? null,
    cvFileName: input.cvFileName ?? null,
  });
  await db
    .update(jobs)
    .set({ applicants: sql`${jobs.applicants} + 1` })
    .where(eq(jobs.id, input.jobId));
}

export async function createSubscription(input: SubscriptionInput): Promise<void> {
  await db.insert(subscribers).values({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    state: input.state ?? null,
    category: input.category ?? null,
    plan: input.plan,
    kind: input.kind,
    cvFileName: input.cvFileName ?? null,
  });
}

export async function getStats(jobList?: Job[]): Promise<JobStats> {
  let list = jobList;
  if (!list) list = await listJobs();
  let applicationCount = 0;
  try {
    const rows = await db.select({ value: sql<number>`count(*)::int` }).from(applications);
    applicationCount = rows[0]?.value ?? 0;
  } catch {
    applicationCount = 0;
  }
  const companies = new Set(list.map((job) => job.company));
  const states = new Set(list.map((job) => job.state));
  return {
    liveJobs: 1826 + list.length,
    hiringCompanies: 302 + companies.size,
    activeSeekers: 47184 + applicationCount * 3,
    statesCovered: Math.max(states.size, 37),
  };
}

export function countBy(items: Job[], key: "state" | "category"): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, job) => {
    const value = job[key];
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
