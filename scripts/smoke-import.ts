/**
 * Offline smoke test for the importer's pure logic.
 * Run: npx tsx scripts/smoke-import.ts
 *
 * Uses fixtures in the source board's own phrasing, so it runs without network
 * access and catches parser regressions before a real import.
 */
import {
  decodeEntities,
  extractDescriptionText,
  extractJobLinks,
  extractListingCards,
  findFirst,
  splitSentences,
  DEADLINE_PATTERNS,
  LOCATION_PATTERNS,
  REQUIREMENT_MARKERS,
  SALARY_PATTERNS,
  stripTags,
} from "../src/lib/importer/extract";
import { classifyListing, detectJobType, detectState, deriveCity, parseSalary, stripBrand, scrubText, cleanJobTitle, detectCategory, parsePostedDate } from "../src/lib/importer/normalize";
import { SOURCE_FEED } from "../src/lib/importer/config";
import { CATEGORIES } from "../src/types";
import { advanceCursor, pageUrl } from "../src/lib/importer/run";
import { IMPORT_CONFIG } from "../src/lib/importer/config";

const brand = SOURCE_FEED.stripFromTitles[0];

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n      got=${JSON.stringify(actual)}\n      want=${JSON.stringify(expected)}`}`);
}

const listingHtml = `
<div class="jobs">
  <a href="/hotjobs/975604/internal-auditor-at-domeo-resources-international.html">Internal Auditor at Domeo Resources International</a>
  <a href="/hotjobs/975599/construction-manager-at-peoplevantage-consul.html">Construction Manager at Peoplevantage Consulting Limited</a>
  <a href="/hotjobs/975604/internal-auditor-at-domeo-resources-international.html">Duplicate link</a>
</div>`;

const links = extractJobLinks(listingHtml);
check("listing links parsed", links.length, 2);
check("dedupes same job id", links[0].sourceId, "975604");
check("resolves relative url", links[0].url, `${SOURCE_FEED.baseUrl}/hotjobs/975604/internal-auditor-at-domeo-resources-international.html`);
check("strips source brand from title", stripBrand(`Internal Auditor | ${brand}`), "Internal Auditor");

const detailHtml = `
<html><head><title>Internal Auditor at Domeo Resources International | ${brand}</title></head>
<body>
<h1>Internal Auditor at Domeo Resources International</h1>
<p>Domeo Resources International is recruiting to fill the position of: Internal Auditor. The position is located in Aba, Abia State. Salary: N400,000 - N600,000 / month.</p>
<h2>Requirements</h2>
<p>Interested candidates should possess a BSc/HND in Accounting, Finance, Economics. Professional qualification such as ICAN or ACCA is an advantage.</p>
<h2>How to Apply</h2>
<p>Send your CV to jobs@example.com</p>
<p>Application Closing Date: 30 November 2026</p>
</body></html>`;

const text = stripTags(detailHtml);
check("location extracted", findFirst(text, LOCATION_PATTERNS), "Aba, Abia State");
check("salary text extracted", findFirst(text, SALARY_PATTERNS), "N400,000 - N600,000 / month");
check("salary range", parseSalary(findFirst(text, SALARY_PATTERNS)), { min: 400000, max: 600000 });
check("deadline", findFirst(text, DEADLINE_PATTERNS), "30 November 2026");
check("state from location", detectState("Aba, Abia State"), "Abia");
check("abuja alias", detectState("Abuja (FCT)"), "FCT Abuja");
check("city derivation", deriveCity("Uyo, Akwa Ibom State", "Akwa Ibom"), "Uyo");
check("job type remote", detectJobType("Product Designer (Remote)"), "Remote");
check("job type graduate", detectJobType("Graduate Trainee Programme"), "Graduate Trainee");

const reqBlock = findFirst(text, REQUIREMENT_MARKERS);
check("requirements split", splitSentences(reqBlock).length >= 1, true);
check("description has summary", extractDescriptionText(text).length > 40, true);

// Nothing from the upstream board may survive into a listing.
const host = new URL(SOURCE_FEED.baseUrl).hostname;
check("brand removed from title", stripBrand(`Internal Auditor | ${brand}`), "Internal Auditor");
check("brand removed mid-title", stripBrand(`${brand} - Internal Auditor`), "Internal Auditor");
check("url removed from description", scrubText(`Apply via https://${host}/hotjobs/123/a.html now`), "Apply via now");
check("bare domain removed", scrubText(`See ${host} for more`), "See for more");
check("brand removed from body", scrubText(`Send CV to jobs@example.com. Source: ${brand}`), "Send CV to jobs@example.com. Source:");
check("clean text untouched", scrubText("A normal description"), "A normal description");
check("recruitment suffix stripped", cleanJobTitle(`Acme Ltd Job Recruitment (3 Positions) | ${brand}`), "Acme Ltd Recruitment");


// ---- category-page cards (the "last week" listing format) ----
const categoryPage = `
<h1>4040 Jobs Listed Last Week - pg 1</h1>
<h1><a href="/hotjobs/975604/internal-auditor-at-domeo.html" title="Permanent Link">Internal Auditor at Domeo Resources International</a></h1>
Posted on Fri 09th Oct, 2026 - hotnigerianjobs.com --- (0 comments)
<p>Domeo Resources International is recruiting to fill the position of: Internal Auditor. The position is located in Aba, Abia State. Salary: N400,000 - N600,000 / month. Interested candidates should possess a BSc/HND in Accounting.</p>
<a href="/hotjobs/975604/internal-auditor-at-domeo.html">Apply Now</a>
<h1><a href="/hotjobs/975610/senior-meal-officer.html" title="Permanent Link">Senior MEAL and Innovation Officer at Lindii Peace Foundation</a></h1>
Posted on Fri 09th Oct, 2026 - hotnigerianjobs.com --- (1 comments)
<p>Lindii Peace Foundation is recruiting to fill the position of: Senior MEAL and Innovation Officer. The position is located in Maiduguri, Borno State. Interested candidates should possess a Bachelor's Degree with a minimum of three years experience.</p>
<a href="/hotjobs/975610/senior-meal-officer.html">Apply Now</a>
`;

const cards = extractListingCards(categoryPage);
check("cards parsed from category page", cards.length, 2);
check("card id", cards[0].sourceId, "975604");
check("card posted date", cards[0].postedText, "Fri 09th Oct, 2026");
check("card summary has location", cards[0].summary.includes("Aba, Abia State"), true);
check("card summary has salary", cards[0].summary.includes("N400,000 - N600,000"), true);
check("summary has no comment noise", /comments/.test(cards[0].summary), false);
check("summary has no Apply Now", /Apply Now/.test(cards[0].summary), false);
check("posted date parsed", parsePostedDate("Fri 09th Oct, 2026").getFullYear(), 2026);

// ---- auto categorisation for the firehose ----
check("category: auditor", detectCategory("Internal Auditor at Domeo"), "Banking & Finance");
check("category: frontend", detectCategory("Senior Frontend Engineer at Paystack"), "Technology & IT");
check("category: backend", detectCategory("Backend Software Engineer at Paystack"), "Technology & IT");
check("category: business dev", detectCategory("Business Development Officer"), "Sales & Marketing");
check("category: nurse", detectCategory("Registered Nurse at Lagoon Hospital"), "Healthcare");
check("category: teacher", detectCategory("Mathematics Teacher at YGF Academy"), "Education & Teaching");
check("category: hse", detectCategory("HSE Officer (Upstream Operations)"), "Oil, Gas & Energy");
check("category: sparky", detectCategory("Electrical Technician"), "Engineering");
check("category: unknown falls back", detectCategory("Something Unclassifiable"), "General Vacancies");
check("category: sales", detectCategory("Sales Manager - Generator at P.Petrop"), "Sales & Marketing");
check("category: oracle", detectCategory("Oracle Database Administrator"), "Technology & IT");
check("category: php", detectCategory("PHP / MySQL Developer"), "Technology & IT");
check("category: networking", detectCategory("Network Administrator"), "Technology & IT");
check("category: it security beats security", detectCategory("IT Security Officer"), "Technology & IT");
check("category: guard stays security", detectCategory("Security Guard"), "Security & Defence");
check("category: nurse is not nursery", detectCategory("Nursery Teacher"), "Education & Teaching");
check("category: driver", detectCategory("Dispatch Rider"), "Logistics & Transport");
check("category: hr", detectCategory("Human Resource Officer"), "Human Resources");
check("category: legal", detectCategory("Legal Officer"), "Legal & Compliance");
check("category: agregate uses density", classifyListing("Workforce Group Recruitment", "recruiting 1.) Nurse 2.) Nurse 3.) Driver"), "Healthcare");
check("category: title beats body", classifyListing("Registered Nurse", "we also need drivers and accountants"), "Healthcare");

// Every detected category must exist in the taxonomy the filters and forms use.
for (const sample of [
  "Registered Nurse",
  "Senior Frontend Engineer",
  "Sales Manager",
  "HSE Officer",
  "Internal Auditor",
  "Dispatch Rider",
  "Oracle DBA",
  "Hotel Manager",
  "Chef",
  "Mathematics Teacher",
  "Something Unclassifiable",
]) {
  check(`category in taxonomy: ${sample}`, CATEGORIES.includes(detectCategory(sample) as (typeof CATEGORIES)[number]), true);
}

// ---- paging: the board is 1-indexed oddly ----
const lastweek = { url: "https://www.hotnigerianjobs.com/jobs/lastweek/", pagination: "path-indexed" };
check("page 1 is the bare URL", pageUrl(lastweek, 1), "https://www.hotnigerianjobs.com/jobs/lastweek/");
check("page 2 is /1/", pageUrl(lastweek, 2), "https://www.hotnigerianjobs.com/jobs/lastweek/1/");
check("page 3 is /2/", pageUrl(lastweek, 3), "https://www.hotnigerianjobs.com/jobs/lastweek/2/");
check("query style", pageUrl({ url: "https://x.test/a/", pagination: "query" }, 2), "https://x.test/a/?page=2");
check("single page", pageUrl({ url: "https://x.test/a/", pagination: "none" }, 2), null);

// ---- throughput sanity: the configured ceiling must actually be reachable ----
const JOBS_PER_PAGE = 50;
const COLUMNS = 21;

check(
  "page walk can supply maxJobsPerRun",
  IMPORT_CONFIG.maxPagesPerSource * JOBS_PER_PAGE >= IMPORT_CONFIG.maxJobsPerRun,
  true,
);
check("time budget stays under the 300s function limit", IMPORT_CONFIG.timeBudgetMs < 300_000, true);
check(
  "insert batch stays under Postgres parameter limit",
  IMPORT_CONFIG.insertBatchSize * COLUMNS < 65_535,
  true,
);
check(
  "batches needed for a full run",
  Math.ceil(IMPORT_CONFIG.maxJobsPerRun / IMPORT_CONFIG.insertBatchSize),
  Math.ceil(5000 / 250),
);

// ---- sweep cursor: eight short runs must cover a full backfill ----
check("continues after a normal chunk", advanceCursor(1, 12, false, 110), 13);
check("wraps when the sweep cap is passed", advanceCursor(105, 12, false, 110), 1);
check("restarts at 1 when a page comes back empty", advanceCursor(60, 5, true, 110), 1);
check("stays put when nothing was read", advanceCursor(7, 0, false, 110), 7);

// 8 runs x 12 pages must reach the whole last-week window
const runsPerDay = 8;
const reached = runsPerDay * IMPORT_CONFIG.pagesPerRun;
check("eight runs can sweep the window", reached >= 100, true);
check(
  "daily capacity meets the 5000 target",
  reached * 50 >= IMPORT_CONFIG.maxJobsPerRun,
  true,
);

// ---- data quality: the values seen in the live preview must never ship ----
const trillion = parseSalary("Salary: N1000000000000 - N1000000000000 / month");
check("rejects an epoch-sized salary", trillion.min === 0 && trillion.max === 0, true);

const timestamps = parseSalary("Posted 1759000000000 salary: N400,000 - N600,000");
check("keeps the real figure, drops the timestamp", timestamps.min, 400000);
check("caps the bogus upper bound", timestamps.max, 600000);

const billions = parseSalary("Remuneration: N90000 - N100000000000");
check("drops an eleven-digit value", billions.max, 90000);

const normal = parseSalary("Salary: N400,000 - N600,000 / month");
check("still parses a normal range", `${normal.min}-${normal.max}`, "400000-600000");

const annual = parseSalary("Salary: N12,000,000 per annum");
check("divides annual figures to monthly", annual.min, 1000000);

check("city is never a country", deriveCity("Nigeria", "Abia"), "Abia");
check("a real city still survives", deriveCity("Lekki, Lagos", "Lagos"), "Lekki");

check("decodes a double-encoded ampersand", decodeEntities("Bakangizo Pharmacy &amp;amp; Stores"), "Bakangizo Pharmacy & Stores");
check("decodes a single-encoded ampersand", decodeEntities("Bakangizo &amp; Stores"), "Bakangizo & Stores");

check(
  "page-wide text is not a description",
  extractDescriptionText("Home Jobs Remote Jobs About Us Contact Privacy Nigeria 2026").length,
  0,
);
check(
  "a real description survives",
  extractDescriptionText("Job Description: We need a pharmacist. Requirements: B.Pharm.").includes("pharmacist"),
  true,
);

console.log(`\n${failures === 0 ? "All checks passed" : `${failures} check(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
