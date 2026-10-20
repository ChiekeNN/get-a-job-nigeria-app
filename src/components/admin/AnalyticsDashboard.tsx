"use client";

import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Compass,
  Eye,
  Globe2,
  LogOut,
  MapPin,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { BarList, Donut, TrendChart, useCountUp } from "@/components/admin/charts";
import { BRAND } from "@/data/site";

interface Traffic {
  ok: boolean;
  generatedAt: string;
  totals: {
    views30: number;
    visits30: number;
    views7: number;
    viewsToday: number;
    viewsAll: number;
    liveNow: number;
  };
  series: Array<{ label: string; value: number }>;
  topPages: Array<{ path: string; label: string; views: number }>;
  topJobs: Array<{ slug: string; title: string; company: string; views: number }>;
  sections: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
  recent: Array<{ path: string; device: string | null; country: string | null; at: string }>;
}

const DEVICE_COLOURS: Record<string, string> = {
  mobile: "#078e58",
  desktop: "#0d1b16",
  tablet: "#f6b51c",
  Unknown: "#cbd5d1",
};

/** Minute-level recency for the live list; `timeAgo` is hour-granular. */
function since(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  return `${Math.round(seconds / 3600)}h ago`;
}

function signOut() {
  void fetch("/api/admin/login", { method: "DELETE" }).finally(() => {
    window.location.href = "/admin";
  });
}

function Kpi({
  icon: Icon,
  label,
  value,
  note,
  accent = "bg-brand-50 text-brand-700",
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  note: string;
  accent?: string;
}) {
  const animated = useCountUp(value);
  return (
    <article className="card min-w-0 p-4">
      <span className={`grid size-8 place-items-center rounded-lg ${accent}`}>
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <p className="mt-2.5 font-display text-[24px] font-extrabold leading-none tracking-tight text-ink-900">
        {animated.toLocaleString("en-NG")}
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
}: {
  title: string;
  hint?: string;
  icon: typeof Eye;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-rise card min-w-0 p-4 sm:p-5 ${className}`}>
      <div>
        <h2 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink-900">
          <Icon className="size-3.5 text-brand-600" aria-hidden="true" />
          {title}
        </h2>
        {hint ? <p className="mt-0.5 text-[11px] text-ink-400">{hint}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const DEVICE_ICON: Record<string, typeof Monitor> = {
  mobile: Smartphone,
  tablet: Smartphone,
  desktop: Monitor,
};

export function AnalyticsDashboard() {
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      const payload = (await response.json()) as Traffic & { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not load traffic");
      setTraffic(payload);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load traffic");
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 60);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 90_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const empty = Boolean(traffic && traffic.totals.viewsAll === 0);

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
                Traffic &amp; interest
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Overview
            </Link>
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
              onClick={() => signOut()}
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
              Where the traffic goes
            </h1>
            <p className="mt-1 text-[12px] text-ink-500">
              Anonymous page views from the live site · last 30 days
              {traffic ? ` · updated ${since(traffic.generatedAt)}` : ""}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[10.5px] font-semibold text-brand-700">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            No cookies · no personal data
          </span>
        </div>

        {error ? (
          <div className="card border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!traffic ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card h-[118px] animate-pulse bg-white/60" />
            ))}
          </div>
        ) : empty ? (
          <section className="card p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Activity className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-lg font-bold text-ink-900">
              Tracking is live — the first visits land here
            </h2>
            <p className="mx-auto mt-1 max-w-lg text-[12.5px] leading-relaxed text-ink-500">
              Every page view from now on is recorded anonymously, with no cookies and no IP
              address. Traffic, top jobs, sections, sources, devices and countries appear here as
              soon as people start browsing.
            </p>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi
                icon={Eye}
                label="Page views"
                value={traffic.totals.views30}
                note="Last 30 days"
              />
              <Kpi
                icon={Users}
                label="Visits"
                value={traffic.totals.visits30}
                note="Distinct browsing sessions"
                accent="bg-ink-950 text-brand-300"
              />
              <Kpi
                icon={CalendarDays}
                label="Views today"
                value={traffic.totals.viewsToday}
                note="Since midnight, Lagos time"
                accent="bg-amber-50 text-amber-700"
              />
              <Kpi
                icon={Activity}
                label="Reading now"
                value={traffic.totals.liveNow}
                note="Active in the last 5 minutes"
                accent="bg-emerald-50 text-emerald-700"
              />
            </div>

            <Panel
              title="Daily page views"
              hint={`${traffic.totals.views7.toLocaleString("en-NG")} views in the last 7 days · ${traffic.totals.viewsAll.toLocaleString("en-NG")} all time`}
              icon={Activity}
            >
              <TrendChart
                series={[
                  {
                    name: "Page views",
                    colour: "var(--color-brand-600)",
                    points: traffic.series,
                  },
                ]}
              />
            </Panel>

            <div className="grid items-start gap-3 lg:grid-cols-[1.25fr_1fr]">
              <Panel
                title="Top pages"
                hint="The individual pages people open most"
                icon={MousePointerClick}
              >
                <ol className="space-y-2.5">
                  {traffic.topPages.map((page, index) => {
                    const top = traffic.topPages[0]?.views || 1;
                    return (
                      <li key={page.path} className="min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="flex min-w-0 items-baseline gap-2">
                            <span className="shrink-0 text-[10px] font-bold tabular-nums text-ink-300">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <Link
                              href={page.path}
                              className="truncate text-[12px] font-medium text-ink-800 hover:text-brand-700"
                            >
                              {page.label}
                            </Link>
                          </span>
                          <span className="shrink-0 text-[11.5px] font-bold tabular-nums text-ink-900">
                            {page.views.toLocaleString("en-NG")}
                          </span>
                        </div>
                        <p className="ml-6 truncate text-[10px] text-ink-400">{page.path}</p>
                        <div className="ml-6 mt-1 h-1 overflow-hidden rounded-full bg-ink-50">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${Math.max(3, (page.views / top) * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Panel>

              <Panel
                title="Most visited sections"
                hint="Which parts of the platform earn attention"
                icon={Compass}
              >
                <BarList items={traffic.sections} limit={9} suffix="views" />
              </Panel>
            </div>

            <Panel
              title="Top jobs"
              hint="Which listings people actually open — the clearest signal of what the market wants"
              icon={ArrowUpRight}
            >
              <ul className="divide-y divide-ink-50">
                {traffic.topJobs.map((job) => (
                  <li key={job.slug} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="block truncate text-[12.5px] font-semibold text-ink-900 hover:text-brand-700"
                      >
                        {job.title}
                      </Link>
                      <p className="truncate text-[10.5px] text-ink-400">{job.company}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-700">
                      {job.views.toLocaleString("en-NG")} views
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="grid items-start gap-3 lg:grid-cols-3">
              <Panel title="Where visits come from" hint="Sessions by source" icon={Globe2}>
                <BarList items={traffic.referrers} colour="#0891b2" limit={8} suffix="visits" />
              </Panel>

              <Panel title="Devices" hint="What people browse on" icon={Monitor}>
                <Donut
                  label="VIEWS"
                  items={traffic.devices.map((device) => ({
                    name: device.name,
                    count: device.count,
                    colour: DEVICE_COLOURS[device.name] ?? "#cbd5d1",
                  }))}
                />
              </Panel>

              <Panel title="Countries" hint="Where visitors are" icon={MapPin}>
                <BarList items={traffic.countries} colour="#8b5cf6" limit={7} suffix="views" />
              </Panel>
            </div>

            <Panel
              title="Latest visits"
              hint="A rolling sample — path, device and country only"
              icon={Activity}
            >
              <ul className="divide-y divide-ink-50">
                {traffic.recent.map((visit, index) => {
                  const Icon = DEVICE_ICON[visit.device ?? ""] ?? Monitor;
                  return (
                    <li
                      key={`${visit.at}-${index}`}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon className="size-3 shrink-0 text-ink-300" aria-hidden="true" />
                        <Link
                          href={visit.path}
                          className="truncate text-[11.5px] text-ink-700 hover:text-brand-700"
                        >
                          {visit.path}
                        </Link>
                      </div>
                      <span className="shrink-0 text-[10px] text-ink-400">
                        {visit.country ?? "—"} · {since(visit.at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <p className="pb-4 text-center text-[10.5px] text-ink-400">
              Counts are anonymous page views. No cookies are set, IP addresses are never stored,
              and the admin console is excluded from tracking.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
