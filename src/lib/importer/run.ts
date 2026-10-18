import { and, eq, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { IMPORT_CONFIG, SOURCE_FEED, type ImportConfig } from "@/lib/importer/config";
import {
  extractDescriptionText,
  extractListingCards,
  extractJobPosting,
  findFirst,
  DEADLINE_PATTERNS,
  LOCATION_PATTERNS,
  REQUIREMENT_MARKERS,
  SALARY_PATTERNS,
  readHeading,
  readMeta,
  splitSentences,
  stripTags,
  stripTagsFlat,
  type RawListing,
} from "@/lib/importer/extract";
import { FetchError, fetchText, sleep } from "@/lib/importer/http";
import { fetchRssItems } from "@/lib/importer/rss";
import {
  cleanJobTitle,
  scrubText,
  companyFromRecruitmentTitle,
  companyFromTitle,
  companyInitials,
  deriveCity,
  detectExperienceLevel,
  detectJobType,
  detectState,
  detectCategory,
  isRemoteText,
  makeSlug,
  parseDeadline,
  parsePostedDate,
  parseSalary,
  tintFor,
} from "@/lib/importer/normalize";

export interface ImportCandidate {
  sourceId: string;
  url: string;
  title: string;
  category: string;
  summary: string;
  postedText: string;
}

export interface ImportPreview {
  sourceId: string;
  title: string;
  company: string;
  state: string;
  city: string;
  category: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  descriptionLength: number;
  requirements: number;
  deadline: string | null;
}

export interface ImportResult {
  ok: boolean;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  config: { sources: number; maxJobsPerRun: number };
  counts: {
    candidates: number;
    alreadyImported: number;
    passedFilters: number;
    fetched: number;
    inserted: number;
    expired: number;
    failed: number;
  };
  blocked?: string;
  /** True when the run hit its time budget; the next run continues from here. */
  truncated?: boolean;
  errors: string[];
  preview: ImportPreview[];
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function containsAny(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return false;
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function passesTitleFilters(candidate: ImportCandidate, config: ImportConfig): boolean {
  const { filters } = config;
  if (
    filters.categories.length > 0 &&
    candidate.category !== "auto" &&
    !filters.categories.includes(candidate.category)
  ) {
    return false;
  }
  const blob = `${candidate.title} ${candidate.summary}`;
  if (!matchesKeywords(blob, filters.includeKeywords)) return false;
  if (containsAny(blob, filters.excludeKeywords)) return false;
  if (filters.states.length > 0) {
    const state = detectState(blob);
    if (!filters.states.includes(state)) return false;
  }
  return true;
}

/** Walk the configured source pages and the RSS feed, newest first, de-duplicated. */
export function pageUrl(source: { url: string; pagination?: string }, page: number): string | null {
  const style = source.pagination ?? "path-indexed";
  if (page === 1) return source.url;
  if (style === "none") return null;

  const base = source.url.replace(/\/$/, "");
  if (style === "query") return `${base}/?page=${page}`;

  // The board is 1-indexed oddly: /jobs/lastweek/ is page 1, /jobs/lastweek/1/ is page 2.
  return `${base}/${page - 1}/`;
}

/** Walk the configured source pages, newest first, de-duplicated. */
async function collectCandidates(
  config: ImportConfig,
  errors: string[],
  deadlineMs: number,
): Promise<ImportCandidate[]> {
  const byId = new Map<string, ImportCandidate>();

  for (const source of config.sources) {
    for (let page = 1; page <= config.maxPagesPerSource; page += 1) {
      const url = pageUrl(source, page);
      if (!url) break;

      // Leave time to actually store what has been collected.
      if (Date.now() > deadlineMs) {
        errors.push(`Stopped paging ${source.name} at page ${page} to stay inside the function limit.`);
        break;
      }

      try {
        const html = await fetchText(url);
        const cards = extractListingCards(html);

        for (const card of cards) {
          if (byId.has(card.sourceId)) continue;
          byId.set(card.sourceId, {
            sourceId: card.sourceId,
            url: card.url,
            title: card.title,
            category: source.category,
            summary: card.summary,
            postedText: card.postedText,
          });
        }

        // Stop early once a page comes back empty — no point walking further.
        if (cards.length === 0) break;
      } catch (error) {
        errors.push(`${source.name} (${url}): ${error instanceof Error ? error.message : String(error)}`);
        break;
      }

      if (config.requestDelayMs > 0) await sleep(config.requestDelayMs);
    }
  }

  if (config.useRssFeed) {
    try {
      const items = await fetchRssItems(SOURCE_FEED.rss);
      for (const item of items) {
        if (!item.sourceId) continue;
        const existing = byId.get(item.sourceId);
        if (existing) {
          if (!existing.summary) existing.summary = item.summary;
          continue;
        }
        byId.set(item.sourceId, {
          sourceId: item.sourceId,
          url: item.link,
          title: item.title,
          category: config.sources[0]?.category ?? "Technology",
          summary: item.summary,
          postedText: "",
        });
      }
    } catch (error) {
      errors.push(`RSS feed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return [...byId.values()];
}

interface ExtractedJob {
  title: string;
  company: string;
  locationText: string;
  salaryText: string;
  description: string;
  requirements: string[];
  deadline: Date | null;
}

function extractFromHtml(html: string, fallbackTitle: string, fallbackSummary: string): ExtractedJob {
  const posting = extractJobPosting(html);
  const text = stripTags(html);

  const metaTitle = readMeta(html, "og:title") || readHeading(html);
  const rootTitle: string = (() => {
    if (typeof posting?.title === "string" && posting.title.trim()) return posting.title.trim();
    return cleanJobTitle(metaTitle || fallbackTitle);
  })();

  let company = "";
  if (posting && typeof posting.hiringOrganization === "object" && posting.hiringOrganization !== null) {
    const org = posting.hiringOrganization as Record<string, unknown>;
    if (typeof org.name === "string") company = org.name.trim();
  }
  if (!company) company = companyFromTitle(rootTitle);
  if (!company) company = companyFromRecruitmentTitle(rootTitle);
  if (!company) {
    const hiring = /^([A-Z][\w&'().,\- ]{2,60}?)\s+is (?:recruiting|currently recruiting|seeking)/m.exec(
      fallbackSummary || text,
    );
    company = hiring?.[1]?.trim() ?? "";
  }
  if (!company) company = "Confidential Employer";

  const locationText =
    findFirst(text, LOCATION_PATTERNS) ||
    (typeof posting?.jobLocation === "object" && posting.jobLocation !== null
      ? findFirst(JSON.stringify(posting.jobLocation), LOCATION_PATTERNS)
      : "") ||
    readMeta(html, "og:description").slice(0, 120);

  const salaryText = findFirst(text, SALARY_PATTERNS);

  const requirementsBlock = findFirst(text, REQUIREMENT_MARKERS);
  const requirements = splitSentences(requirementsBlock, 8);

  const deadlineText = findFirst(text, DEADLINE_PATTERNS);

  let description = "";
  if (typeof posting?.description === "string" && posting.description.trim().length > 80) {
    description = stripTags(posting.description).slice(0, 6000);
  }
  if (!description) description = extractDescriptionText(text);
  if (description.length < 80) description = fallbackSummary || description;

  return {
    title: rootTitle,
    company,
    locationText,
    salaryText,
    description: description.trim(),
    requirements,
    deadline: parseDeadline(deadlineText),
  };
}

/**
 * Build a listing from the summary printed on the category page. Used when the
 * summary already carries location, salary and requirements, so no extra request
 * is needed.
 */
function extractFromText(text: string, fallbackTitle: string, summary: string): ExtractedJob {
  const company =
    companyFromTitle(fallbackTitle) ||
    companyFromRecruitmentTitle(fallbackTitle) ||
    /^([A-Z][\w&'().,\- ]{2,60}?)\s+is (?:recruiting|currently recruiting|seeking)/m.exec(text)?.[1]?.trim() ||
    "Confidential Employer";

  return {
    title: cleanJobTitle(fallbackTitle),
    company,
    locationText: findFirst(text, LOCATION_PATTERNS),
    salaryText: findFirst(text, SALARY_PATTERNS),
    description: (text || summary).trim().slice(0, 6000),
    requirements: splitSentences(findFirst(text, REQUIREMENT_MARKERS), 8),
    deadline: parseDeadline(findFirst(text, DEADLINE_PATTERNS)),
  };
}

export interface RunOptions {
  dryRun?: boolean;
  limit?: number;
  config?: ImportConfig;
}

export async function runImport(options: RunOptions = {}): Promise<ImportResult> {
  const config = options.config ?? IMPORT_CONFIG;
  const dryRun = options.dryRun ?? false;
  const limit = Math.min(options.limit ?? config.maxJobsPerRun, config.maxJobsPerRun);
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  const result: ImportResult = {
    ok: true,
    dryRun,
    startedAt,
    finishedAt: startedAt,
    config: { sources: config.sources.length, maxJobsPerRun: config.maxJobsPerRun },
    counts: {
      candidates: 0,
      alreadyImported: 0,
      passedFilters: 0,
      fetched: 0,
      inserted: 0,
      expired: 0,
      failed: 0,
    },
    errors,
    preview: [],
  };

  if (!config.enabled) {
    result.ok = false;
    errors.push("Import is disabled in config.");
    result.finishedAt = new Date().toISOString();
    return result;
  }

  // Reserve a slice of the budget for writing, so a slow crawl cannot consume it all.
  const collectionDeadline = Date.now() + Math.round(config.timeBudgetMs * 0.6);
  const candidates = await collectCandidates(config, errors, collectionDeadline);
  result.counts.candidates = candidates.length;

  // Which upstream IDs do we already hold? One query keeps the run cheap.
  const ids = candidates.map((candidate) => `${SOURCE_FEED.key}:${candidate.sourceId}`);
  const existingRows =
    ids.length > 0
      ? await db
          .select({ sourceId: jobs.sourceId })
          .from(jobs)
          .where(inArray(jobs.sourceId, ids))
      : [];
  const known = new Set(existingRows.map((row) => row.sourceId).filter(Boolean) as string[]);

  const fresh = candidates.filter((candidate) => !known.has(`${SOURCE_FEED.key}:${candidate.sourceId}`));
  result.counts.alreadyImported = candidates.length - fresh.length;

  // Re-seeing a listing keeps it alive; its expiry clock resets.
  if (!dryRun && known.size > 0) {
    await db
      .update(jobs)
      .set({ lastSeenAt: new Date() })
      .where(inArray(jobs.sourceId, [...known]));
  }

  const selected = fresh.filter((candidate) => passesTitleFilters(candidate, config)).slice(0, limit);
  result.counts.passedFilters = selected.length;

  // Slugs are globally unique; collect the existing set once.
  const slugRows = await db.select({ slug: jobs.slug }).from(jobs);
  const takenSlugs = new Set(slugRows.map((row) => row.slug));

  const runStartedMs = Date.now();
  type NewRow = typeof jobs.$inferInsert;
  const bucket: NewRow[] = [];
  let truncated = false;

  // One INSERT per row cannot finish 5000 jobs inside a function timeout, so rows
  // are accumulated and written in batches.
  async function flush(): Promise<void> {
    if (dryRun || bucket.length === 0) return;

    for (let offset = 0; offset < bucket.length; offset += config.insertBatchSize) {
      const chunk = bucket.slice(offset, offset + config.insertBatchSize);
      const inserted = await db
        .insert(jobs)
        .values(chunk)
        .onConflictDoNothing()
        .returning({ id: jobs.id });
      result.counts.inserted += inserted.length;
    }

    bucket.length = 0;
  }

  for (const candidate of selected) {
    // Stop before the platform terminates the function. Whatever was written stays,
    // and the next run picks up from here because stored listings are skipped.
    if (Date.now() - runStartedMs > config.timeBudgetMs) {
      truncated = true;
      break;
    }

    const sourceId = `${SOURCE_FEED.key}:${candidate.sourceId}`;
    try {
      // The category page usually carries enough detail. Only pay for a second
      // request when the summary is thin.
      const summaryIsRich = candidate.summary.trim().length >= 180;
      const needsDetail = config.detailPage === "always" || !summaryIsRich;

      let extracted: ExtractedJob;
      if (needsDetail) {
        const html = await fetchText(candidate.url);
        result.counts.fetched += 1;
        extracted = extractFromHtml(html, candidate.title, candidate.summary);
      } else {
        extracted = extractFromText(candidate.summary, candidate.title, candidate.summary);
      }

      const resolvedCategory =
        candidate.category === "auto"
          ? detectCategory(`${candidate.title} ${extracted.description}`)
          : candidate.category;
      const salary = config.fields.salary ? parseSalary(extracted.salaryText) : { min: 0, max: 0 };
      if (config.filters.minSalary > 0 && salary.max > 0 && salary.max < config.filters.minSalary) {
        continue;
      }

      const state = config.fields.location
        ? detectState(extracted.locationText, extracted.description)
        : "Lagos";
      const city = deriveCity(extracted.locationText, state);
      const description = scrubText(
        config.fields.description ? extracted.description : candidate.summary,
      );
      const requirements = config.fields.requirements
        ? extracted.requirements.map((item) => scrubText(item)).filter(Boolean)
        : [];
      const title = scrubText(config.fields.title ? extracted.title : candidate.title);
      const company = scrubText(
        config.fields.company ? extracted.company : "Confidential Employer",
      );
      const jobType = detectJobType(`${title} ${description}`);

      // A full 5000-row preview would be a multi-megabyte response; keep it useful
      // and small instead.
      if (result.preview.length < 50) {
        result.preview.push({
          sourceId,
          title,
          company,
          state,
          city,
          category: resolvedCategory,
          jobType,
          salaryMin: salary.min,
          salaryMax: salary.max,
          descriptionLength: description.length,
          requirements: requirements.length,
          deadline: extracted.deadline ? extracted.deadline.toISOString() : null,
        });
      }

      if (!dryRun) {
        let slug = makeSlug(title, company);
        if (takenSlugs.has(slug)) slug = `${slug}-${candidate.sourceId.slice(-5)}`;
        takenSlugs.add(slug);

        bucket.push({
          slug,
          title,
          company,
          companyInitials: companyInitials(company),
          companyColor: tintFor(company),
          state,
          city,
          category: resolvedCategory,
          jobType,
          salaryMin: salary.min,
          salaryMax: salary.max,
          description,
          requirements,
          responsibilities: [],
          benefits: [],
          experienceLevel: detectExperienceLevel(title, description),
          isFeatured: false,
          isRemote: isRemoteText(`${title} ${extracted.locationText} ${description}`),
          postedAt: parsePostedDate(candidate.postedText),
          deadline: config.fields.deadline
            ? (extracted.deadline ?? new Date(Date.now() + 30 * 86_400_000))
            : null,
          applicants: 0,
          employerEmail: null,
          status: config.publishImmediately ? "published" : "draft",
          source: SOURCE_FEED.key,
          sourceId,
          importedAt: new Date(),
          lastSeenAt: new Date(),
        });

        if (bucket.length >= config.insertBatchSize) await flush();
      }

      if (config.requestDelayMs > 0 && needsDetail) await sleep(config.requestDelayMs);
    } catch (error) {
      result.counts.failed += 1;
      if (error instanceof FetchError && error.blocked) {
        result.blocked =
          "The source blocked this request (Cloudflare bot protection). Run from an allowlisted host or request a feed from the source.";
        errors.push(`${candidate.url}: ${error.message}`);
        break;
      }
      errors.push(`${candidate.url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await flush();
  result.truncated = truncated;
  if (truncated) {
    errors.push(
      `Stopped after ${Math.round(config.timeBudgetMs / 1000)}s to stay inside the function limit. ` +
        "The next run resumes automatically because stored listings are skipped.",
    );
  }

  // Anything we have not seen upstream for a while comes down.
  if (!dryRun && config.expireAfterDays > 0) {
    const cutoff = new Date(Date.now() - config.expireAfterDays * 86_400_000);
    const expired = await db
      .update(jobs)
      .set({ status: "expired" })
      .where(
        and(
          eq(jobs.source, SOURCE_FEED.key),
          eq(jobs.status, "published"),
          lt(jobs.lastSeenAt, cutoff),
          sql`${jobs.lastSeenAt} is not null`,
        ),
      )
      .returning({ id: jobs.id });
    result.counts.expired = expired.length;
  }

  result.finishedAt = new Date().toISOString();
  return result;
}
