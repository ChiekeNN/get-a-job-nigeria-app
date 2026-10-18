import { and, eq, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { IMPORT_CONFIG, SOURCE_BOARD, type ImportConfig } from "@/lib/importer/config";
import {
  extractDescriptionText,
  extractJobLinks,
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
  companyFromRecruitmentTitle,
  companyFromTitle,
  companyInitials,
  deriveCity,
  detectExperienceLevel,
  detectJobType,
  detectState,
  isRemoteText,
  makeSlug,
  parseDeadline,
  parseSalary,
  tintFor,
} from "@/lib/importer/normalize";

export interface ImportCandidate {
  sourceId: string;
  url: string;
  title: string;
  category: string;
  summary: string;
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
  sourceUrl: string;
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
  if (filters.categories.length > 0 && !filters.categories.includes(candidate.category)) return false;
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
async function collectCandidates(config: ImportConfig, errors: string[]): Promise<ImportCandidate[]> {
  const byId = new Map<string, ImportCandidate>();

  for (const source of config.sources) {
    for (let page = 1; page <= config.maxPagesPerSource; page += 1) {
      const url = page === 1 ? source.url : `${source.url.replace(/\/$/, "")}/?page=${page}`;
      try {
        const html = await fetchText(url);
        const listings: RawListing[] = extractJobLinks(html);
        for (const listing of listings) {
          if (byId.has(listing.sourceId)) continue;
          byId.set(listing.sourceId, {
            sourceId: listing.sourceId,
            url: listing.url,
            title: listing.title,
            category: source.category,
            summary: "",
          });
        }
      } catch (error) {
        errors.push(`${source.name} (${url}): ${error instanceof Error ? error.message : String(error)}`);
      }
      if (config.requestDelayMs > 0) await sleep(config.requestDelayMs);
    }
  }

  if (config.useRssFeed) {
    try {
      const items = await fetchRssItems(SOURCE_BOARD.rss);
      for (const item of items) {
        if (!item.sourceId || byId.has(item.sourceId)) {
          if (item.sourceId && byId.has(item.sourceId)) {
            const existing = byId.get(item.sourceId);
            if (existing && !existing.summary) existing.summary = item.summary;
          }
          continue;
        }
        byId.set(item.sourceId, {
          sourceId: item.sourceId,
          url: item.link,
          title: item.title,
          category: config.sources[0]?.category ?? "Technology",
          summary: item.summary,
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

  const candidates = await collectCandidates(config, errors);
  result.counts.candidates = candidates.length;

  // Which upstream IDs do we already hold? One query keeps the run cheap.
  const ids = candidates.map((candidate) => `${SOURCE_BOARD.key}:${candidate.sourceId}`);
  const existingRows =
    ids.length > 0
      ? await db
          .select({ sourceId: jobs.sourceId })
          .from(jobs)
          .where(inArray(jobs.sourceId, ids))
      : [];
  const known = new Set(existingRows.map((row) => row.sourceId).filter(Boolean) as string[]);

  const fresh = candidates.filter((candidate) => !known.has(`${SOURCE_BOARD.key}:${candidate.sourceId}`));
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

  for (const candidate of selected) {
    const sourceId = `${SOURCE_BOARD.key}:${candidate.sourceId}`;
    try {
      const html = await fetchText(candidate.url);
      result.counts.fetched += 1;

      const extracted = extractFromHtml(html, candidate.title, candidate.summary);
      const salary = config.fields.salary ? parseSalary(extracted.salaryText) : { min: 0, max: 0 };
      if (config.filters.minSalary > 0 && salary.max > 0 && salary.max < config.filters.minSalary) {
        continue;
      }

      const state = config.fields.location ? detectState(extracted.locationText, extracted.description) : "Lagos";
      const city = deriveCity(extracted.locationText, state);
      const description = config.fields.description ? extracted.description : candidate.summary;
      const requirements = config.fields.requirements ? extracted.requirements : [];
      const title = config.fields.title ? extracted.title : candidate.title;
      const company = config.fields.company ? extracted.company : "Confidential Employer";

      const preview: ImportPreview = {
        sourceId,
        title,
        company,
        state,
        city,
        category: candidate.category,
        jobType: detectJobType(`${title} ${description}`),
        salaryMin: salary.min,
        salaryMax: salary.max,
        descriptionLength: description.length,
        requirements: requirements.length,
        deadline: extracted.deadline ? extracted.deadline.toISOString() : null,
        sourceUrl: candidate.url,
      };
      result.preview.push(preview);

      if (!dryRun) {
        let slug = makeSlug(title, company);
        if (takenSlugs.has(slug)) slug = `${slug}-${candidate.sourceId.slice(-5)}`;
        takenSlugs.add(slug);

        const inserted = await db
          .insert(jobs)
          .values({
            slug,
            title,
            company,
            companyInitials: companyInitials(company),
            companyColor: tintFor(company),
            state,
            city,
            category: candidate.category,
            jobType: detectJobType(`${title} ${description}`),
            salaryMin: salary.min,
            salaryMax: salary.max,
            description,
            requirements,
            responsibilities: [],
            benefits: [],
            experienceLevel: detectExperienceLevel(title, description),
            isFeatured: false,
            isRemote: isRemoteText(`${title} ${extracted.locationText} ${description}`),
            postedAt: new Date(),
            deadline: config.fields.deadline ? (extracted.deadline ?? new Date(Date.now() + 30 * 86_400_000)) : null,
            applicants: 0,
            employerEmail: null,
            status: config.publishImmediately ? "published" : "draft",
            source: SOURCE_BOARD.key,
            sourceId,
            sourceUrl: config.fields.applyUrl ? candidate.url : null,
            importedAt: new Date(),
            lastSeenAt: new Date(),
          })
          .onConflictDoNothing()
          .returning({ id: jobs.id });

        if (inserted.length > 0) result.counts.inserted += 1;
      }

      if (config.requestDelayMs > 0) await sleep(config.requestDelayMs);
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

  // Anything we have not seen upstream for a while comes down.
  if (!dryRun && config.expireAfterDays > 0) {
    const cutoff = new Date(Date.now() - config.expireAfterDays * 86_400_000);
    const expired = await db
      .update(jobs)
      .set({ status: "expired" })
      .where(
        and(
          eq(jobs.source, SOURCE_BOARD.key),
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
