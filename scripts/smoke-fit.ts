/**
 * Checks the requirement reader and the eligibility check.
 *
 * The fixtures are the real shapes the importer produces: a long marine advert
 * with a 15-year minimum and STCW, a logistics advert asking for a degree, three
 * years and a driver's licence, an advert that only states preferences, and one
 * that names no requirements at all.
 *
 * Run: node --experimental-strip-types scripts/smoke-fit.ts
 */
import { analyzeJob, evaluateFit, summarizeFit, fieldsToAsk, EMPTY_PROFILE } from "../src/lib/fit.ts";
import type { CandidateProfile } from "../src/lib/fit.ts";

let failures = 0;

function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}`, detail ?? "");
  }
}

const marine = analyzeJob({
  description:
    "We are recruiting to fill the position below: Job Title: Marine Manager Location: Lagos Department: Marine Operations. Qualifications & Experience: Bachelor's Degree in Marine Engineering, Nautical Science, Maritime Studies or a related discipline. Minimum 15 years' relevant marine/offshore experience, including significant leadership responsibility. Relevant STCW, maritime, marine assurance, HSE or professional certification is strongly preferred. Core Competencies: Offshore marine operations.",
  requirements: [],
});

console.log("\nMarine Manager");
const marineFields = marine.items.map((item) => item.field).join(",");
check("reads a degree, 15 years, STCW", ["education", "experience", "certification"].every((f) => marineFields.includes(f)), marineFields);
check("degree is bachelor's", marine.items.find((i) => i.field === "education")?.level === 4);
check("experience is 15 years", marine.items.find((i) => i.field === "experience")?.years === 15);
check("certification lists STCW", marine.items.find((i) => i.field === "certification")?.codes?.includes("STCW") === true);
check("certification is soft (advert says preferred)", marine.items.find((i) => i.field === "certification")?.soft === true);
check("quotes the employer, not us", (marine.items[0].quote || "").length > 10);

const logistics = analyzeJob({
  description:
    "Bell Oil and Gas Limited is a leading indigenous oilfield services company. Person Specification: University Degree. Minimum of 3 years of experience. Ideal candidate: Honest and hardworking, confident with good social skills. Must be able to drive and have a valid driver's license.",
  requirements: [],
});

console.log("\nLogistics Officer");
const logisticsFields = logistics.items.map((item) => item.field).join(",");
check("reads degree, years, licence", ["education", "experience", "licence"].every((f) => logisticsFields.includes(f)), logisticsFields);
check("experience is 3 years", logistics.items.find((i) => i.field === "experience")?.years === 3);
check("licence is mandatory", logistics.items.find((i) => i.field === "licence")?.soft === false);

const preferencesOnly = analyzeJob({
  description: "We are looking for a sales executive who is confident on the phone. A car is an added advantage. ICAN is preferred but not required.",
  requirements: [],
});
console.log("\nPreferences only");
check("ICAN noticed", preferencesOnly.items.some((i) => i.field === "certification"));
check("ICAN marked soft", preferencesOnly.items.find((i) => i.field === "certification")?.soft === true);

const empty = analyzeJob({ description: "We are recruiting to fill the position below.", requirements: [] });
console.log("\nNothing stated");
check("no requirements invented", empty.items.length === 0, empty.items);

const candidate: CandidateProfile = {
  ...EMPTY_PROFILE,
  education: 4,
  years: 2,
  nysc: "yes",
  licence: "yes",
  certifications: "",
};

console.log("\nEligibility — BSc, 2 years, no certificate");
const rows = evaluateFit(logistics.items, candidate);
const verdict = summarizeFit(rows);
check("meets the degree", rows.find((r) => r.field === "education")?.status === "met");
check("falls short on years", rows.find((r) => r.field === "experience")?.status === "gap");
check("meets the licence", rows.find((r) => r.field === "licence")?.status === "met");
check("verdict is 'one requirement to address'", verdict.tone === "warn", verdict);

const senior = { ...candidate, years: 12, certifications: "STCW 95, ICAN" };
const marineRows = evaluateFit(marine.items, senior);
check("12 years misses a 15-year floor", marineRows.find((r) => r.field === "experience")?.status === "gap");
check("STCW satisfies the certification", marineRows.find((r) => r.field === "certification")?.status === "met");
check("hard requirement failing => warn/bad", ["warn", "bad"].includes(summarizeFit(marineRows).tone));

const blank = evaluateFit(marine.items, EMPTY_PROFILE);
check("unanswered stays 'open', never 'gap'", blank.every((r) => r.status === "open"));
check("unknown verdict until answered", summarizeFit(blank).tone === "unknown");

const noRequirements = summarizeFit(evaluateFit(empty.items, candidate));
check("nothing stated => honest 'nothing to check'", noRequirements.tone === "unknown", noRequirements);

console.log("\nQuestions asked");
check("asks only what the advert states", fieldsToAsk(logistics.items).join(",") === "education,experience,licence", fieldsToAsk(logistics.items));
check("empty advert asks nothing", fieldsToAsk(empty.items).length === 0);

console.log("\nNYSC");
const nyscJob = analyzeJob({ description: "Applicants must have completed NYSC. Minimum of 2 years experience.", requirements: [] });
check("NYSC detected", nyscJob.items.some((i) => i.field === "nysc"));
check("NYSC 'no' is a gap", evaluateFit(nyscJob.items, { ...candidate, nysc: "no" }).find((r) => r.field === "nysc")?.status === "gap");
check("NYSC 'exempt' passes", evaluateFit(nyscJob.items, { ...candidate, nysc: "exempt" }).find((r) => r.field === "nysc")?.status === "met");

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
