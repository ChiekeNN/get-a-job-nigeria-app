/**
 * Offline smoke test for the importer's pure logic.
 * Run: npx tsx scripts/smoke-import.ts
 *
 * Uses fixtures in the source board's own phrasing, so it runs without network
 * access and catches parser regressions before a real import.
 */
import {
  extractDescriptionText,
  extractJobLinks,
  findFirst,
  splitSentences,
  DEADLINE_PATTERNS,
  LOCATION_PATTERNS,
  REQUIREMENT_MARKERS,
  SALARY_PATTERNS,
  stripTags,
} from "../src/lib/importer/extract";
import { detectJobType, detectState, deriveCity, parseSalary } from "../src/lib/importer/normalize";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n      got=${JSON.stringify(actual)}\n      want=${JSON.stringify(expected)}`}`);
}

const listingHtml = `
<div class="jobs">
  <a href="/hotjobs/975604/internal-auditor-at-domeo-resources-international.html">Internal Auditor at Domeo Resources International</a>
  <a href="https://www.hotnigerianjobs.com/hotjobs/975599/construction-manager-at-peoplevantage-consul.html">Construction Manager at Peoplevantage Consulting Limited</a>
  <a href="/hotjobs/975604/internal-auditor-at-domeo-resources-international.html">Duplicate link</a>
</div>`;

const links = extractJobLinks(listingHtml);
check("listing links parsed", links.length, 2);
check("dedupes same job id", links[0].sourceId, "975604");
check("resolves relative url", links[0].url, "https://www.hotnigerianjobs.com/hotjobs/975604/internal-auditor-at-domeo-resources-international.html");

const detailHtml = `
<html><head><title>Internal Auditor at Domeo Resources International | HotNigerianJobs</title></head>
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

console.log(`\n${failures === 0 ? "All checks passed" : `${failures} check(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
