import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { applications, jobs, subscribers } from "@/db/schema";
import { SEED_JOBS, type SeedJob } from "@/data/jobs";
import type { ApplicationInput, Job, JobStats, NewJobInput, SubscriptionInput } from "@/types";
import { slugify } from "@/lib/format";

const DAY = 86_400_000;

function seedToJob(seed: SeedJob, index: number): Job {
  const postedAt = new Date(Date.now() - seed.postedDaysAgo * DAY);
  const deadline = new Date(Date.now() + seed.deadlineDaysFromNow * DAY);
  return {
    id: index + 1,
    slug: seed.slug,
    title: seed.title,
    company: seed.company,
    companyInitials: seed.companyInitials,
    companyColor: seed.companyColor,
    state: seed.state,
    city: seed.city,
    category: seed.category,
    jobType: seed.jobType,
    salaryMin: seed.salaryMin,
    salaryMax: seed.salaryMax,
    description: seed.description,
    requirements: seed.requirements,
    responsibilities: seed.responsibilities,
    benefits: seed.benefits,
    experienceLevel: seed.experienceLevel,
    isFeatured: seed.isFeatured,
    isRemote: seed.isRemote,
    postedAt: postedAt.toISOString(),
    deadline: deadline.toISOString(),
    applicants: seed.applicants,
    employerEmail: seed.employerEmail,
    status: "published",
  };
}

export function fallbackJobs(): Job[] {
  return SEED_JOBS.map(seedToJob);
}

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const existing = await db.select({ id: jobs.id }).from(jobs).limit(1);
  if (existing.length > 0) return;

  const now = Date.now();
  const values = SEED_JOBS.map((seed) => ({
    slug: seed.slug,
    title: seed.title,
    company: seed.company,
    companyInitials: seed.companyInitials,
    companyColor: seed.companyColor,
    state: seed.state,
    city: seed.city,
    category: seed.category,
    jobType: seed.jobType,
    salaryMin: seed.salaryMin,
    salaryMax: seed.salaryMax,
    description: seed.description,
    requirements: seed.requirements,
    responsibilities: seed.responsibilities,
    benefits: seed.benefits,
    experienceLevel: seed.experienceLevel,
    isFeatured: seed.isFeatured,
    isRemote: seed.isRemote,
    postedAt: new Date(now - seed.postedDaysAgo * DAY),
    deadline: new Date(now + seed.deadlineDaysFromNow * DAY),
    applicants: seed.applicants,
    employerEmail: seed.employerEmail,
    status: "published",
  }));

  await db.insert(jobs).values(values).onConflictDoNothing();
}

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
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
    source: row.source,
    sourceId: row.sourceId,
    sourceUrl: row.sourceUrl,
  };
}

export async function listJobs(): Promise<Job[]> {
  try {
    await ensureSeeded();
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
    await ensureSeeded();
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
  await ensureSeeded();
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
  await ensureSeeded();
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
