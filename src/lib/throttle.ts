import { createHash } from "node:crypto";

import { getPool } from "@/db";

/**
 * Abuse control for the public application form.
 *
 * The form stores a CV of up to 4 MB in the database, so it is the one public
 * write that must not be free to hammer. Three limits apply, all measured over
 * a rolling 24 hours:
 *
 *   - per browser/IP per hour  (a person applying to several roles is fine)
 *   - per browser/IP per day   (a script retrying is not)
 *   - one global daily ceiling (protects the database if a botnet arrives)
 *
 * Nothing personal is kept: the address is hashed with a server-side salt and
 * only the hash is written. Nothing here can be used to identify a visitor, and
 * the raw IP never touches disk.
 *
 * The table is created on first use, like the traffic table, so a deploy needs
 * no manual SQL.
 */

const SALT = process.env.APPLY_SALT?.trim() || process.env.ADMIN_SECRET || "getajob-apply";

const PER_IP_HOUR = Number(process.env.APPLY_PER_IP_HOUR) || 5;
const PER_IP_DAY = Number(process.env.APPLY_PER_IP_DAY) || 12;
const GLOBAL_DAY = Number(process.env.APPLY_GLOBAL_DAY) || 250;

let schemaReady: Promise<void> | null = null;

function ensureThrottleTable(): Promise<void> {
  schemaReady ??= (async () => {
    const pool = getPool();
    await pool.query(`
      create table if not exists apply_attempts (
        id serial primary key,
        ip_hash text not null,
        outcome text not null default 'allowed',
        reason text,
        created_at timestamptz not null default now()
      )
    `);
    await pool.query(
      `create index if not exists apply_attempts_created_idx on apply_attempts (created_at)`,
    );
    await pool.query(
      `create index if not exists apply_attempts_ip_idx on apply_attempts (ip_hash, created_at)`,
    );
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

/**
 * The client address, hashed.
 *
 * Vercel sets `x-forwarded-for` (and `x-real-ip`); the first entry is the
 * caller. Behind no proxy this falls back to a constant, which simply means the
 * per-IP limits behave as a single shared bucket while the global ceiling still
 * applies.
 */
export function clientFingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const address =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown";
  return createHash("sha256").update(`${SALT}:${address}`).digest("hex").slice(0, 32);
}

export type ThrottleVerdict =
  | { allowed: true; usedHour: number; usedDay: number }
  | {
      allowed: false;
      /** `ip` — this caller is over their limit. `global` — the board is. */
      scope: "ip" | "global";
      reason: string;
      retryAfterSeconds: number;
    };

interface Counts {
  hour: number;
  day: number;
  globalDay: number;
}

async function countsFor(fingerprint: string): Promise<Counts> {
  const pool = getPool();
  const result = await pool.query<{ hour: number; day: number; global_day: number }>(
    `select
       count(*) filter (where created_at > now() - interval '1 hour')::int as hour,
       count(*) filter (where created_at > now() - interval '1 day')::int as day,
       (select count(*) from apply_attempts
          where outcome = 'allowed' and created_at > now() - interval '1 day')::int as global_day
     from apply_attempts
     where ip_hash = $1`,
    [fingerprint],
  );
  const row = result.rows[0];
  return { hour: row?.hour ?? 0, day: row?.day ?? 0, globalDay: row?.global_day ?? 0 };
}

/**
 * Decide whether this attempt may proceed, and record it either way.
 *
 * Every call leaves a row, so a blocked script cannot retry for free — and the
 * console can show how much noise is being turned away.
 */
export async function guardApplication(request: Request): Promise<ThrottleVerdict> {
  const fingerprint = clientFingerprint(request);

  try {
    await ensureThrottleTable();
    const counts = await countsFor(fingerprint);
    const pool = getPool();

    let verdict: ThrottleVerdict = {
      allowed: true,
      usedHour: counts.hour,
      usedDay: counts.day,
    };

    if (counts.globalDay >= GLOBAL_DAY) {
      verdict = {
        allowed: false,
        scope: "global",
        reason: `daily ceiling reached (${counts.globalDay}/${GLOBAL_DAY})`,
        retryAfterSeconds: 3600,
      };
    } else if (counts.hour >= PER_IP_HOUR) {
      verdict = {
        allowed: false,
        scope: "ip",
        reason: `more than ${PER_IP_HOUR} attempts in an hour`,
        retryAfterSeconds: 900,
      };
    } else if (counts.day >= PER_IP_DAY) {
      verdict = {
        allowed: false,
        scope: "ip",
        reason: `more than ${PER_IP_DAY} attempts in a day`,
        retryAfterSeconds: 3600,
      };
    }

    await pool.query(`insert into apply_attempts (ip_hash, outcome, reason) values ($1, $2, $3)`, [
      fingerprint,
      verdict.allowed ? "allowed" : "blocked",
      verdict.allowed ? null : verdict.reason,
    ]);

    // Keep the table small without needing a cron job.
    if (Math.random() < 0.02) {
      await pool.query(`delete from apply_attempts where created_at < now() - interval '7 days'`);
    }

    return verdict;
  } catch (error) {
    // A throttle that fails open keeps the site usable; the global ceiling is a
    // guard rail, not a substitute for the database being reachable.
    console.error("[apply] throttle check failed — allowing the attempt", error);
    return { allowed: true, usedHour: 0, usedDay: 0 };
  }
}

export interface ThrottleSummary {
  last24h: number;
  blocked24h: number;
  globalCeiling: number;
  perHour: number;
  perDay: number;
}

/** What the admin console shows, so a surge is visible before it is a problem. */
export async function throttleSummary(): Promise<ThrottleSummary | null> {
  try {
    await ensureThrottleTable();
    const result = await getPool().query<{ total: number; blocked: number }>(
      `select
         count(*) filter (where outcome = 'allowed')::int as total,
         count(*) filter (where outcome = 'blocked')::int as blocked
       from apply_attempts
       where created_at > now() - interval '1 day'`,
    );
    const row = result.rows[0];
    return {
      last24h: row?.total ?? 0,
      blocked24h: row?.blocked ?? 0,
      globalCeiling: GLOBAL_DAY,
      perHour: PER_IP_HOUR,
      perDay: PER_IP_DAY,
    };
  } catch (error) {
    console.error("[apply] could not read throttle counts", error);
    return null;
  }
}
