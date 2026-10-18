/**
 * Import configuration — the single file you edit to choose YOUR parts.
 *
 * Nothing here is code you need to understand deeply. Change a URL, add a state,
 * flip a field to `false`, and the importer obeys. `fields` is the part that
 * decides which pieces of each listing get copied onto your board.
 */

export interface ImportSource {
  /** Human label used in logs. */
  name: string;
  /** A listing page on the source board. Any /industry/, /field/, /location/ or /alljobs/ page. */
  url: string;
  /** Your category to file everything from this source under. Must be one of CATEGORIES. */
  category: string;
}

export interface ImportFields {
  title: boolean;
  company: boolean;
  location: boolean;
  salary: boolean;
  description: boolean;
  requirements: boolean;
  deadline: boolean;
  /** Keep the link back to the original listing. Recommended: it is what makes this attribution, not copying. */
  applyUrl: boolean;
}

export interface ImportConfig {
  enabled: boolean;
  /** Hard ceiling per run. New jobs only — already-imported ones are skipped. */
  maxJobsPerRun: number;
  /** true = listings go live immediately. false = saved as "draft" for review. */
  publishImmediately: boolean;
  /** A previously-imported job not seen on the source for this many days is unpublished. */
  expireAfterDays: number;
  /** Polite pause between detail-page requests, in milliseconds. */
  requestDelayMs: number;
  /** How many pages of each listing to walk (50 jobs per page). */
  maxPagesPerSource: number;
  /** Also read the source's RSS feed, newest first. */
  useRssFeed: boolean;
  sources: ImportSource[];
  filters: {
    /** Empty array = every state. Otherwise only these (must match NIGERIAN_STATES). */
    states: string[];
    /** Empty array = every category. Otherwise only sources filed under these. */
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

  // 100/day ceiling. If the source only publishes 30 matching jobs, you get 30.
  maxJobsPerRun: 100,

  publishImmediately: true,
  expireAfterDays: 21,
  requestDelayMs: 350,
  maxPagesPerSource: 1,
  useRssFeed: true,

  /**
   * Pick the parts of the board you want.
   * Each URL is a slice of the source. Delete what you do not want.
   *   /industry/119/ Computer and AI        /industry/105/ Banking & Finance
   *   /industry/128/ Oil and Gas            /industry/118/ Medical
   *   /industry/135/ Telecommunication      /field/233/    Human Resources
   *   /location/901/ Abuja (FCT)            /location/902/ Lagos
   *   /alljobs/0/    everything, paginated
   */
  sources: [
    { name: "Computer and AI", url: "https://www.hotnigerianjobs.com/industry/119/", category: "Technology" },
    { name: "Banking and Finance", url: "https://www.hotnigerianjobs.com/industry/105/", category: "Banking & Finance" },
    { name: "Oil and Gas", url: "https://www.hotnigerianjobs.com/industry/128/", category: "Oil & Gas" },
    { name: "Medical", url: "https://www.hotnigerianjobs.com/industry/118/", category: "Healthcare" },
    { name: "Customer Service", url: "https://www.hotnigerianjobs.com/field/215/", category: "Customer Service" },
    { name: "Engineering", url: "https://www.hotnigerianjobs.com/industry/112/", category: "Engineering" },
  ],

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
    applyUrl: true,
  },
};

export const SOURCE_BOARD = {
  name: "HotNigerianJobs",
  homepage: "https://www.hotnigerianjobs.com/",
  rss: "https://www.hotnigerianjobs.com/feed/rss.xml",
  key: "hotnigerianjobs",
};
