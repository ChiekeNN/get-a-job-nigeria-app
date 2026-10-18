# Importing listings from another board

A scheduled importer pulls listings from HotNigerianJobs, normalises them into
NaijaHire's schema, and keeps them in sync. It is idempotent: running it twice
does not create duplicates.

## 1. Choose your parts

Everything you can vary lives in **`src/lib/importer/config.ts`**.

| What you want to control | Where |
| --- | --- |
| Which slices of the board to read | `sources[]` — one entry per listing page URL |
| Which category each slice files under | `sources[].category` |
| Which states to keep | `filters.states` (empty = all) |
| Keyword include / exclude | `filters.includeKeywords`, `filters.excludeKeywords` |
| Minimum advertised salary | `filters.minSalary` |
| How many new jobs per day | `maxJobsPerRun` (default 100) |
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
  applyUrl: true,      // keep the link back to the original listing
}
```

Slides of the board you may point at:

```
/industry/119/  Computer and AI          /industry/105/  Banking & Finance
/industry/128/  Oil and Gas             /industry/118/  Medical
/industry/112/  Engineering             /industry/135/  Telecommunication
/field/233/     Human Resources         /field/215/     Customer Service
/location/901/  Abuja                   /location/902/  Lagos
/jobs/featured/ Latest featured          /alljobs/0/     Everything
```

## 2. One-time database migration

The importer adds five columns and a unique index to `jobs`:

```
source, source_id, source_url, imported_at, last_seen_at
jobs_source_id_unique
```

Apply them with drizzle-kit against the production database:

```bash
DATABASE_URL="postgres://…" npx drizzle-kit push
```

The index on `source_id` is what prevents duplicates. Existing rows have
`NULL` there, and Postgres allows many `NULL`s in a unique index, so manually
posted jobs are unaffected.

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
100-jobs-per-day target. Set `CRON_SECRET` in the project environment and Vercel
signs the cron request automatically; `IMPORT_SECRET` covers manual and external
callers (GitHub Actions, cron-job.org, your laptop).

## 5. How sync behaves

- **New jobs** are inserted with `source_id = "hotnigerianjobs:<id>"`.
- **Already-imported jobs** are skipped for detail fetching, but their
  `last_seen_at` is refreshed, so they stay live cheaply.
- **Expiry** — anything not seen on the source for `expireAfterDays` is set to
  `status = "expired"` and drops out of the public board. Applications already
  recorded are never deleted.
- **Slugs** are globally unique; a collision gets a numeric suffix.

## 6. Attribution and applying

Imported listings carry `source_url`. The job page then:

- shows "Apply on HotNigerianJobs" instead of the local apply form,
- states where the listing came from, and
- keeps a link to the original.

This matters beyond politeness: the local form writes applications into your
own database, which no external employer is reading. Sending candidates to the
original posting is the only version where their application actually lands.

## 7. Operational notes

- **Bot protection.** The source sits behind Cloudflare. Requests from
  datacenter IPs (Vercel functions, GitHub runners) are often challenged. When
  that happens the run returns HTTP `424` with a `blocked` message instead of
  silently importing nothing. If it persists, the durable fix is a feed or
  export from the source rather than heavier scraping.
- **Feed first.** When `useRssFeed` is on, the newest items come from
  `https://www.hotnigerianjobs.com/feed/rss.xml`, which is cheaper and more
  stable than walking listing pages. Detail pages are only fetched for items
  that are new to your database.
- **Politeness.** `requestDelayMs` (default 350 ms) spaces out requests. Leave
  it alone unless you have a reason.
- **Logs.** Every run logs one line:
  `[import] candidates=… new=… inserted=… expired=… failed=…`
  Watch `inserted` going to zero for several days — that is the early signal
  that a selector or the feed shape changed.
- **Smoke test.** `npx tsx scripts/smoke-import.ts` runs the parser against
  fixtures offline and exits non-zero on regression.
