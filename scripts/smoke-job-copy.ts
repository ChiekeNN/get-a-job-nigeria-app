/**
 * Checks the description formatter against the two adverts the importer really
 * stores: the WAEP Marine Manager run-on paragraph and the Bell Oil Logistics
 * Officer advert, plus a plain advert with no labelled fields.
 *
 * Run: node --experimental-strip-types scripts/smoke-job-copy.ts
 */
import { splitJobCopy } from "../src/lib/job-copy.ts";

let failures = 0;

function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL ${name}`, detail ?? "");
  }
}

const marine =
  "West African Exploration and Production company (WAEP) is a registered company with the Corporate Affairs Commission of Nigeria, with RC No: 1173358. We are recruiting to fill the position below: Job Title: Marine Manager Location: Lagos Department: Marine Operations Role Purpose Provide strategic and operational leadership for marine activities. Key Responsibilities Develop and implement marine operations strategies. Qualifications & Experience Bachelor's Degree in Marine Engineering. Minimum 15 years' relevant marine/offshore experience. Relevant STCW or professional certification is strongly preferred.";

const blocks = splitJobCopy(marine);
const titleIndex = blocks.findIndex((b) => b.kind === "field" && b.label === "Job Title");
const locationIndex = blocks.findIndex((b) => b.kind === "field" && b.label === "Location");
const headingTexts = blocks.filter((b) => b.kind === "heading").map((b) => b.text);

console.log("\nMarine Manager");
check("Job Title is its own block", titleIndex > -1, blocks);
check(
  "Job Title value is just the title",
  blocks[titleIndex]?.kind === "field" && blocks[titleIndex].value === "Marine Manager",
  blocks[titleIndex],
);
check(
  "the block before it is the intro, not the title",
  blocks[titleIndex - 1]?.kind === "text" &&
    String((blocks[titleIndex - 1] as { text: string }).text).endsWith("position below:"),
  blocks[titleIndex - 1],
);
check("Location starts its own block after the title", locationIndex === titleIndex + 1, {
  titleIndex,
  locationIndex,
});
check("Department is split out", blocks.some((b) => b.kind === "field" && b.label === "Department"));
check("Role Purpose is a heading", headingTexts.includes("Role Purpose"), headingTexts);
check("Key Responsibilities is a heading", headingTexts.includes("Key Responsibilities"), headingTexts);
check(
  "Qualifications & Experience is a heading",
  headingTexts.includes("Qualifications & Experience"),
  headingTexts,
);
check("no text was lost", blocks.map(blockText).join(" ").includes("RC No: 1173358"));

const colonHeading = splitJobCopy(
  "Relevant certification is preferred. Core Competencies: Offshore marine operations. Vessel assurance.",
);
check(
  "'Core Competencies:' is a heading even with the colon",
  colonHeading.some((b) => b.kind === "heading" && b.text === "Core Competencies"),
  colonHeading,
);

const logistics =
  "Bell Oil and Gas Limited is a leading indigenous oilfield services company. We are recruiting to fill the position below: Job Title: Logistics Officer Location: Lekki Free Zone, Ibeju Lekki, Lagos Employment Type: Full-time Functional Area: Supply Chain Responsibilities Base operations coordination. Inbound and outbound goods validations. Person Specification University Degree. Minimum of 3 years of experience. Must be able to drive and have a valid driver's license.";

const logisticsBlocks = splitJobCopy(logistics);
const logisticsTitles = logisticsBlocks.filter((b) => b.kind === "heading").map((b) => b.text);

console.log("\nLogistics Officer");
check(
  "Job Title holds the role, not the location",
  logisticsBlocks.find((b) => b.kind === "field" && b.label === "Job Title")?.kind === "field" &&
    (logisticsBlocks.find((b) => b.kind === "field" && b.label === "Job Title") as { value: string })
      .value === "Logistics Officer",
);
check(
  "Employment Type is split out",
  (logisticsBlocks.find((b) => b.kind === "field" && b.label === "Employment Type") as
    | { value: string }
    | undefined)?.value === "Full-time",
);
check("Responsibilities is a heading", logisticsTitles.includes("Responsibilities"), logisticsTitles);
check("Person Specification is a heading", logisticsTitles.includes("Person Specification"), logisticsTitles);

console.log("\nPlain advert");
const plain = splitJobCopy("We need a driver in Ikeja. Call us on 0802 656 8715.");
check("one paragraph when nothing is labelled", plain.length === 1, plain);
check("text unchanged", blockText(plain[0]) === "We need a driver in Ikeja. Call us on 0802 656 8715.");

console.log("\nProse guard");
const prose = splitJobCopy(
  "The Benefits Include health cover and a car. Responsibilities of the job are listed on the form.",
);
check(
  "'Benefits Include' is not treated as a heading",
  prose.every((b) => b.kind !== "heading"),
  prose,
);

function blockText(block: ReturnType<typeof splitJobCopy>[number]): string {
  if (block.kind === "field") return `${block.label}: ${block.value}`;
  return block.text;
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
