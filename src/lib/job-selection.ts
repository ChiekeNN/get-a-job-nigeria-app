import type { Job } from "@/types";

/**
 * Choose a spread of listings instead of simply the first N.
 *
 * The board is ordered newest-first, and imported listings cluster: a single
 * category can comfortably fill every slot on the homepage. Taking the head of
 * the list therefore showed the same kind of employer over and over.
 *
 * This walks the categories in turn, taking the newest remaining listing from
 * each, so every category is represented before any category appears twice.
 * Order within a category is preserved, so "newest first" still holds.
 */
export function pickDiverseJobs(jobs: Job[], count: number): Job[] {
  if (count <= 0) return [];

  const buckets = new Map<string, Job[]>();
  for (const job of jobs) {
    const key = job.category?.trim() || "Other";
    const bucket = buckets.get(key);
    if (bucket) bucket.push(job);
    else buckets.set(key, [job]);
  }

  const queues = [...buckets.values()];
  if (queues.length === 0) return [];

  const picked: Job[] = [];
  let cursor = 0;

  // Round-robin. The guard stops as soon as every category is exhausted, so a
  // board with fewer than `count` listings returns everything it has.
  while (picked.length < count && queues.some((queue) => queue.length > 0)) {
    const queue = queues[cursor % queues.length];
    const next = queue.shift();
    if (next) picked.push(next);
    cursor += 1;
  }

  return picked;
}
