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
 *  - "query":        ?page=N
 *  - "none":         single page only
 */
export function pageUrl(
  source: { url: string; pagination?: string },
  page: number,
): string | null {
  const style = source.pagination ?? "path-indexed";
  if (page === 1) return source.url;
  if (style === "none") return null;

  const base = source.url.replace(/\/$/, "");
  if (style === "query") return `${base}/?page=${page}`;

  // The board is 1-indexed oddly: /jobs/lastweek/ is page 1, /jobs/lastweek/1/ is page 2.
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

/**
 * Reads the date printed under a listing card:
 *   "Posted on Fri 16th Oct, 2026"
 * Returns null when nothing usable is there, so callers can fail open instead
 * of dropping a page they could not understand.
 */
export function parseListingDate(text: string, now = Date.now()): number | null {
  if (!text) return null;

  const cleaned = text
    .replace(/^.*?\b(?:posted|updated)\b[^0-9a-z]*/i, "")
    .replace(/(\d)(st|nd|rd|th)/i, "$1")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const parsed = new Date(cleaned).getTime();
  if (Number.isNaN(parsed)) return null;

  // A "date" in the future or before the web existed is a parse failure, not data.
  if (parsed > now + 2 * 86_400_000) return null;
  if (parsed < Date.UTC(2000, 0, 1)) return null;

  return parsed;
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
