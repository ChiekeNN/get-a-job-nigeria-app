/**
 * Import configuration — the single file you edit to choose YOUR parts.
 *
 * Change a URL, add a state, flip a field to `false`, and the importer obeys.
 * `fields` decides which pieces of each listing get copied onto your board.
 */

/**
 * How the board addresses page 2, 3, 4…
 *  - "path-indexed": /jobs/lastweek/ is page 1, /jobs/lastweek/1/ is page 2, /2/ is page 3
 *  - "query":        ?page=N
 *  - "none":         single page only
 */
export type PaginationStyle = "path-indexed" | "query" | "none";

export interface ImportSource {
  /** Human label used in logs. */
  name: string;
  /** A listing page on the source board: any /jobs/, /industry/, /field/ or /location/ page. */
  url: string;
  /** Your category for this source, one of CATEGORIES — or "auto" to classify each listing. */
  category: string;
  /** Defaults to "path-indexed". */
  pagination?: PaginationStyle;
}

export interface ImportFields {
  title: boolean;
  company: boolean;
  location: boolean;
  salary: boolean;
  description: boolean;
  requirements: boolean;
  deadline: boolean;
  /** Reserved and ignored: listings never link out. Kept so old configs keep compiling. */
  applyUrl: boolean;
}

/**
 * A one-off widening of the window: the archive listing (/alljobs/) runs
 * newest-first over every active advert, so paging it until the dates fall
 * outside `windowDays` pulls in exactly the extra days and stops.
 *
 * Kept separate from `sources` on purpose: a backfill run has its own cursor,
 * so it can never move the cursor the daily sweep depends on.
 */
export interface BackfillConfig {
  url: string;
  pagination: PaginationStyle;
  /** Stop once listings are older than this. 15 = last two weeks plus today. */
  windowDays: number;
  /** Listing pages read per backfill invocation. */
  pagesPerRun: number;
  /** Hard stop, so a bad date parse cannot sweep the whole archive. */
  maxPages: number;
}

export interface ImportConfig {
  enabled: boolean;
  /** Hard ceiling per run. New jobs only — already-imported ones are skipped. */
  maxJobsPerRun: number;
  /** true = listings go live immediately. false = saved as "draft" for review. */
  publishImmediately: boolean;
  /** A previously-imported job not seen on the source for this many days is unpublished. */
  expireAfterDays: number;
  /** Polite pause between requests, in milliseconds. */
  requestDelayMs: number;
  /**
   * Pages swept per invocation, not per day. Around 50 jobs per page, so 12
   * pages is roughly 600 listings per run. The run resumes from a stored cursor,
   * which is what makes a 5000/day target possible across several short runs.
   */
  pagesPerRun: number;
  /** Upper bound for a full sweep before the cursor wraps back to page 1. */
  maxPagesPerSource: number;
  /**
   * Stop starting new work after this many milliseconds and return cleanly.
   * Vercel kills a function at its maxDuration, which would lose the whole run;
   * stopping early means the next run simply resumes, because listings already
   * stored are skipped.
   */
  timeBudgetMs: number;
  /** Rows per INSERT statement. 5000 jobs one-at-a-time would exceed any timeout. */
  insertBatchSize: number;
  /**
   * "auto" uses the summary printed on the listing page when it is detailed
   * enough, and only fetches the job page when it is not.
   * "always" fetches every job page individually.
   *
   * The listing-page summary is a two-line teaser, and the aggregate posts carry
   * no summary worth having at all. The full copy — and the links to each
   * individual role inside a multi-position advert — only exist on the job page,
   * so "always" is what makes real descriptions possible.
   */
  detailPage: "auto" | "always";
  /** Also read the source's RSS feed, newest first. */
  useRssFeed: boolean;
  /**
   * An advert like "… Job Recruitment (73 Positions)" links to 73 separate
   * listings. Expanding them gives 73 real vacancies instead of one unreadable
   * card, but each child costs one request, so cap the fan-out per advert.
   */
  maxChildrenPerPost: number;
  sources: ImportSource[];
  /** The archive window used by `?backfill=N` runs. Never part of the daily sweep. */
  backfill: BackfillConfig;
  filters: {
    /** Empty array = every state. Otherwise only these (must match NIGERIAN_STATES). */
    states: string[];
    /** Empty array = every category. Otherwise only these. */
    categories: string[];
    /** A listing must contain at least one of these (empty = no requirement). Case-insensitive. */
    includeKeywords: string[];
    /** Drop a listing if it contains any of these. Case-insensitive. */
    excludeKeywords: string[];
    /** Drop listings whose advertised maximum is below this. 0 = no floor. */
    minSalary: number;
  };
  fields: ImportFields;
}

export const IMPORT_CONFIG: ImportConfig = {
  enabled: true,

  // 5000/day ceiling. The board's last-week window holds ~4000, so in practice
  // a full run takes everything available and stops.
  maxJobsPerRun: 5000,

  publishImmediately: true,
  expireAfterDays: 21,
  requestDelayMs: 200,
  /**
   * 13 pages ≈ 650 listings per invocation. Eight daily triggers (vercel.json)
   * give ~104 pages / ~5,200 listings a day, clearing the 5000 target while
   * keeping every individual run short enough to be safe on any plan.
   */
  pagesPerRun: 13,
  /** ~110 pages covers the whole last-week window before wrapping to page 1. */
  maxPagesPerSource: 110,
  // Safely under the 300s function limit on both Hobby and Pro.
  timeBudgetMs: 240_000,
  insertBatchSize: 250,
  detailPage: "always",
  // The feed carries the newest items with their true publication date and a
  // summary, and covers the gap between sweeps.
  useRssFeed: true,
  maxChildrenPerPost: 15,

  /**
   * Everything posted in the last week — about 4,000 listings, newest first,
   * roughly 50 per page. Categories are assigned per listing automatically.
   *
   * Other slices you can use instead:
   *   /jobs/today/    today only          /jobs/1day/     yesterday
   *   /jobs/2days/    Friday's jobs       /jobs/lastweek/ the last seven days
   *   /industry/119/  Computer and AI     /industry/105/  Banking & Finance
   *   /location/901/  Abuja (FCT)         /location/902/  Lagos
   */
  sources: [
    {
      name: "Last week",
      url: "https://www.hotnigerianjobs.com/jobs/lastweek/",
      category: "auto",
      pagination: "path-indexed",
    },
  ],

  backfill: {
    url: "https://www.hotnigerianjobs.com/alljobs/0/",
    pagination: "path-indexed",
    windowDays: 15,
    pagesPerRun: 16,
    /** ~50 listings a page: 260 pages is 13,000 listings, well past the window. */
    maxPages: 260,
  },

  filters: {
    states: [], // e.g. ["Lagos", "FCT Abuja"] to restrict by location
    categories: [], // e.g. ["Technology"] to restrict by category
    includeKeywords: [], // e.g. ["engineer", "developer", "analyst"]
    excludeKeywords: ["driver", "cleaner", "security guard"], // keep the board focused
    minSalary: 0,
  },

  // Which parts of each listing to copy. Set false for anything you do not want.
  fields: {
    title: true,
    company: true,
    location: true,
    salary: true,
    description: true,
    requirements: true,
    deadline: true,
    applyUrl: false,
  },
};

/**
 * Upstream feed details. This is the only place the source is named, because it is
 * the address the importer fetches from — not something the site ever displays.
 * `key` is a neutral internal id used for dedupe; it is never shown to visitors.
 */
export const SOURCE_FEED = {
  key: "feed",
  baseUrl: "https://www.hotnigerianjobs.com",
  rss: "https://www.hotnigerianjobs.com/feed/rss.xml",
  /**
   * Brand strings scrubbed out of imported titles, so the source's name never
   * appears in a heading, page title, meta description or search result.
   */
  stripFromTitles: ["HotNigerianJobs", "Hot Nigerian Jobs", "HNJ Exclusive", "HNJ"],
};
