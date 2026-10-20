import { getPool } from "@/db";

/**
 * First-party traffic measurement.
 *
 * Design rules, so this never becomes a privacy problem:
 *  - no cookies and no third-party script
 *  - no IP address, no user agent, no personal data stored
 *  - one anonymous id per browser tab (sessionStorage) to approximate a visit
 *  - /admin and /api are never tracked
 *
 * The table is created on first use, so deploying this needs no manual SQL.
 */

let schemaReady: Promise<void> | null = null;

export function ensureAnalyticsTable(): Promise<void> {
  schemaReady ??= (async () => {
    const pool = getPool();
    await pool.query(`
      create table if not exists page_views (
        id serial primary key,
        path text not null,
        referrer text,
        device text,
        country text,
        session_id text,
        created_at timestamptz not null default now()
      )
    `);
    await pool.query(`create index if not exists page_views_created_at_idx on page_views (created_at)`);
    await pool.query(`create index if not exists page_views_path_idx on page_views (path)`);
  })().catch((error) => {
    // Allow a later request to retry after a transient database failure.
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

export interface PageViewInput {
  path: string;
  referrer: string | null;
  device: string;
  country: string | null;
  sessionId: string | null;
}

export async function recordPageView(input: PageViewInput): Promise<void> {
  await ensureAnalyticsTable();
  await getPool().query(
    `insert into page_views (path, referrer, device, country, session_id) values ($1, $2, $3, $4, $5)`,
    [input.path, input.referrer, input.device, input.country, input.sessionId],
  );
}

/* ───────────────────────────── reporting ───────────────────────────── */

export interface TrafficReport {
  generatedAt: string;
  totals: {
    views30: number;
    visits30: number;
    views7: number;
    viewsToday: number;
    viewsAll: number;
    liveNow: number;
  };
  series: Array<{ label: string; value: number }>;
  topPages: Array<{ path: string; label: string; views: number }>;
  topJobs: Array<{ slug: string; title: string; company: string; views: number }>;
  sections: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
  recent: Array<{ path: string; device: string | null; country: string | null; at: string }>;
}

const SECTION_LABELS: Record<string, string> = {
  "": "Home",
  jobs: "Job listings",
  blog: "Advice & guides",
  states: "State pages",
  "cv-writing": "CV writing",
  pro: "Job Seeker Pro",
  employers: "For employers",
  contact: "Contact",
  legal: "Legal",
  terms: "Terms",
};

/** Turns a stored path into something readable in a table. */
export function friendlyPath(path: string): string {
  if (path === "/") return "Home";
  if (path === "/jobs") return "All jobs";
  const jobMatch = path.match(/^\/jobs\/([^/]+)$/);
  if (jobMatch) return `Job · ${jobMatch[1].replace(/-/g, " ").slice(0, 52)}`;
  if (path === "/blog") return "Advice index";
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) return `Article · ${blogMatch[1].replace(/-/g, " ").slice(0, 48)}`;
  const hubMatch = path.match(/^\/blog\/topic\/([^/]+)$/);
  if (hubMatch) return `Advice · ${hubMatch[1]}`;
  const stateMatch = path.match(/^\/states\/([^/]+)$/);
  if (stateMatch) return `State · ${stateMatch[1].replace(/-/g, " ")}`;
  return path;
}

function regionName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

interface CountRow {
  name: string | null;
  count: number;
}

/** Reads everything the traffic console needs. Assumes the table exists. */
export async function readTrafficReport(): Promise<TrafficReport> {
  await ensureAnalyticsTable();
  const pool = getPool();

  const window = `created_at >= now() - interval '30 days'`;

  const [totals, week, today, all, live, series, pages, jobsByPath, sections, referrers, devices, countries, recent] =
    await Promise.all([
      pool.query<{ views: number; visits: number }>(
        `select count(*)::int as views, count(distinct session_id)::int as visits
         from page_views where ${window}`,
      ),
      pool.query<{ views: number }>(
        `select count(*)::int as views from page_views where created_at >= now() - interval '7 days'`,
      ),
      pool.query<{ views: number }>(
        `select count(*)::int as views from page_views where created_at >= date_trunc('day', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos'`,
      ),
      pool.query<{ views: number }>(`select count(*)::int as views from page_views`),
      pool.query<{ visits: number }>(
        `select count(distinct session_id)::int as visits from page_views where created_at >= now() - interval '5 minutes'`,
      ),
      pool.query<{ date: string; views: number }>(
        `select to_char(d.day, 'YYYY-MM-DD') as date, count(v.id)::int as views
         from generate_series(
           date_trunc('day', now() at time zone 'Africa/Lagos') - interval '29 days',
           date_trunc('day', now() at time zone 'Africa/Lagos'),
           interval '1 day'
         ) as d(day)
         left join page_views v
           on date_trunc('day', v.created_at at time zone 'Africa/Lagos') = d.day
         group by d.day
         order by d.day`,
      ),
      pool.query<{ path: string; views: number }>(
        `select path, count(*)::int as views from page_views
         where ${window} group by path order by views desc limit 12`,
      ),
      pool.query<{ path: string; views: number }>(
        `select path, count(*)::int as views from page_views
         where ${window} and path like '/jobs/%'
         group by path order by views desc limit 10`,
      ),
      pool.query<{ segment: string; views: number }>(
        `select split_part(path, '/', 2) as segment, count(*)::int as views
         from page_views where ${window}
         group by segment order by views desc limit 12`,
      ),
      pool.query<{ name: string | null; count: number }>(
        `select referrer as name, count(distinct coalesce(session_id, id::text))::int as count
         from page_views where ${window}
         group by referrer order by count desc limit 8`,
      ),
      pool.query<{ name: string | null; count: number }>(
        `select device as name, count(*)::int as count from page_views
         where ${window} group by device order by count desc`,
      ),
      pool.query<{ name: string | null; count: number }>(
        `select country as name, count(*)::int as count from page_views
         where ${window} group by country order by count desc limit 8`,
      ),
      pool.query<{ path: string; device: string | null; country: string | null; at: Date }>(
        `select path, device, country, created_at as at from page_views
         order by created_at desc limit 10`,
      ),
    ]);

  const topJobPaths = jobsByPath.rows;
  let jobRows: Array<{ slug: string; title: string; company: string }> = [];
  if (topJobPaths.length > 0) {
    const slugs = topJobPaths.map((row) => row.path.replace(/^\/jobs\//, ""));
    const found = await pool.query<{ slug: string; title: string; company: string }>(
      `select slug, title, company from jobs where slug = any($1::text[])`,
      [slugs],
    );
    jobRows = found.rows;
  }

  const label = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      views30: totals.rows[0]?.views ?? 0,
      visits30: totals.rows[0]?.visits ?? 0,
      views7: week.rows[0]?.views ?? 0,
      viewsToday: today.rows[0]?.views ?? 0,
      viewsAll: all.rows[0]?.views ?? 0,
      liveNow: live.rows[0]?.visits ?? 0,
    },
    series: series.rows.map((row) => ({ label: label(row.date), value: row.views })),
    topPages: pages.rows.map((row) => ({
      path: row.path,
      label: friendlyPath(row.path),
      views: row.views,
    })),
    topJobs: topJobPaths.map((row) => {
      const slug = row.path.replace(/^\/jobs\//, "");
      const job = jobRows.find((item) => item.slug === slug);
      return { slug, title: job?.title ?? slug.replace(/-/g, " "), company: job?.company ?? "—", views: row.views };
    }),
    sections: sections.rows.map((row) => ({
      name: SECTION_LABELS[row.segment] ?? (row.segment || "Other"),
      count: row.views,
    })),
    referrers: (referrers.rows as CountRow[]).map((row) => ({
      name: row.name && row.name.length > 0 ? row.name : "Direct",
      count: row.count,
    })),
    devices: (devices.rows as CountRow[]).map((row) => ({
      name: row.name ?? "Unknown",
      count: row.count,
    })),
    countries: (countries.rows as CountRow[]).map((row) => ({
      name: row.name ? regionName(row.name) : "Unknown",
      count: row.count,
    })),
    recent: recent.rows.map((row) => ({
      path: row.path,
      device: row.device,
      country: row.country,
      at: row.at.toISOString(),
    })),
  };
}
