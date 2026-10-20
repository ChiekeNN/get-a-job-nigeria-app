"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  Rocket,
  Sparkles,
  Square,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { BarList, Donut, TrendChart, useCountUp, useGrown } from "@/components/admin/charts";
import { BRAND } from "@/data/site";

interface Stats {
  ok: boolean;
  generatedAt: string;
  totals: {
    liveJobs: number;
    allJobs: number;
    drafts: number;
    newToday: number;
    new7d: number;
    new30d: number;
    applications: number;
    applications7d: number;
    subscribers: number;
    salaryDisclosed: number;
    salaryMedian: number;
    statesHiring: number;
    remote: number;
    companies: number;
    listingsWithApplications: number;
  };
  trend: {
    postings: Array<{ date: string; count: number }>;
    applications: Array<{ date: string; count: number }>;
  };
  industries: Array<{ name: string; count: number }>;
  states: Array<{ name: string; count: number }>;
  jobTypes: Array<{ name: string; count: number }>;
  levels: Array<{ name: string; count: number }>;
  salaryBands: Array<{ label: string; count: number }>;
  topCompanies: Array<{ name: string; count: number }>;
  subscriptionsByKind: Array<{ name: string; count: number }>;
  subscriptionPlans: Array<{ name: string; count: number }>;
  mail: { configured: boolean; inbox: string };
  recentApplications: Array<{
    name: string;
    email: string;
    phone: string;
    role: string;
    company: string;
    cv: string | null;
    at: string;
  }>;
  quality: {
    missingSalary: number;
    missingDescription: number;
    stale: number;
    expiringSoon: number;
    duplicates: number;
    cvs: number;
  };
  importer: {
    cursors: Array<{ key: string; page: number; at: string }>;
    lastImportAt: string | null;
    newestListingAt: string | null;
  };
}

const naira = (value: number) =>
  value >= 1_000_000
    ? `₦${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`
    : value >= 1_000
      ? `₦${Math.round(value / 1_000)}k`
      : `₦${value}`;

const shortBand = (label: string) =>
  label
    .replace("Under ₦100k", "≤100k")
    .replace(/₦/g, "")
    .replace(/ – /g, "–")
    .replace("100k–200k", "100–200k")
    .replace("200k–350k", "200–350k")
    .replace("350k–500k", "350–500k")
    .replace("500k–1m", "500–999k")
    .replace("1m+", "1m+");

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

const timeAgo = (iso: string | null) => {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

function Kpi({
  label,
  value,
  display,
  note,
  icon: Icon,
  accent = "brand",
  delay = 0,
  badge,
}: {
  label: string;
  value: number;
  display?: (value: number) => string;
  note: string;
  icon: typeof Briefcase;
  accent?: "brand" | "ink" | "amber" | "sky";
  delay?: number;
  badge?: string;
}) {
  const animated = useCountUp(value);
  const accents: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    ink: "bg-ink-900 text-white",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
  };

  return (
    <article
      className="admin-rise card relative min-w-0 overflow-hidden p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`grid size-9 place-items-center rounded-xl ${accents[accent]}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {badge ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
            <ArrowUpRight className="size-3" aria-hidden="true" />
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[26px] font-extrabold leading-none tracking-tight text-ink-900">
        {display ? display(animated) : animated.toLocaleString("en-NG")}
      </p>
      <p className="mt-1.5 text-[11.5px] font-semibold text-ink-700">{label}</p>
      <p className="mt-0.5 text-[10.5px] leading-snug text-ink-400">{note}</p>
    </article>
  );
}

function Panel({
  title,
  hint,
  icon: Icon,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  hint?: string;
  icon: typeof Briefcase;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`admin-rise card min-w-0 p-4 sm:p-5 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink-900">
            <Icon className="size-3.5 text-brand-600" aria-hidden="true" />
            {title}
          </h2>
          {hint ? <p className="mt-0.5 text-[11px] text-ink-400">{hint}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Salary bands as a small column chart. */
function SalaryChart({ bands }: { bands: Array<{ label: string; count: number }> }) {
  const max = Math.max(1, ...bands.map((band) => band.count));
  const grown = useGrown(100, 200);
  return (
    <div className="flex min-w-0 items-end gap-2" style={{ height: 164 }}>
      {bands.map((band, index) => {
        const pixels = Math.max(4, Math.round((band.count / max) * 108 * (grown / 100)));
        return (
          <div key={band.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-bold tabular-nums text-ink-800">{band.count}</span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
              style={{
                height: pixels,
                transition: `height 800ms cubic-bezier(0.22,1,0.36,1) ${index * 70}ms`,
              }}
            />
            <span className="w-full break-words text-center text-[9.5px] leading-[1.15] text-ink-400">
              {shortBand(band.label)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const [pulling, setPulling] = useState(false);
  const [pullBatches, setPullBatches] = useState(0);
  const [pulled, setPulled] = useState(0);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [windowDone, setWindowDone] = useState(false);
  const stopPull = useRef(false);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const response = await fetch("/api/admin/stats", { cache: "no-store" });
      const payload = (await response.json()) as Stats & { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not load statistics");
      setStats(payload);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load statistics");
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Deferred a tick so the first paint is the skeleton, not a flash of empty
    // cards — and so the fetch is never kicked off inside the render commit.
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  /**
   * Pulls the two-week window one batch at a time. Each batch is a separate
   * function invocation with its own time budget; the archive cursor makes the
   * sequence resumable, and stopping loses nothing.
   */
  async function pullTwoWeeks() {
    stopPull.current = false;
    setPulling(true);
    setPullBatches(0);
    setPulled(0);
    setWindowDone(false);
    setPullNote("Walking the archive, newest first…");

    try {
      for (let batch = 1; batch <= 80; batch += 1) {
        if (stopPull.current) {
          setPullNote("Paused. Press Continue to carry on from the same page.");
          break;
        }
        const response = await fetch("/api/admin/backfill", { method: "POST" });
        const payload = (await response.json()) as {
          ok: boolean;
          inserted: number;
          cursor: { to: number } | null;
          complete: boolean;
          message?: string;
        };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "The backfill run returned an error.");
        }
        setPullBatches(batch);
        setPulled((total) => total + payload.inserted);
        setPullNote(
          `Batch ${batch} · +${payload.inserted} listings · now at archive page ${payload.cursor?.to ?? "?"}`,
        );
        if (payload.complete) {
          setWindowDone(true);
          setPullNote("Two-week window complete — every listing in range is on the board.");
          break;
        }
      }
    } catch (caught) {
      setPullNote(caught instanceof Error ? caught.message : "The backfill stopped unexpectedly.");
    } finally {
      setPulling(false);
      void load(true);
    }
  }

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  if (error) {
    return (
      <div className="wrap py-16">
        <div className="card mx-auto max-w-lg p-6 text-center">
          <AlertTriangle className="mx-auto size-6 text-amber-500" aria-hidden="true" />
          <h1 className="mt-3 font-display text-lg font-bold text-ink-900">The console could not load</h1>
          <p className="mt-1 text-sm text-ink-500">{error}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => void load(true)} className="btn btn-primary">
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
            <button type="button" onClick={() => void signOut()} className="btn btn-ghost">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="wrap py-16">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-ink-100" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-ink-100" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-ink-100" />
        </div>
      </div>
    );
  }

  const { totals, trend, quality, importer } = stats;
  const postingPoints = trend.postings.map((point) => ({
    label: shortDate(`${point.date}T12:00:00Z`),
    value: point.count,
  }));
  const applicationPoints = trend.applications.map((point) => ({
    label: shortDate(`${point.date}T12:00:00Z`),
    value: point.count,
  }));

  const backfillCursor = importer.cursors.find((cursor) => cursor.key.startsWith("backfill:"));
  const backfillPage = backfillCursor?.page ?? 0;

  const jobTypeColours = ["#078e58", "#38ce8a", "#0891b2", "#f6b51c", "#8b5cf6", "#64748b"];
  const donutItems = stats.jobTypes.slice(0, 5).map((row, index) => ({
    ...row,
    colour: jobTypeColours[index] ?? "#94a3b8",
  }));
  const otherTypes = stats.jobTypes.slice(5).reduce((sum, row) => sum + row.count, 0);
  if (otherTypes > 0) donutItems.push({ name: "Other", count: otherTypes, colour: "#94a3b8" });

  const attention = [
    {
      icon: Wallet,
      label: "No salary disclosed",
      value: quality.missingSalary,
      hint: "Shown as “Salary not disclosed”",
      tone: quality.missingSalary > totals.liveJobs * 0.5 ? "warn" : "ok",
    },
    {
      icon: FileText,
      label: "Thin descriptions",
      value: quality.missingDescription,
      hint: "Under 180 characters of copy",
      tone: quality.missingDescription > 0 ? "warn" : "ok",
    },
    {
      icon: Clock,
      label: "Not seen upstream in 7 days",
      value: quality.stale,
      hint: "Due to expire automatically",
      tone: quality.stale > 0 ? "warn" : "ok",
    },
    {
      icon: CalendarClock,
      label: "Closing within 3 days",
      value: quality.expiringSoon,
      hint: "Still live, near their deadline",
      tone: "ok",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink-100 bg-ink-950 text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-white/95">
              <Image src="/brand/mark.png" alt="" width={28} height={28} className="size-7" />
            </span>
            <div>
              <p className="font-display text-[15px] font-extrabold leading-none">
                {BRAND.name} <span className="text-brand-300">Admin</span>
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Control room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold text-white/65 sm:inline-flex">
              <span className="admin-live-dot size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Live · {clock.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              type="button"
              onClick={() => void load(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
              disabled={refreshing}
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="wrap space-y-4 py-5">
        <div className="admin-rise flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
              Everything happening on the platform
            </h1>
            <p className="mt-1 text-[12px] text-ink-500">
              Updated {timeAgo(stats.generatedAt)} · newest listing {timeAgo(importer.newestListingAt)} ·
              last import {timeAgo(importer.lastImportAt)}
            </p>
          </div>
          <span className="chip">
            <CheckCircle2 className="size-3 text-brand-600" aria-hidden="true" />
            {stats.totals.statesHiring} states hiring
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi
            label="Live listings"
            value={totals.liveJobs}
            note={`${totals.new7d} added in the last 7 days`}
            icon={Briefcase}
            accent="brand"
            delay={0}
            badge={`+${totals.newToday} today`}
          />
          <Kpi
            label="Applications"
            value={totals.applications}
            note={`${totals.applications7d} in the last 7 days`}
            icon={FileText}
            accent="ink"
            delay={70}
          />
          <Kpi
            label="Subscribers"
            value={totals.subscribers}
            note={`${quality.cvs} CVs on file`}
            icon={Users}
            accent="sky"
            delay={140}
          />
          <Kpi
            label="Median salary"
            value={totals.salaryMedian}
            display={naira}
            note={`${totals.salaryDisclosed} of ${totals.liveJobs} disclose pay`}
            icon={Wallet}
            accent="amber"
            delay={210}
          />
        </div>

        {/* Trend */}
        <Panel
          title="Postings and applications · last 30 days"
          hint="Postings are the green line; applications the dark one."
          icon={Sparkles}
          delay={120}
        >
          <div className="flex flex-wrap items-center gap-4 pb-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-ink-600">
              <span className="h-0.5 w-3 rounded-full bg-brand-600" aria-hidden="true" />
              Postings ({totals.new30d})
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-600">
              <span className="h-0.5 w-3 rounded-full bg-ink-900" aria-hidden="true" />
              Applications ({totals.applications})
            </span>
          </div>
          <TrendChart
            series={[
              { name: "Postings", colour: "var(--color-brand-600)", points: postingPoints },
              { name: "Applications", colour: "var(--color-ink-900)", points: applicationPoints },
            ]}
          />
        </Panel>

        <Panel
          title="Grow the board · last two weeks"
          hint="Walks the source archive newest-first and stops at the edge of the window. Runs beside the daily uploads and never moves their cursor."
          icon={Rocket}
          delay={160}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Archive page</p>
                <p className="font-display text-lg font-extrabold leading-none text-ink-900">
                  {backfillPage ? `p${backfillPage}` : "p1"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Added this session</p>
                <p className="font-display text-lg font-extrabold leading-none text-brand-700">
                  +{pulled.toLocaleString("en-NG")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Batches run</p>
                <p className="font-display text-lg font-extrabold leading-none text-ink-900">{pullBatches}</p>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Status</p>
                <p className="text-[11.5px] font-semibold leading-snug text-ink-700">
                  {pullNote ??
                    (windowDone
                      ? "Window complete."
                      : "Ready. Each batch adds a few hundred listings.")}
                </p>
              </div>
            </div>

            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              {pulling ? (
                <button
                  type="button"
                  onClick={() => {
                    stopPull.current = true;
                  }}
                  className="btn btn-ghost w-full justify-center sm:w-auto"
                >
                  <Square className="size-3.5" aria-hidden="true" />
                  Stop
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void pullTwoWeeks()}
                disabled={pulling}
                className="btn btn-primary w-full justify-center whitespace-nowrap sm:w-auto"
              >
                {pulling ? (
                  <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Rocket className="size-4" aria-hidden="true" />
                )}
                {pulling ? "Pulling…" : windowDone ? "Run again" : "Pull the last two weeks"}
              </button>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
              style={{
                width: windowDone ? "100%" : `${Math.min(96, Math.max(4, (backfillPage / 400) * 100))}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-ink-400">
            Keep this tab open while it runs — closing it only pauses the job; press the button again to
            resume from the same page. The daily uploads at 00:05–21:05 keep their own schedule.
          </p>
        </Panel>

        <div className="grid items-start gap-3 lg:grid-cols-3">
          <Panel
            title="Industries"
            hint={`Top 12 of ${stats.industries.length} industries`}
            icon={Briefcase}
            delay={160}
          >
            <BarList items={stats.industries} limit={12} />
          </Panel>

          <Panel title="States" hint="Where the jobs actually are" icon={MapPin} delay={200}>
            <BarList items={stats.states} colour="#0891b2" limit={10} />
            <p className="mt-4 text-[10.5px] text-ink-400">
              {stats.states.length} states represented · {totals.remote} remote-friendly roles
            </p>
          </Panel>

          <div className="space-y-3">
            <Panel title="Contract type" hint="What employers are offering" icon={Clock} delay={240}>
              <Donut items={donutItems} />
            </Panel>
            <Panel title="Seniority" icon={Users} delay={280}>
              <BarList items={stats.levels} colour="#8b5cf6" limit={5} />
            </Panel>
          </div>
        </div>

        <div className="grid items-start gap-3 lg:grid-cols-3">
          <Panel title="Salary distribution" hint="Monthly gross, disclosed salaries only" icon={Wallet} delay={200}>
            <SalaryChart bands={stats.salaryBands} />
          </Panel>

          <Panel title="Hiring companies" hint="Most active employers" icon={Users} delay={240}>
            <BarList items={stats.topCompanies} colour="#067249" limit={8} suffix="roles" />
          </Panel>

          <Panel
            title="Subscriptions"
            hint={`${totals.subscribers} people signed up`}
            icon={Mail}
            delay={280}
          >
            <div className="space-y-3">
              {stats.subscriptionsByKind.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-200 bg-cream p-4 text-center text-[11.5px] text-ink-400">
                  No signups yet. The alerts and Pro forms write here.
                </p>
              ) : (
                <BarList items={stats.subscriptionsByKind} colour="#f6b51c" limit={4} />
              )}
              {stats.subscriptionPlans.length > 0 ? (
                <div className="border-t border-ink-50 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Plans</p>
                  <div className="mt-2">
                    <BarList items={stats.subscriptionPlans} colour="#64748b" limit={5} />
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="grid items-start gap-3 lg:grid-cols-[1.35fr_1fr]">
          <Panel
            title="Latest applications"
            hint="Newest first. These are the people you forward to employers."
            icon={FileText}
            delay={240}
          >
            {!stats.mail.configured ? (
              <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                Application emails are not being sent. Set <code>SMTP_PASS</code> in Vercel and
                redeploy — until then applications are saved here without their CV.
              </p>
            ) : null}
            {stats.recentApplications.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-200 bg-cream p-6 text-center text-[12px] text-ink-400">
                No applications yet.
              </p>
            ) : (
              <ul className="divide-y divide-ink-50">
                {stats.recentApplications.map((row, index) => (
                  <li key={`${row.email}-${index}`} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                      {row.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-ink-900">{row.name}</p>
                      <p className="truncate text-[10.5px] text-ink-400">
                        {row.email} · {row.phone}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-ink-600">
                        <span className="font-medium text-ink-800">{row.role}</span> · {row.company}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-semibold text-ink-500">
                      {timeAgo(row.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="space-y-3">
            <Panel title="Needs attention" hint="Data quality at a glance" icon={AlertTriangle} delay={280}>
              <ul className="space-y-2">
                {attention.map((row) => (
                  <li key={row.label} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg ${
                        row.tone === "warn" ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      <row.icon className="size-3" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[11.5px] font-semibold text-ink-800">{row.label}</p>
                        <p className="text-[12px] font-bold tabular-nums text-ink-900">{row.value}</p>
                      </div>
                      <p className="text-[10px] text-ink-400">{row.hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Importer" hint="Where the next sweep resumes" icon={Database} delay={320}>
              <ul className="space-y-1.5">
                {importer.cursors.length === 0 ? (
                  <li className="text-[11px] text-ink-400">No cursor stored yet.</li>
                ) : (
                  importer.cursors.map((cursor) => (
                    <li key={cursor.key} className="flex items-center justify-between gap-2 text-[10.5px]">
                      <span className="min-w-0 truncate font-mono text-ink-500">
                        {cursor.key.replace(/^sweep:/, "").replace("https://www.hotnigerianjobs.com", "")}
                      </span>
                      <span className="shrink-0 rounded-full bg-ink-50 px-2 py-0.5 font-bold text-ink-700">
                        p{cursor.page}
                      </span>
                    </li>
                  ))
                )}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-50 pt-3 text-[10.5px]">
                <div>
                  <p className="text-ink-400">Last import</p>
                  <p className="font-semibold text-ink-800">{timeAgo(importer.lastImportAt)}</p>
                </div>
                <div>
                  <p className="text-ink-400">Newest listing</p>
                  <p className="font-semibold text-ink-800">{timeAgo(importer.newestListingAt)}</p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <p className="pb-8 text-center text-[10px] text-ink-300">
          {BRAND.name} admin · private console, not linked from the public site
        </p>
      </div>
    </div>
  );
}
