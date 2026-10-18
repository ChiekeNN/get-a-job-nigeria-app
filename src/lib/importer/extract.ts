/**
 * Extraction helpers for the source job board.
 *
 * Deliberately structural rather than selector-based: we work from <a href> job
 * links, JSON-LD, meta tags and sentence patterns the board uses in its own
 * copy. Class names change on redesign; URL shapes and sentences do not.
 */

import { SOURCE_FEED } from "@/lib/importer/config";

export interface RawListing {
  sourceId: string;
  url: string;
  title: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "\u2019",
  lsquo: "\u2018",
  ldquo: "\u201c",
  rdquo: "\u201d",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  pound: "\u00a3",
  naira: "\u20a6",
};

export function decodeEntities(value: string): string {
  const pass = (input: string) =>
    input
      .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
        String.fromCodePoint(Number.parseInt(code, 16)),
      )
      .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match);

  // Some listings arrive double-encoded ("&amp;amp;"). Decode until stable, but
  // never more than twice, so escaped markup cannot become live tags.
  let output = pass(value);
  const onceMore = pass(output);
  if (onceMore !== output) output = onceMore;
  return output;
}

export function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(?:br|hr)\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|li|h[1-6]|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function stripTagsFlat(html: string): string {
  return stripTags(html).replace(/\s+/g, " ").trim();
}

/** Pull every listing link on a page, in document order. Host-agnostic by design. */
export function extractJobLinks(html: string, baseUrl: string = SOURCE_FEED.baseUrl): RawListing[] {
  const seen = new Set<string>();
  const listings: RawListing[] = [];
  const anchor = /<a\b[^>]*href=["']((?:https?:\/\/[^"']+)?\/hotjobs\/(\d+)\/[^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = anchor.exec(html)) !== null) {
    const [, href, id, inner] = match;
    if (seen.has(id)) continue;

    const title = stripTagsFlat(inner)
      .replace(/^\d+\.\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!title || title.length < 3) continue;

    seen.add(id);
    listings.push({
      sourceId: id,
      url: new URL(href, baseUrl).toString(),
      title,
    });
  }

  return listings;
}


export interface ListingCard extends RawListing {
  /** Summary printed on the listing page (location, salary, requirements). */
  summary: string;
  /** "Fri 09th Oct, 2026" style date, verbatim. */
  postedText: string;
}

/**
 * Parse whole listing cards from a category page.
 *
 * The board prints, under each job title: the posting date, a summary that
 * usually carries the location, salary and qualification, and an "Apply Now"
 * link. Reading those means one request per 50 jobs instead of 50 requests.
 */
export function extractListingCards(
  html: string,
  baseUrl: string = SOURCE_FEED.baseUrl,
): ListingCard[] {
  const anchorRe = /<a\b[^>]*href=["']((?:https?:\/\/[^"']+)?\/hotjobs\/(\d+)\/[^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;

  // Record every job anchor with its position so we can slice the text between them.
  const anchors: Array<{ id: string; url: string; title: string; start: number; end: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = anchorRe.exec(html)) !== null) {
    const [, href, id, inner] = match;
    const title = stripTagsFlat(inner)
      .replace(/^\d+\.\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!title || title.length < 3) continue;

    // "(0 comments)" is also a link to the same listing. Counting it as an
    // anchor truncates the card at the comment link, which throws away the
    // summary and leaves the description reading "Posted on ... ---".
    if (/^\(?\s*\d+\s*comments?\s*\)?$/i.test(title)) continue;

    anchors.push({
      id,
      url: new URL(href, baseUrl).toString(),
      title,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  const seen = new Set<string>();
  const cards: ListingCard[] = [];

  anchors.forEach((anchor, index) => {
    if (seen.has(anchor.id)) return;
    seen.add(anchor.id);

    // Text after this anchor, up to the next job anchor, is this listing's card.
    const next = anchors[index + 1];
    const segmentHtml = html.slice(anchor.end, next ? next.start : anchor.end + 1500);
    const segment = stripTagsFlat(segmentHtml);

    const postedText =
      /Posted on\s+([A-Za-z]{3}\s+\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3},?\s*\d{4})/i.exec(segment)?.[1] ?? "";

    const summary = segment
      .replace(/^Posted on[\s\S]*?\(\d+\s+comments?\)\s*/i, "")
      .replace(/^Posted on[^-]*-\s*hotnigerianjobs\.com[\s\S]*?\d+\s+comments?\)\s*/i, "")
      // A card whose comment link sat inside this segment leaves only the
      // publication line behind; drop it rather than shipping it as a summary.
      .replace(/^Posted on[\s\S]{0,160}$/i, "")
      .replace(/Apply Now[\s\S]*$/i, "")
      .trim();

    cards.push({
      sourceId: anchor.id,
      url: anchor.url,
      title: anchor.title,
      summary,
      postedText,
    });
  });

  return cards;
}

function readJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const script = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = script.exec(html)) !== null) {
    const raw = decodeEntities(match[1].trim());
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Malformed JSON-LD is common; ignore and fall through to other strategies.
    }
  }

  return blocks;
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

/** Find a JobPosting node anywhere in the page's JSON-LD (handles arrays and @graph). */
export function extractJobPosting(html: string): JsonObject | null {
  const queue = [...readJsonLdBlocks(html)];

  while (queue.length > 0) {
    const node = queue.shift();
    if (Array.isArray(node)) {
      queue.push(...node);
      continue;
    }
    if (!isObject(node)) continue;

    const type = node["@type"];
    if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) {
      return node;
    }
    if (node["@graph"]) queue.push(node["@graph"]);
  }

  return null;
}

export function readMeta(html: string, property: string): string {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) return decodeEntities(match[1]).trim();
  }
  return "";
}

export function readTitleTag(html: string): string {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? stripTagsFlat(match[1]) : "";
}

export function readHeading(html: string): string {
  const match = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  return match ? stripTagsFlat(match[1]) : "";
}

/** Sentence-style fields the board uses consistently in its own listing copy. */
export function findFirst(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    const value = match?.[1]?.trim();
    if (value) return value.replace(/\s+/g, " ");
  }
  return "";
}

export const LOCATION_PATTERNS: RegExp[] = [
  /the position is located in\s+([^.\n]{2,80})/i,
  /position is located in\s+([^.\n]{2,80})/i,
  /location\s*:\s*([^.\n]{2,80})/i,
  /located in\s+([^.\n]{2,80})/i,
];

export const SALARY_PATTERNS: RegExp[] = [
  /salary\s*:\s*((?:n|₦|ngn)?\s?[\d,]{4,}(?:\s*(?:-|–|—|to)\s*(?:n|₦|ngn)?\s?[\d,]{4,})?[^.\n]{0,30})/i,
  /remuneration\s*:\s*((?:n|₦|ngn)?\s?[\d,]{4,}(?:\s*(?:-|–|—|to)\s*(?:n|₦|ngn)?\s?[\d,]{4,})?[^.\n]{0,30})/i,
  // "Salary N500,000 monthly" and "Remuneration is N250,000" — no colon, which
  // is how most Nigerian adverts phrase it. The currency prefix is required so
  // a bare number elsewhere in the sentence cannot be mistaken for pay.
  /(?:salary|remuneration|pay)\s*(?:of|is|:)?\s*((?:n|₦|ngn)\s?[\d,]{4,}(?:\s*(?:-|–|—|to)\s*(?:n|₦|ngn)?\s?[\d,]{4,})?[^.\n]{0,30})/i,
];

export const REQUIREMENT_MARKERS: RegExp[] = [
  /interested candidates should possess([\s\S]*?)(?:how to apply|method of application|application closing date|deadline|apply now|$)/i,
  /(?:requirements|qualifications|requirement)\s*:?\s*([\s\S]*?)(?:how to apply|method of application|application closing date|deadline|responsibilities|$)/i,
];

export const DEADLINE_PATTERNS: RegExp[] = [
  /(?:application closing date|closing date|deadline)\s*:?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s*\d{4})/i,
  /(?:application closing date|closing date|deadline)\s*:?\s*(\d{4}-\d{2}-\d{2})/i,
  /(?:application closing date|closing date|deadline)\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
];

export const DESCRIPTION_END_MARKERS =
  /(how to apply|method of application|application closing date|deadline|interested candidates should possess)/i;

/** Carve the main description out of the page text without relying on markup. */
export function extractDescriptionText(text: string): string {
  const startMarkers = [
    /job description\s*:?\s*/i,
    /about (?:the )?(?:job|role|position)\s*:?\s*/i,
    /job summary\s*:?\s*/i,
  ];

  let body = "";
  for (const marker of startMarkers) {
    const match = marker.exec(text);
    if (match) {
      body = text.slice(match.index + match[0].length);
      break;
    }
  }

  if (!body) {
    // Fall back to the first paragraph that reads like a job summary.
    const summary = /([A-Z][^.\n]{3,120}\s+is (?:recruiting|currently recruiting|seeking|looking)[\s\S]*)/.exec(text);
    // Never return the whole page: it is mostly navigation and footer, and using
    // it gives every listing the same description and poisons category, location
    // and job-type detection. An empty result tells the caller to use the card
    // summary instead.
    body = summary ? summary[1] : "";
  }

  const end = DESCRIPTION_END_MARKERS.exec(body);
  if (end && end.index > 120) body = body.slice(0, end.index);

  return body.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 6000);
}

export function splitSentences(value: string, limit = 10): string[] {
  return value
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.replace(/^[-•*\u2022]\s*/, "").trim())
    .filter((item) => item.length > 12)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Article body                                                        */
/* ------------------------------------------------------------------ */

/**
 * The publication line printed under the headline: "Posted on Thu 15th Oct, 2026".
 * This is the only trustworthy source for `datePosted`, because it is the date
 * the listing first appeared upstream. Falling back to `new Date()` stamps every
 * card "Just now", which is both wrong and a Google for Jobs violation.
 */
export const POSTED_PATTERNS: RegExp[] = [
  /Posted on\s+([A-Za-z]{3,9}\.?\s+\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s*\d{4})/i,
  /Published(?:\s+on)?\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})/i,
];

/** Where the listing's own copy stops and the page's furniture begins. */
const ARTICLE_END =
  /(Application Closing Date|Method of Application|How to Apply|Share this job|Related Jobs|Similar Jobs)/i;

/**
 * Cut the article out of the page.
 *
 * These pages are 90% navigation: a role directory, state lists, footer links.
 * Reading `stripTags(wholePage)` therefore produces a wall of link text, which
 * is why descriptions came out empty (the extractor refused the blobby page
 * text) and why location detection kept landing on the wrong state. The article
 * is the part between the headline and the closing-date block, so anchor to
 * those two markers instead of guessing from sentences.
 */
export function extractArticleHtml(html: string): string {
  const start = /<h1\b[^>]*>/i.exec(html);
  if (!start) return "";

  const rest = html.slice(start.index);
  const end = rest.search(ARTICLE_END);
  return end > 120 ? rest.slice(0, end) : rest.slice(0, 20_000);
}

/**
 * Strip the "Posted on … (0 comments)" line so what remains is the job copy.
 */
export function extractArticleDescription(articleText: string): string {
  let body = articleText;

  const afterPosted = /Posted on[\s\S]{0,160}?comments?\)\s*/i.exec(body);
  if (afterPosted) {
    body = body.slice(afterPosted.index + afterPosted[0].length);
  } else {
    // No comment count (or a different template): drop just the line itself.
    body = body.replace(/^[\s\S]*?Posted on[^\n]*\n/i, "");
  }

  const end = /(Apply Now|Application Closing Date|Share this job|Click here to see more)/i.exec(body);
  if (end && end.index > 80) body = body.slice(0, end.index);

  return body.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 6000);
}

/* ------------------------------------------------------------------ */
/* Aggregate posts ("Company Recruitment (N Positions)")                */
/* ------------------------------------------------------------------ */

export interface ChildListing {
  sourceId: string;
  url: string;
  /** The role named next to the link, e.g. "Computer Studies Teacher". */
  title: string;
  /** The "Location: Osun" line printed beside the role. */
  locationText: string;
}

/**
 * Pull the individual roles out of an aggregate post.
 *
 * An advertisement like "YGF Academy Job Recruitment (5 Positions)" is not one
 * vacancy — it is a container linking to five separate listings, each with its
 * own page, title, description and location:
 *
 *   1.) Computer Studies Teacher
 *   Location: Osun
 *   [Click Here To View Details] -> /hotjobs/975527/computer-studies-teacher-…
 *
 * Importing the container gives one useless card called "YGF Academy Job
 * Recruitment" that no industry rule can classify and no job seeker can read.
 * Importing the children gives five real, correctly classified vacancies.
 */
export function extractChildListings(
  articleHtml: string,
  baseUrl: string = SOURCE_FEED.baseUrl,
): ChildListing[] {
  const anchorRe =
    /<a\b[^>]*href=["']((?:https?:\/\/[^"']+)?\/hotjobs\/(\d+)\/[^"']*?\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;

  const children: ChildListing[] = [];
  const seen = new Set<string>();
  let lastEnd = 0;
  let match: RegExpExecArray | null;

  while ((match = anchorRe.exec(articleHtml)) !== null) {
    const [, href, id, inner] = match;
    if (!/view\s+details?/i.test(stripTagsFlat(inner))) continue;
    if (seen.has(id)) continue;

    const before = stripTags(articleHtml.slice(lastEnd, match.index));
    lastEnd = match.index + match[0].length;

    // Everything after the last "1.)" marker is this role's block.
    const roleBlock = before.split(/\d+\s*\.\s*\)/).pop() ?? before;

    const locationText = /Location\s*:\s*([^\n]{2,60})/i.exec(roleBlock)?.[1]?.trim() ?? "";

    const title = roleBlock
      .replace(/Location\s*:[\s\S]*$/i, "")
      .replace(/\s+/g, " ")
      .replace(/[\s\-–—:|]+$/, "")
      .trim();

    // Guard rails: a real role name, not leftover prose or a stray marker.
    if (title.length < 3 || title.length > 140) continue;
    if (!/[A-Za-z]{2}/.test(title)) continue;
    if (/positions?\s+below|click here|view details/i.test(title)) continue;

    seen.add(id);
    children.push({
      sourceId: id,
      url: new URL(href, baseUrl).toString(),
      title,
      locationText,
    });
  }

  return children;
}
