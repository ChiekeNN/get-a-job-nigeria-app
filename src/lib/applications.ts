import { desc, eq, sql } from "drizzle-orm";

import { db, getPool } from "@/db";
import { applications, jobs } from "@/db/schema";

/**
 * The application archive — the record of every application, including the CV
 * file itself.
 *
 * The console is now the source of truth: the email is only a heads-up. That
 * makes three things the console's job:
 *   - keep the upload (so a bounced email never costs a candidate their CV),
 *   - serve it only to someone holding the admin key,
 *   - delete it completely, on request.
 *
 * The columns are added on first use, the same way the traffic table is, so a
 * deploy needs no manual SQL.
 */

let schemaReady: Promise<void> | null = null;

export function ensureApplicationsSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const pool = getPool();

    // Creates the table only on a database that has never seen an application.
    // No foreign key here on purpose: this runs on hosts where `jobs` may not
    // exist yet, and the relation is already declared in the drizzle schema.
    await pool.query(`
      create table if not exists applications (
        id serial primary key,
        job_id integer not null,
        full_name text not null,
        email text not null,
        phone text not null,
        location text,
        cover_letter text,
        cv_file_name text,
        created_at timestamptz not null default now()
      )
    `);

    await pool.query(`alter table applications add column if not exists cv_data bytea`);
    await pool.query(`alter table applications add column if not exists cv_mime text`);
    await pool.query(`alter table applications add column if not exists cv_size integer`);
    await pool.query(
      `create index if not exists applications_created_at_idx on applications (created_at)`,
    );
    await pool.query(`create index if not exists applications_email_idx on applications (lower(email))`);
  })().catch((error) => {
    // Let a later request retry after a transient database failure.
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

export interface ApplicationCv {
  filename: string;
  mime: string;
  data: Buffer;
}

export interface ApplicationRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  location: string | null;
  coverLetter: string | null;
  cvFileName: string | null;
  cvSize: number | null;
  hasCv: boolean;
  createdAt: string;
  jobId: number | null;
  jobTitle: string | null;
  jobCompany: string | null;
  jobSlug: string | null;
  jobState: string | null;
}

export interface ApplicationTotals {
  total: number;
  today: number;
  week: number;
  withCv: number;
}

/** Newest first, capped so one page load can never pull the whole table. */
export async function listApplications(limit = 400): Promise<ApplicationRecord[]> {
  const rows = await db
    .select({
      id: applications.id,
      fullName: applications.fullName,
      email: applications.email,
      phone: applications.phone,
      location: applications.location,
      coverLetter: applications.coverLetter,
      cvFileName: applications.cvFileName,
      cvSize: applications.cvSize,
      hasCv: sql<boolean>`${applications.cvData} is not null`,
      createdAt: applications.createdAt,
      jobId: jobs.id,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
      jobSlug: jobs.slug,
      jobState: jobs.state,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    hasCv: Boolean(row.hasCv),
    createdAt: row.createdAt.toISOString(),
  }));
}

/** Real counts, straight from the table — never estimated. */
export async function applicationTotals(): Promise<ApplicationTotals> {
  const result = await getPool().query<{
    total: number;
    today: number;
    week: number;
    with_cv: number;
  }>(`
    select
      count(*)::int as total,
      count(*) filter (
        where created_at >= date_trunc('day', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos'
      )::int as today,
      count(*) filter (where created_at >= now() - interval '7 days')::int as week,
      count(*) filter (where cv_data is not null)::int as with_cv
    from applications
  `);

  const row = result.rows[0];
  return {
    total: row?.total ?? 0,
    today: row?.today ?? 0,
    week: row?.week ?? 0,
    withCv: row?.with_cv ?? 0,
  };
}

/** The stored file, or null when this application arrived without one. */
export async function getApplicationCv(id: number): Promise<{
  fullName: string;
  email: string;
  jobTitle: string | null;
  cvFileName: string | null;
  cvMime: string | null;
  cvSize: number | null;
  data: Buffer | null;
} | null> {
  const rows = await db
    .select({
      fullName: applications.fullName,
      email: applications.email,
      jobTitle: jobs.title,
      cvFileName: applications.cvFileName,
      cvMime: applications.cvMime,
      cvSize: applications.cvSize,
      data: applications.cvData,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { ...row, data: row.data ?? null };
}

/**
 * Keep the listing's applicant counter honest when a record is removed. The
 * counter is only ever incremented by a real application, so it has to come
 * back down with one. Never let a missing listing fail the delete.
 */
async function decrementApplicants(counts: Map<number, number>): Promise<void> {
  for (const [jobId, count] of counts) {
    try {
      await db
        .update(jobs)
        .set({ applicants: sql`greatest(${jobs.applicants} - ${count}, 0)` })
        .where(eq(jobs.id, jobId));
    } catch (error) {
      console.error(`[applications] could not adjust the applicant count for job ${jobId}`, error);
    }
  }
}

function tallyJobIds(rows: Array<{ jobId: number }>): Map<number, number> {
  const counts = new Map<number, number>();
  for (const row of rows) counts.set(row.jobId, (counts.get(row.jobId) ?? 0) + 1);
  return counts;
}

export interface DeleteResult {
  deleted: number;
  person: string | null;
}

/** Delete one application and the CV stored with it. */
export async function deleteApplication(id: number): Promise<DeleteResult> {
  const rows = await db
    .select({ id: applications.id, jobId: applications.jobId, email: applications.email })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return { deleted: 0, person: null };

  await db.delete(applications).where(eq(applications.id, id));
  await decrementApplicants(tallyJobIds([row]));
  return { deleted: 1, person: row.email };
}

/**
 * Delete every application from one email address.
 *
 * This is the "delete the job seeker too" action: one candidate who applied to
 * five roles leaves one row per role, and a retention request has to clear all
 * of them, not just the row on screen.
 */
export async function deleteApplicationsByPerson(id: number): Promise<DeleteResult> {
  const rows = await db
    .select({ id: applications.id, jobId: applications.jobId, email: applications.email })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  const anchor = rows[0];
  if (!anchor) return { deleted: 0, person: null };

  const targets = await db
    .select({ id: applications.id, jobId: applications.jobId })
    .from(applications)
    .where(sql`lower(${applications.email}) = lower(${anchor.email})`);

  if (targets.length === 0) return { deleted: 0, person: anchor.email };

  await db.delete(applications).where(sql`lower(${applications.email}) = lower(${anchor.email})`);
  await decrementApplicants(tallyJobIds(targets));
  return { deleted: targets.length, person: anchor.email };
}

/** How many records one address has, so the confirm step can say so. */
export async function countForPerson(email: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(applications)
    .where(sql`lower(${applications.email}) = lower(${email})`);
  return rows[0]?.count ?? 0;
}
