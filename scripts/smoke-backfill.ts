/**
 * Checks the two-week backfill window.
 *
 * The archive listing prints dates like "Posted on Fri 16th Oct, 2026", and the
 * backfill decides whether to keep a card — and whether it has reached the end
 * of the window — from exactly that text. If the parse is wrong the window is
 * wrong, so these cases are pinned.
 *
 * Run: node --experimental-strip-types scripts/smoke-backfill.ts
 */
import { advanceCursor, isWithinWindow, parseListingDate } from "../src/lib/importer/window.ts";

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL ${name}`, detail ?? "");
  }
}

const DAY = 86_400_000;
const now = Date.now();
/** Whole days between a printed date and now, rounded to the nearest day. */
const daysAgo = (ms: number | null) => (ms === null ? Number.NaN : Math.round((now - ms) / DAY));

console.log("\nDates printed on the listing cards");
const cases: Array<[string, number]> = [
  ["Posted on Fri 16th Oct, 2026", 3],
  ["Posted on Tue 13th Oct, 2026", 6],
  ["Posted on Tue 6th Oct, 2026", 13],
  ["Posted on Wed 30th Sep, 2026", 19],
];

for (const [text, expected] of cases) {
  const parsed = parseListingDate(text, now);
  check(`"${text}" reads as ${expected} days ago`, daysAgo(parsed) === expected, daysAgo(parsed));
}

console.log("\nWindow membership (15 days)");
for (const [text, expected] of cases) {
  const inside = isWithinWindow(text, 15, now);
  check(`"${text}" is ${expected <= 15 ? "inside" : "outside"}`, inside === (expected <= 15));
}

console.log("\nCursor");
check("carries on while inside the window", advanceCursor(1, 5, false, 120) === 6);
check("restarts when the window is exhausted", advanceCursor(40, 3, true, 120) === 1);
check("wraps at the cap", advanceCursor(118, 5, false, 120) === 1);

console.log("\nSafety");
check(
  "unparseable text still counts as fresh (never silently drops a page)",
  isWithinWindow("Posted recently", 15, now),
);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
