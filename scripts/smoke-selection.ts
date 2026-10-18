/**
 * Offline smoke test for homepage listing selection.
 * Run: npx tsx scripts/smoke-selection.ts
 */
import { pickDiverseJobs } from "../src/lib/job-selection";
import type { Job } from "../src/types";

let failures = 0;

function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) {
    console.log(`      got=${JSON.stringify(got)}`);
    console.log(`      want=${JSON.stringify(want)}`);
  }
}

function job(id: number, category: string): Job {
  return { id, slug: `job-${id}`, category, title: `Job ${id}` } as Job;
}

/** Mirrors the live board: one category dominates, the rest are sparse. */
const board: Job[] = [
  ...Array.from({ length: 20 }, (_, index) => job(index + 1, "Customer Service")),
  job(21, "Technology"),
  job(22, "Banking & Finance"),
  job(23, "Healthcare"),
  job(24, "Oil & Gas"),
  job(25, "Engineering"),
  job(26, "Education"),
  job(27, "Sales & Marketing"),
  job(28, "Agriculture"),
];

const picked = pickDiverseJobs(board, 12);

check("fills the requested count", picked.length, 12);

const categories = picked.map((item) => item.category);
check("every category appears once before any repeats", new Set(categories.slice(0, 9)).size, 9);
check("no duplicate listings", new Set(picked.map((item) => item.id)).size, 12);

// Slot nine onward must come from the dominant category, still newest-first.
// #1 was already taken in the first lap, so the tail continues at #2.
check("falls back to the crowded category in order", picked.slice(9).map((item) => item.id), [2, 3, 4]);

const small = [job(1, "Technology"), job(2, "Healthcare")];
check("returns everything when the board is small", pickDiverseJobs(small, 12).map((j) => j.id), [1, 2]);

check("handles an empty board", pickDiverseJobs([], 12), []);
check("handles a zero request", pickDiverseJobs(board, 0), []);

const uncategorised = [{ id: 1, slug: "a", title: "A" } as Job, { id: 2, slug: "b", title: "B" } as Job];
check("groups jobs with no category together", pickDiverseJobs(uncategorised, 5).length, 2);

console.log(`\n${failures === 0 ? "All checks passed" : `${failures} check(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
