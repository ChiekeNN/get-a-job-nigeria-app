/**
 * Checks for the article extractor.
 *
 * The fixtures reproduce the real markup of the source's job pages: a huge
 * navigation block, an <h1> headline, a "Posted on … (N comments)" line, the job
 * copy, and — for multi-position adverts — a numbered list of roles each linking
 * to its own listing.
 */
import {
  extractArticleDescription,
  extractArticleHtml,
  extractChildListings,
  extractListingCards,
  stripTags,
  findFirst,
  POSTED_PATTERNS,
} from "../src/lib/importer/extract";

let pass = 0;
let fail = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass += 1;
    console.log(`  PASS ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${label}\n       expected ${e}\n       actual   ${a}`);
  }
}

function ok(label: string, condition: boolean) {
  check(label, condition, true);
}

const NAV = `<div class="nav">${Array.from({ length: 40 }, (_, i) => `<a href="/role/${1000 + i}/">Role ${i}</a>`).join(" ")}</div>`;

const AGGREGATE = `<html><head><title>YGF Academy Job Recruitment (5 Positions) | HotNigerianJobs</title></head><body>
${NAV}
<div class="content">
<h1><a href="https://www.hotnigerianjobs.com/hotjobs/975605/ygf-academy-job-recruitment-5-positions.html">YGF Academy Job Recruitment (5 Positions)</a></h1>
<p>Posted on Thu 15th Oct, 2026 - hotnigerianjobs.com --- <a href="https://www.hotnigerianjobs.com/hotjobs/975605/ygf-academy-job-recruitment-5-positions.html">(0 comments)</a></p>
<p>YGF Academy is recruiting the services of qualified, competent, dedicated, and passionate teachers to fill the following positions below:</p>
<p><strong>1.) Computer Studies Teacher</strong></p>
<p>Location: Osun</p>
<p><a href="https://www.hotnigerianjobs.com/hotjobs/975527/computer-studies-teacher-at-ygf-academy.html">Click Here To View Details</a></p>
<p><strong>2.) Agricultural Science Teacher</strong></p>
<p>Location: Osun</p>
<p><a href="https://www.hotnigerianjobs.com/hotjobs/975526/agricultural-science-teacher-at-ygf-academy.html">Click Here To View Details</a></p>
<p><strong>3.) Islamic Religious Studies (IRS) Teacher</strong></p>
<p>Location: Osun</p>
<p><a href="https://www.hotnigerianjobs.com/hotjobs/975525/islamic-religious-studies-irs-teacher-at-ygf-acade.html">Click Here To View Details</a></p>
<p><strong>4.)  Livestock Farming Teacher</strong></p>
<p>Location: Osun</p>
<p><a href="https://www.hotnigerianjobs.com/hotjobs/975524/livestock-farming-teacher-at-ygf-academy.html">Click Here To View Details</a></p>
<p><strong>5.) Mathematics Teacher</strong></p>
<p>Location: Osun</p>
<p><a href="https://www.hotnigerianjobs.com/hotjobs/975514/mathematics-teacher-at-ygf-academy.html">Click Here To View Details</a></p>
<p><strong>Application Closing Date</strong></p>
<p>Not Specified.</p>
<p><strong>Share this job:</strong> <a href="/share">Facebook</a></p>
</div>
${NAV}
</body></html>`;

const SINGLE = `<html><head><title>Medical Doctor at Serenity Royale Hospital | HotNigerianJobs</title></head><body>
${NAV}
<div class="content">
<h1><a href="https://www.hotnigerianjobs.com/hotjobs/972646/medical-doctor-at-serenity-royale-hospital.html">Medical Doctor at Serenity Royale Hospital</a></h1>
<p>Posted on Fri 09th Oct, 2026 - hotnigerianjobs.com --- <a href="https://www.hotnigerianjobs.com/hotjobs/972646/medical-doctor-at-serenity-royale-hospital.html">(0 comments)</a></p>
<p>Serenity Royale Hospital is recruiting to fill the position of: Medical Doctor. The position is located in Lagos State. Interested candidates should possess relevant qualifications and experience.</p>
<p>Salary: N450,000 - N600,000 / month.</p>
<p><strong>Application Closing Date</strong></p>
<p>30th October, 2026.</p>
<p><strong>Share this job:</strong> <a href="/share">Facebook</a></p>
</div>
${NAV}
</body></html>`;

const LISTING_CARD = `<html><body>${NAV}
<h2><a href="https://www.hotnigerianjobs.com/hotjobs/972646/medical-doctor-at-serenity-royale-hospital.html">Medical Doctor at Serenity Royale Hospital</a></h2>
<p>Posted on Fri 09th Oct, 2026 - hotnigerianjobs.com --- <a href="https://www.hotnigerianjobs.com/hotjobs/972646/medical-doctor-at-serenity-royale-hospital.html">(0 comments)</a></p>
<p>Serenity Royale Hospital is recruiting to fill the position of: Medical Doctor. The position is located in Lagos State.</p>
<a href="https://www.hotnigerianjobs.com/hotjobs/972646/medical-doctor-at-serenity-royale-hospital.html">Apply Now</a>
${NAV}</body></html>`;

console.log("article extraction");
{
  const article = extractArticleHtml(AGGREGATE);
  ok("aggregate article is not empty", article.length > 200);
  ok("article excludes the navigation", !article.includes("Role 12"));
  ok("article stops before the share block", !article.includes("Share this job"));
}

console.log("publication date");
{
  const articleText = stripTags(extractArticleHtml(AGGREGATE));
  check("aggregate posted date", findFirst(articleText, POSTED_PATTERNS), "Thu 15th Oct, 2026");
  const singleText = stripTags(extractArticleHtml(SINGLE));
  check("single posted date", findFirst(singleText, POSTED_PATTERNS), "Fri 09th Oct, 2026");
}

console.log("child expansion");
{
  const children = extractChildListings(extractArticleHtml(AGGREGATE));
  check("child count", children.length, 5);
  check("child 1 title", children[0]?.title, "Computer Studies Teacher");
  check("child 1 id", children[0]?.sourceId, "975527");
  check("child 1 location", children[0]?.locationText, "Osun");
  check("child 2 title", children[1]?.title, "Agricultural Science Teacher");
  check("child 3 title", children[2]?.title, "Islamic Religious Studies (IRS) Teacher");
  check("child 4 title", children[3]?.title, "Livestock Farming Teacher");
  check("child 5 title", children[4]?.title, "Mathematics Teacher");
  ok("child 1 url is absolute", children[0]?.url.startsWith("https://www.hotnigerianjobs.com/hotjobs/975527/"));
  check("single listing has no children", extractChildListings(extractArticleHtml(SINGLE)).length, 0);
}

console.log("description body");
{
  const desc = extractArticleDescription(stripTags(extractArticleHtml(SINGLE)));
  ok("description mentions the role", desc.includes("Serenity Royale Hospital is recruiting"));
  ok("description keeps the salary line", desc.includes("450,000"));
  ok("description drops the posted line", !desc.startsWith("Posted on"));
  ok("description drops the closing-date block", !desc.includes("Application Closing Date"));
  const agg = extractArticleDescription(stripTags(extractArticleHtml(AGGREGATE)));
  ok("aggregate body keeps the intro", agg.includes("YGF Academy is recruiting"));
}

console.log("listing cards");
{
  const cards = extractListingCards(LISTING_CARD);
  check("one card", cards.length, 1);
  check("card posted text", cards[0]?.postedText, "Fri 09th Oct, 2026");
  ok("card summary is real copy", cards[0]?.summary.includes("Serenity Royale Hospital is recruiting"));
  ok("card summary has no posted line", !cards[0]?.summary.includes("Posted on"));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
