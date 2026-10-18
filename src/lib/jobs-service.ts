import { desc, eq, inArray, like, sql } from "drizzle-orm";

import { db } from "@/db";
import { applications, importState, jobs, subscribers } from "@/db/schema";
import type { ApplicationInput, Job, JobStats, NewJobInput, SubscriptionInput } from "@/types";
import { slugify } from "@/lib/format";
import { classifyListing } from "@/lib/importer/normalize";

const DAY = 86_400_000;

/**
 * One-time clean-up, run once per server process on the first request after a
 * deploy.
 *
 * It removes two kinds of leftover that must never reach a visitor:
 *   1. the demo listings that shipped with this project — real company names,
 *      invented vacancies, every contact address on the reserved `.example`
 *      TLD, which can never belong to a real employer;
 *   2. listings imported before the upstream board's initials joined the brand
 *      list, so they are dropped and re-imported clean by the next sweep.
 *
 * Neither filter can touch a genuine listing, and both are idempotent.
 */
let cleanupPromise: Promise<void> | null = null;

/**
 * Category names from earlier taxonomies: the original nine sectors, and the
 * nine coarse buckets they were briefly renamed to. Any row still carrying one
 * of these is re-classified once into the current industry list.
 */
const COARSE_CATEGORY_NAMES = [
  "Technology",
  "Banking & Finance",
  "Oil & Gas",
  "Healthcare",
  "Customer Service",
  "Engineering",
  "Agriculture",
  "Education",
  "Sales & Marketing",
  "Programming / Software Jobs",
  "Banking Jobs in Nigeria",
  "Oil & Gas Jobs in Nigeria",
  "Medical & Healthcare Jobs",
  "Customer Service Jobs",
  "Engineering Jobs in Nigeria",
  "Agriculture Jobs in Nigeria",
  "Teaching Jobs in Nigeria",
  "Marketing & Sales Jobs",
  "Administration & Office",
];

/** Recorded in import_state so the re-classification runs exactly once. */
const TAXONOMY_MIGRATION_KEY = "maintenance:taxonomy-v4";

async function refileLegacyCategories(): Promise<void> {
  const done = await db
    .select({ value: importState.value })
    .from(importState)
    .where(eq(importState.key, TAXONOMY_MIGRATION_KEY))
    .limit(1);

  if (done.length > 0) return;

  const rows = await db
    .select({ id: jobs.id, title: jobs.title, description: jobs.description })
    .from(jobs)
    .where(inArray(jobs.category, COARSE_CATEGORY_NAMES));

  if (rows.length > 0) {
    const byCategory = new Map<string, number[]>();
    for (const row of rows) {
      const category = classifyListing(row.title, row.description ?? "");
      const bucket = byCategory.get(category);
      if (bucket) bucket.push(row.id);
      else byCategory.set(category, [row.id]);
    }

    for (const [category, ids] of byCategory) {
      await db.update(jobs).set({ category }).where(inArray(jobs.id, ids));
    }

    console.log(`[jobs] re-filed ${rows.length} listing(s) into the current industry list`);
  }

  await db
    .insert(importState)
    .values({ key: TAXONOMY_MIGRATION_KEY, value: new Date().toISOString() })
    .onConflictDoNothing();
}

/**
 * Listings imported before the article extractor existed carry either no
 * description at all (the aggregate "Company Recruitment" adverts) or the
 * publication line as their text ("Posted on Fri 09th Oct, 2026 ---").
 *
 * They cannot be repaired in place — the copy was never stored — so they are
 * deleted and the next sweep re-imports them through the new pipeline, which
 * reads the article body and splits multi-position adverts into real roles.
 * The unique index on source_id would otherwise keep the old row forever.
 */
const DESCRIPTION_REPAIR_KEY = "maintenance:descriptions-v1";

async function purgeThinListings(): Promise<void> {
  const done = await db
    .select({ value: importState.value })
    .from(importState)
    .where(eq(importState.key, DESCRIPTION_REPAIR_KEY))
    .limit(1);

  if (done.length > 0) return;

  const removed = await db
    .delete(jobs)
    .where(
      sql`${jobs.source} = 'feed'
        and (
          ${jobs.description} is null
          or length(trim(${jobs.description})) < 120
          or ${jobs.description} ~ '^\s*Posted on'
        )`,
    )
    .returning({ id: jobs.id });

  if (removed.length > 0) {
    console.log(`[jobs] removed ${removed.length} listing(s) with no real description`);
  }

  await db
    .insert(importState)
    .values({ key: DESCRIPTION_REPAIR_KEY, value: new Date().toISOString() })
    .onConflictDoNothing();
}

async function purgeLegacyRows(): Promise<void> {
  const demo = await db
    .delete(jobs)
    .where(like(jobs.employerEmail, "%.example"))
    .returning({ id: jobs.id });

  // Listings imported before "HNJ" joined the brand list still carry the initials
  // in their title or body. Delete them so the next sweep re-imports them clean;
  // leaving them would break the rule that the upstream board is never named.
  const branded = await db
    .delete(jobs)
    .where(
      sql`${jobs.title} ~* '\\yHNJ\\y'
        or ${jobs.title} ilike '%hotnigerianjobs%'
        or ${jobs.title} ilike '%hot nigerian jobs%'
        or ${jobs.description} ~* '\\yHNJ\\y'`,
    )
    .returning({ id: jobs.id });

  const removed = demo.length + branded.length;
  if (removed > 0) {
    console.log(`[jobs] removed ${removed} legacy listing(s)`);
  }

  await refileLegacyCategories();
  await purgeThinListings();
}

export async function ensureCleanBoard(): Promise<void> {
  if (!cleanupPromise) {
    cleanupPromise = purgeLegacyRows().catch((error) => {
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
    await ensureCleanBoard();
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
    await ensureCleanBoard();
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
  await ensureCleanBoard();
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
  await ensureCleanBoard();
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
