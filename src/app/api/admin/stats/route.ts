import { desc } from "drizzle-orm";

import { db } from "@/db";
import { applications, importState, jobs, subscribers } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { findDatabaseUrlVar } from "@/db";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

/** yyyy-mm-dd in UTC, the key the trend series is bucketed by. */
function dayKey(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function countBy<T>(rows: T[], pick: (row: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = pick(row);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Last `days` days, oldest first, including empty days so the chart is honest. */
function series(days: number, rows: Array<{ date: string | null }>) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.date) continue;
    counts.set(row.date, (counts.get(row.date) ?? 0) + 1);
  }
  const out: Array<{ date: string; count: number }> = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * DAY).toISOString().slice(0, 10);
    out.push({ date, count: counts.get(date) ?? 0 });
  }
  return out;
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, message: "Sign in first." }, { status: 401 });
  }

  if (!findDatabaseUrlVar()) {
    return Response.json(
      { ok: false, message: "No database is attached to this deployment." },
      { status: 503 },
    );
  }

  try {
    const [jobRows, applicationRows, subscriberRows, cursorRows] = await Promise.all([
      db.select().from(jobs),
      db.select().from(applications).orderBy(desc(applications.createdAt)).limit(2000),
      db.select().from(subscribers).limit(2000),
      db.select().from(importState),
    ]);

    const now = Date.now();
    const live = jobRows.filter((job) => job.status === "published");
    const publishedDays = live.map((job) => ({
      date: dayKey(job.postedAt as unknown as Date),
      job,
    }));

    const withSalary = live.filter((job) => job.salaryMax > 0);
    const salaries = withSalary.map((job) => job.salaryMax).sort((a, b) => a - b);
    const medianSalary =
      salaries.length === 0 ? 0 : salaries[Math.floor(salaries.length / 2)] ?? 0;

    const bands = [
      { label: "Under ₦100k", min: 0, max: 100_000 },
      { label: "₦100k – ₦200k", min: 100_000, max: 200_000 },
      { label: "₦200k – ₦350k", min: 200_000, max: 350_000 },
      { label: "₦350k – ₦500k", min: 350_000, max: 500_000 },
      { label: "₦500k – ₦1m", min: 500_000, max: 1_000_000 },
      { label: "₦1m+", min: 1_000_000, max: Number.POSITIVE_INFINITY },
    ].map((band) => ({
      label: band.label,
      count: withSalary.filter((job) => job.salaryMax >= band.min && job.salaryMax < band.max).length,
    }));

    const staleAfter = now - 7 * DAY;
    const expiringSoon = live.filter(
      (job) => job.deadline && new Date(job.deadline as unknown as Date).getTime() - now < 3 * DAY,
    );
    const stale = live.filter(
      (job) => job.lastSeenAt && new Date(job.lastSeenAt as unknown as Date).getTime() < staleAfter,
    );
    const missingSalary = live.filter((job) => !job.salaryMax).length;
    const missingDescription = live.filter((job) => (job.description ?? "").length < 180).length;
    const duplicates = countBy(live, (job) => job.slug).filter((row) => row.count > 1);

    const subscriptionsByKind = countBy(subscriberRows, (row) => row.kind);
    const subscriptionPlans = countBy(subscriberRows, (row) => row.plan);

    const recentApplications = applicationRows.slice(0, 12).map((row) => {
      const job = jobRows.find((item) => item.id === row.jobId);
      return {
        name: row.fullName,
        email: row.email,
        phone: row.phone,
        role: job?.title ?? "Deleted listing",
        company: job?.company ?? "—",
        cv: row.cvFileName,
        at: row.createdAt,
      };
    });

    const applicationsByDay = series(
      30,
      applicationRows.map((row) => ({ date: dayKey(row.createdAt as unknown as Date) })),
    );
    const postingsByDay = series(
      30,
      publishedDays.map((row) => ({ date: row.date })),
    );

    const industries = countBy(live, (job) => job.category);
    const states = countBy(live, (job) => job.state);
    const jobTypes = countBy(live, (job) => job.jobType);
    const levels = countBy(live, (job) => job.experienceLevel);
    const companies = countBy(live, (job) => job.company);

    const appliedJobIds = new Set(applicationRows.map((row) => row.jobId));

    return Response.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      totals: {
        liveJobs: live.length,
        allJobs: jobRows.length,
        drafts: jobRows.length - live.length,
        newToday: postingsByDay[postingsByDay.length - 1]?.count ?? 0,
        new7d: postingsByDay.slice(-7).reduce((sum, day) => sum + day.count, 0),
        new30d: postingsByDay.reduce((sum, day) => sum + day.count, 0),
        applications: applicationRows.length,
        applications7d: applicationsByDay.slice(-7).reduce((sum, day) => sum + day.count, 0),
        subscribers: subscriberRows.length,
        salaryDisclosed: withSalary.length,
        salaryMedian: medianSalary,
        statesHiring: new Set(live.map((job) => job.state)).size,
        remote: live.filter((job) => job.isRemote || job.jobType === "Remote").length,
        companies: new Set(live.map((job) => job.company)).size,
        listingsWithApplications: appliedJobIds.size,
      },
      trend: { postings: postingsByDay, applications: applicationsByDay },
      industries,
      states,
      jobTypes,
      levels,
      salaryBands: bands,
      topCompanies: companies.slice(0, 8),
      subscriptionsByKind,
      subscriptionPlans: subscriptionPlans.slice(0, 6),
      recentApplications,
      quality: {
        missingSalary,
        missingDescription,
        stale: stale.length,
        expiringSoon: expiringSoon.length,
        duplicates: duplicates.length,
        cvs: subscriberRows.filter((row) => row.cvFileName).length,
      },
      importer: {
        cursors: cursorRows
          .map((row) => ({ key: row.key, page: Number(row.value), at: row.updatedAt }))
          .sort((a, b) => a.key.localeCompare(b.key)),
        lastImportAt:
          jobRows
            .map((job) => job.importedAt)
            .filter(Boolean)
            .sort((a, b) => new Date(b as unknown as Date).getTime() - new Date(a as unknown as Date).getTime())[0] ??
          null,
        newestListingAt: live
          .map((job) => job.postedAt)
          .sort(
            (a, b) =>
              new Date(b as unknown as Date).getTime() - new Date(a as unknown as Date).getTime(),
          )[0] ?? null,
      },
    });
  } catch (error) {
    console.error("[admin/stats]", error);
    return Response.json(
      {
        ok: false,
        message: "Could not read the database.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
