# Importing listings from another board

A scheduled importer pulls listings from the configured upstream feed, normalises
them into GetAJob's schema, and keeps them in sync. It is idempotent: running it twice
does not create duplicates.

## 1. Choose your parts

Everything you can vary lives in **`src/lib/importer/config.ts`**.

| What you want to control | Where |
| --- | --- |
| Which slices of the board to read | `sources[]` — one entry per listing page URL |
| Which time window | `/jobs/today/`, `/jobs/1day/`, `/jobs/lastweek/` |
| How paging works | `sources[].pagination` — `"path-indexed"`, `"query"` or `"none"` |
| Fetch every job page or reuse summaries | `detailPage` — `"auto"` or `"always"` |
| Which category each slice files under | `sources[].category` |
| Which states to keep | `filters.states` (empty = all) |
| Keyword include / exclude | `filters.includeKeywords`, `filters.excludeKeywords` |
| Minimum advertised salary | `filters.minSalary` |
| How many new jobs per day | `maxJobsPerRun` (default 5000) |
| Pages walked per source | `maxPagesPerSource` (default 110, ~50 jobs/page) |
| Stop before the function timeout | `timeBudgetMs` (default 240s) |
| Publish immediately or review first | `publishImmediately` (false = saved as `draft`) |
| How long before an unseen job is unpublished | `expireAfterDays` |
| **Which parts of each listing to copy** | `fields` |

`fields` is the "pick specific parts" switch:

```ts
fields: {
  title: true,
  company: true,
  location: true,
  salary: true,        // false = salary stored as 0 and shown as "Not disclosed"
  description: true,   // false = only the short summary is kept
  requirements: true,  // false = empty requirements list
  deadline: true,
}
```

`applyUrl` is reserved and ignored. Listings never link out.

### The "last week" listings

Slices of the board you may point at:

```
/jobs/today/     posted today            /jobs/1day/     yesterday
/jobs/2days/     Friday's jobs           /jobs/lastweek/ the last seven days
/industry/119/   Computer and AI         /industry/105/  Banking & Finance
/industry/128/   Oil and Gas             /industry/118/  Medical
/field/233/      Human Resources         /field/215/     Customer Service
/location/901/   Abuja                   /location/902/  Lagos
/alljobs/0/      Everything, paginated
```

`/jobs/lastweek/` is the default. It listed **4,040 jobs** in the week of 05–12 Oct
2026, about 50 per page, newest first.

Two things worth knowing about it:

- **Paging is off by one.** `/jobs/lastweek/` is page 1, `/jobs/lastweek/1/` is page 2,
  `/jobs/lastweek/2/` is page 3. `pagination: "path-indexed"` handles this.
- **Every card carries its own summary** — location, salary and qualifications are
  printed on the listing page itself. With `detailPage: "auto"`, the importer uses
  that summary and only fetches the individual job page when the summary is thin
  (under ~180 characters). That turns ~150 requests into ~3.

Because the firehose has no industry labels, set `category: "auto"` and each listing
is classified from its title and description into your nine categories.

The board also has daily recap posts ("HNJobs (Recap): …"). These are newsletter
roundups rather than single roles; add `"recap"` to `filters.excludeKeywords` if you
would rather not carry them.

## 2. One-time database migration

The importer adds five columns and a unique index to `jobs`:

```
source, source_id, imported_at, last_seen_at
jobs_source_id_unique
```

`drizzle.config.ts` reads the connection string from the environment — it never
contains a hardcoded URL, so the command cannot silently target a local database.

### Windows PowerShell

```powershell
$env:DATABASE_URL = "postgresql://user:password@host:5432/dbname"
npx drizzle-kit push
```

Note the spacing: PowerShell needs the space either side of `=`, and `$env:` is
not optional. `DATABASE_URL="..." npx drizzle-kit push` is bash syntax and fails
in PowerShell with `CommandNotFoundException`.

To keep the value for the session only, the line above is enough. To clear it
afterwards:

```powershell
Remove-Item Env:\DATABASE_URL
```

### macOS / Linux

```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
npx drizzle-kit push
```

### .env (works on every platform)

Copy `.env.example` to `.env`, set `DATABASE_URL`, then just run:

```bash
npx drizzle-kit push
```

`drizzle.config.ts` loads `.env` automatically via `dotenv`. `.env` is already
gitignored.

### Which connection string to use

- **Supabase** — Project settings → Database → Connection string → *URI*. For
  `drizzle-kit push` prefer the direct connection (port `5432`); the pooler
  (`6543`) is fine for the running app.
- **Neon** — Dashboard → Connection details → *Connection string*. Use the
  pooled string for the app; either works for the migration.
- **Vercel Postgres** — Storage → your database → `.env.local` tab.

Use the same value in Vercel so the app and the migration agree. The app accepts
any of `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`,
`POSTGRES_URL_NON_POOLING` or `NEON_DATABASE_URL`.

Convenience scripts: `npm run db:push` and `npm run db:studio`.

### Verify

```bash
curl https://<your-domain>/api/health
```

- `reason: no_connection_string` — no env var set
- `reason: connection_failed` — wrong host/password, or the database rejects Vercel's IPs
- `reason: tables_missing` — connected but the migration has not run
- `"ok": true` — connected, with a `jobs` count

## 3. Dry run first

A dry run parses and reports without writing anything:

```bash
curl -X POST "https://<your-domain>/api/admin/import?dryRun=1&limit=3" \
  -H "x-import-secret: $IMPORT_SECRET" | jq
```

The response contains a `preview[]` array showing exactly what would be created:
title, company, state, city, salary, description length, requirement count and
deadline. Check those before the first real run — if the source changes its
wording, this is where you will see it.

Then allow it to write:

```bash
curl -X POST "https://<your-domain>/api/admin/import?limit=10" \
  -H "x-import-secret: $IMPORT_SECRET" | jq
```

## 4. Scheduling

`vercel.json` registers a daily cron at 05:00 UTC:

```json
{ "crons": [{ "path": "/api/admin/import", "schedule": "0 5 * * *" }] }
```

On Vercel's Hobby plan crons may run at most once per day, which matches the
daily run. Set `CRON_SECRET` in the project environment and Vercel
signs the cron request automatically; `IMPORT_SECRET` covers manual and external
callers (GitHub Actions, cron-job.org, your laptop).

## 4b. Running at 5,000 jobs a day on Vercel

`maxJobsPerRun` is 5000, but a single invocation should never try to do all of it.
The work is split instead:

**13 pages per run, eight runs a day.** At ~50 listings per page that is ~650 per
run and ~5,200 a day — the 5000 target cleared, with every run staying well
inside the function limit.

The eight triggers live in `vercel.json`:

```json
{ "path": "/api/admin/import", "schedule": "5 0 * * *" },
{ "path": "/api/admin/import", "schedule": "5 3 * * *" },
… every three hours …
```

### Why eight separate crons and not one hourly cron

Vercel **Hobby** allows 100 cron jobs per project, but each one may run **only
once per day**. A single `0 * * * *` entry fails deployment outright:

```
Hobby accounts are limited to daily Cron Jobs.
```

Eight separate daily entries are all legal on Hobby, and give the same practical
effect as an every-three-hours schedule. On Pro the identical config works too,
so nothing needs changing when the plan is upgraded.

### The cursor is what makes it work

A run cannot start from page 1 every time — it would re-read the same listings
forever and never reach page 40. So the sweep position is stored in the
`import_state` table:

1. Every run reads **page 1 first**, so brand-new listings are picked up promptly.
2. It then sweeps **13 pages continuing from the stored cursor**.
3. The cursor advances. After the last page (or an empty page) it wraps back to 1.

Response includes `cursors: { "Last week": { "from": 14, "to": 27 } }` so you can
see the walk advancing between runs.

### Safeties

- **Batched writes** — 250 rows per `INSERT`, not one per job.
- **Time budget** — `timeBudgetMs` (240s) stops the run cleanly before the 300s
  function limit. A cut-short run reports `"truncated": true`, and the next run
  resumes from the cursor.
- **Page-collection deadline** — 60% of the budget, so a slow crawl cannot
  consume the whole run and leave nothing written.

### Plan limits

| | Hobby | Pro |
| --- | --- | --- |
| Function max duration | 300s | 300s default (up to 800s) |
| Crons per project | 100 | 100 |
| Cron frequency | **once per day each** | any |
| Cost | free | $20/mo per member |

The eight-daily-crons design deliberately fits inside Hobby's once-per-day rule,
so **5,000 a day does not require Pro**. Pro only helps if you want a single
hourly job instead of eight daily ones.

### Custom domain

Pointing `getajob.com.ng` at Vercel from Namecheap changes **nothing** about the
limits above — the plan is attached to the Vercel account, not the domain, and
custom domains are free on Hobby. Add it under Project → Settings → Domains,
then set these records at Namecheap:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Once it resolves, `metadataBase` (already `https://getajob.com.ng`) makes every
canonical and social URL correct without a code change. Rename the Vercel project
if you want the `*.vercel.app` URL to match the brand.

## 5. How sync behaves

- **New jobs** are inserted with `source_id = "feed:<id>"` (internal key only).
- **Already-imported jobs** are skipped for detail fetching, but their
  `last_seen_at` is refreshed, so they stay live cheaply.
- **Brand scrubbing** — the source's name is stripped from titles and company
  names at write time (`SOURCE_FEED.stripFromTitles`), so it cannot appear in a
  heading, page title, meta description or search result.
- **Expiry** — anything not seen on the source for `expireAfterDays` is set to
  `status = "expired"` and drops out of the public board. Applications already
  recorded are never deleted.
- **Slugs** are globally unique; a collision gets a numeric suffix.

## 6. Everything happens on this site

Imported listings are indistinguishable from native ones in the interface:

- no source name, badge or attribution anywhere,
- no outbound link — the job page never points at the upstream board,
- the local apply form handles every application, so candidates stay on
  GetAJob end to end.

Applications land in your own `applications` table. Nothing forwards them
upstream automatically, so delivery to employers is yours to operate.

## 7. Operational notes

- **Bot protection.** The source sits behind Cloudflare. Requests from
  datacenter IPs (Vercel functions, GitHub runners) are often challenged. When
  that happens the run returns HTTP `424` with a `blocked` message instead of
  silently importing nothing. If it persists, the durable fix is a feed or
  export from the source rather than heavier scraping.
- **Feed first.** When `useRssFeed` is on, the newest items come from the feed
  URL in `SOURCE_FEED.rss`, which is cheaper and more stable than walking
  listing pages. Detail pages are only fetched for items that are new to your
  database.
- **Politeness.** `requestDelayMs` (default 350 ms) spaces out requests. Leave
  it alone unless you have a reason.
- **Logs.** Every run logs one line:
  `[import] candidates=… new=… inserted=… expired=… failed=…`
  Watch `inserted` going to zero for several days — that is the early signal
  that a selector or the feed shape changed.
- **Smoke test.** `npx tsx scripts/smoke-import.ts` runs the parser against
  fixtures offline and exits non-zero on regression.
