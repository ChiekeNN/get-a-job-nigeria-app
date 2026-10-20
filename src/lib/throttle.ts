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

/** Applications store a 4 MB CV each, so they are the tighter of the two. */
export const LIMITS = {
  apply: {
    perHour: Number(process.env.APPLY_PER_IP_HOUR) || 5,
    perDay: Number(process.env.APPLY_PER_IP_DAY) || 12,
    globalDay: Number(process.env.APPLY_GLOBAL_DAY) || 250,
  },
  payment: {
    perHour: Number(process.env.PAY_PER_IP_HOUR) || 5,
    perDay: Number(process.env.PAY_PER_IP_DAY) || 10,
    globalDay: Number(process.env.PAY_GLOBAL_DAY) || 200,
  },
} as const;

export type ThrottleScope = keyof typeof LIMITS;

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
    // Both public forms share one table; `scope` keeps their budgets apart.
    await pool.query(
      `alter table apply_attempts add column if not exists scope text not null default 'apply'`,
    );
    await pool.query(
      `create index if not exists apply_attempts_scope_idx on apply_attempts (scope, created_at)`,
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

async function countsFor(fingerprint: string, scope: ThrottleScope): Promise<Counts> {
  const pool = getPool();
  const result = await pool.query<{ hour: number; day: number; global_day: number }>(
    `select
       count(*) filter (where created_at > now() - interval '1 hour')::int as hour,
       count(*) filter (where created_at > now() - interval '1 day')::int as day,
       (select count(*) from apply_attempts
          where scope = $2 and outcome = 'allowed'
            and created_at > now() - interval '1 day')::int as global_day
     from apply_attempts
     where ip_hash = $1 and scope = $2`,
    [fingerprint, scope],
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
export async function guardSubmission(
  request: Request,
  scope: ThrottleScope = "apply",
): Promise<ThrottleVerdict> {
  const fingerprint = clientFingerprint(request);
  const limits = LIMITS[scope];

  try {
    await ensureThrottleTable();
    const counts = await countsFor(fingerprint, scope);
    const pool = getPool();

    let verdict: ThrottleVerdict = {
      allowed: true,
      usedHour: counts.hour,
      usedDay: counts.day,
    };

    if (counts.globalDay >= limits.globalDay) {
      verdict = {
        allowed: false,
        scope: "global",
        reason: `daily ceiling reached (${counts.globalDay}/${limits.globalDay})`,
        retryAfterSeconds: 3600,
      };
    } else if (counts.hour >= limits.perHour) {
      verdict = {
        allowed: false,
        scope: "ip",
        reason: `more than ${limits.perHour} attempts in an hour`,
        retryAfterSeconds: 900,
      };
    } else if (counts.day >= limits.perDay) {
      verdict = {
        allowed: false,
        scope: "ip",
        reason: `more than ${limits.perDay} attempts in a day`,
        retryAfterSeconds: 3600,
      };
    }

    await pool.query(
      `insert into apply_attempts (ip_hash, outcome, reason, scope) values ($1, $2, $3, $4)`,
      [fingerprint, verdict.allowed ? "allowed" : "blocked", verdict.allowed ? null : verdict.reason, scope],
    );

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

/** Kept for the application route, which only ever uses one scope. */
export function guardApplication(request: Request): Promise<ThrottleVerdict> {
  return guardSubmission(request, "apply");
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
       where scope = 'apply' and created_at > now() - interval '1 day'`,
    );
    const row = result.rows[0];
    return {
      last24h: row?.total ?? 0,
      blocked24h: row?.blocked ?? 0,
      globalCeiling: LIMITS.apply.globalDay,
      perHour: LIMITS.apply.perHour,
      perDay: LIMITS.apply.perDay,
    };
  } catch (error) {
    console.error("[apply] could not read throttle counts", error);
    return null;
  }
}
