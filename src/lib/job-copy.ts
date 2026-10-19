/**
 * Turns the single blob the importer stores as a description into readable
 * blocks: a sentence or two, then "Job Title: X" on its own line, then each
 * labelled field and section heading on its own line.
 *
 * Employers write adverts as one run-on paragraph — "…below: Job Title: X
 * Location: Lagos Requirements …" — so the reader currently sees a wall of
 * text. This is presentation only: no words are added, removed or reordered.
 */

export type JobCopyBlock =
  | { kind: "heading"; text: string }
  | { kind: "field"; label: string; value: string }
  | { kind: "text"; text: string };

/** Fields an advert prints as "Label: value" — safe to split on the colon. */
const FIELD_LABELS = [
  "Job Title",
  "Job Type",
  "Employment Type",
  "Work Mode",
  "Work Arrangement",
  "Location",
  "Department",
  "Functional Area",
  "Reports To",
  "Report To",
  "Industry",
  "Salary",
  "Application Closing Date",
  "Closing Date",
  "Deadline",
];

/** Section headings that Nigerian adverts capitalise but often leave unpunctuated. */
const HEADINGS = [
  "Job Description",
  "Job Summary",
  "Job Requirements",
  "Job Duties",
  "Person Specification",
  "Role Purpose",
  "Key Responsibilities",
  "Key Duties",
  "Core Competencies",
  "Key Performance Indicators \\(KPIs\\)",
  "Key Performance Indicators",
  "Qualifications & Experience",
  "Qualifications and Experience",
  "Qualifications",
  "Requirements",
  "Responsibilities",
  "Desired Skills",
  "Required Skills",
  "Skills",
  "Benefits",
  "Remuneration",
  "About the Role",
  "How to Apply",
  "Method of Application",
  "Method Of Application",
  "Application Method",
];

/** "Benefits Include" is prose, not a heading. */
const PROSE_AFTER_HEADING =
  "(?!\\s+(?:[Ii]ncludes?|[Oo]f|[Aa]re|[Ii]s|[Ww]ill|[Mm]ay|[Cc]an|[Mm]ust|[Ff]or|[Tt]o|[Ff]rom)\\b)";

const FIELD_RE = new RegExp(`\\b(${FIELD_LABELS.join("|")})\\s*:`, "gi");

const HEADING_RE = new RegExp(
  `(?:^|[.!?:;)]\\s+)(${HEADINGS.join("|")})${PROSE_AFTER_HEADING}(?:\\s*:)?(?=\\s|$)|` +
    `(${HEADINGS.join("|")})${PROSE_AFTER_HEADING}(?:\\s*:)?(?=\\s+[A-Z0-9(])`,
  "g",
);

function tidy(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

/** Split one line at "Label:" positions, returning field and text blocks. */
function splitFields(line: string): JobCopyBlock[] {
  FIELD_RE.lastIndex = 0;
  const matches = [...line.matchAll(FIELD_RE)];
  if (matches.length === 0) return line ? [{ kind: "text", text: line }] : [];

  const blocks: JobCopyBlock[] = [];
  const first = matches[0];
  const lead = line.slice(0, first.index ?? 0).trim();
  if (lead) blocks.push({ kind: "text", text: lead });

  matches.forEach((match, index) => {
    const label = match[1];
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? line.length) : line.length;
    const value = line.slice(start, end).trim();
    blocks.push({ kind: "field", label, value });
  });

  return blocks;
}

/** Split a text block at section headings that survived the field pass. */
function splitHeadings(text: string): JobCopyBlock[] {
  if (!text) return [];
  const blocks: JobCopyBlock[] = [];
  let cursor = 0;

  HEADING_RE.lastIndex = 0;
  for (const match of text.matchAll(HEADING_RE)) {
    const start = match.index ?? 0;
    // Keep the punctuation that preceded the heading with the previous block.
    const leadEnd = match[1] ? start + match[0].indexOf(match[1]) : start;
    const lead = text.slice(cursor, leadEnd).trim();
    if (lead) blocks.push({ kind: "text", text: lead });
    const heading = match[1] ?? match[2];
    blocks.push({ kind: "heading", text: heading });
    cursor = start + match[0].length;
  }

  const rest = text.slice(cursor).trim();
  if (rest) blocks.push({ kind: "text", text: rest });
  return blocks.length > 0 ? blocks : [{ kind: "text", text }];
}

export function splitJobCopy(description: string): JobCopyBlock[] {
  const lines = tidy(description).split("\n");
  const blocks: JobCopyBlock[] = [];

  for (const line of lines) {
    if (!line) continue;

    const fieldBlocks = splitFields(line);
    for (const block of fieldBlocks) {
      if (block.kind === "text") {
        blocks.push(...splitHeadings(block.text));
        continue;
      }
      if (block.kind !== "field") continue;

      // A field's value can itself introduce a section: "… Requirements …".
      const valueBlocks = splitHeadings(block.value);
      const [firstValue, ...rest] = valueBlocks;
      if (firstValue && firstValue.kind === "text") {
        blocks.push({ ...block, value: firstValue.text });
      } else {
        blocks.push({ ...block, value: "" });
      }
      blocks.push(...rest);
    }
  }

  // Drop empty field values so a stray "Location:" never renders as a lone label.
  return blocks.filter((block) => block.kind !== "field" || block.value.length > 0);
}
