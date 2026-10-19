/**
 * Pure sweep arithmetic: how a listing's pages are addressed, where the cursor
 * moves next, and whether a card printed date falls inside a backfill window.
 *
 * Deliberately dependency-free so it can be exercised directly by the smoke
 * script (the importer itself needs the database and the network).
 */

/**
 * How the board addresses page 2, 3, 4…
 *  - "path-indexed": /jobs/lastweek/ is page 1, /jobs/lastweek/1/ is page 2
 *  - "path-zero":    /alljobs/ is page 1, /alljobs/1/ is page 2 (the archive)
 *  - "query":        ?page=N
 *  - "none":         single page only
 */
export function pageUrl(
  source: { url: string; pagination?: string },
  page: number,
): string | null {
  const style = source.pagination ?? "path-indexed";
  if (style === "none") return page === 1 ? source.url : null;

  const base = source.url.replace(/\/$/, "");
  if (style === "query") return page === 1 ? source.url : `${base}/?page=${page}`;
  // The archive numbers its pages from zero: /alljobs/0/ is the first page.
  if (style === "path-zero") return `${base}/${page - 1}/`;
  if (page === 1) return source.url;
  // The weekly listing is 1-indexed oddly: /jobs/lastweek/ is page 1, /1/ is page 2.
  return `${base}/${page - 1}/`;
}

/**
 * Where the next run should start.
 *  - ran off the end of the listing (empty page)  -> restart at page 1
 *  - passed the sweep cap                          -> restart at page 1
 *  - otherwise                                     -> carry on from here
 */
export function advanceCursor(
  start: number,
  pagesRead: number,
  hitEmpty: boolean,
  sweepCap: number,
): number {
  if (hitEmpty) return 1;
  const next = start + pagesRead;
  return next > sweepCap ? 1 : next;
}

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

function monthIndex(word: string): number {
  return MONTHS.indexOf(word.slice(0, 3).toLowerCase());
}

/**
 * Reads the date printed under a listing card:
 *   "Posted on Fri 16th Oct, 2026 - hotnigerianjobs.com"
 * The card text carries a domain and a comment count after the date, so the
 * date is matched inside the string rather than parsed as a whole — otherwise
 * every parse fails and the window silently keeps everything.
 *
 * Returns null when nothing usable is there, so callers can fail open instead
 * of dropping a page they could not understand.
 */
export function parseListingDate(text: string, now = Date.now()): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  // "16th Oct 2026" / "16 October, 2026"
  let match: RegExpMatchArray | null =
    /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})/.exec(lower);
  if (match) {
    const month = monthIndex(match[2]);
    if (month >= 0) return clampDate(Date.UTC(Number(match[3]), month, Number(match[1])), now);
  }

  // "Oct 16, 2026" / "October 16th 2026"
  match = /([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/.exec(lower);
  if (match) {
    const month = monthIndex(match[1]);
    if (month >= 0) return clampDate(Date.UTC(Number(match[3]), month, Number(match[2])), now);
  }

  // "2026-10-16" — RSS and JSON dates
  match = /(\d{4})-(\d{2})-(\d{2})/.exec(lower);
  if (match) {
    return clampDate(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])), now);
  }

  return null;
}

/** A "date" in the future or before the web existed is a parse failure, not data. */
function clampDate(ms: number, now: number): number | null {
  if (Number.isNaN(ms)) return null;
  if (ms > now + 2 * 86_400_000) return null;
  if (ms < Date.UTC(2000, 0, 1)) return null;
  return ms;
}

/**
 * Backfill window test.
 *
 * The archive runs newest-first, so this is used twice: to drop individual old
 * cards, and to detect that a whole page is past the window (the end).
 * An unreadable date counts as inside — one odd card must not end the sweep.
 */
export function isWithinWindow(postedText: string, windowDays: number, now = Date.now()): boolean {
  const parsed = parseListingDate(postedText, now);
  if (parsed === null) return true;
  return parsed >= now - windowDays * 86_400_000;
}
