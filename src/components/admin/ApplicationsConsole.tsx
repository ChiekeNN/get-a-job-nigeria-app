"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BRAND } from "@/data/site";

interface Application {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  location: string | null;
  coverLetter: string | null;
  cvFileName: string | null;
  cvSize: number | null;
  hasCv: boolean;
  createdAt: string;
  jobId: number | null;
  jobTitle: string | null;
  jobCompany: string | null;
  jobSlug: string | null;
  jobState: string | null;
}

interface Totals {
  total: number;
  today: number;
  week: number;
  withCv: number;
}

interface Payload {
  ok: boolean;
  totals: Totals;
  applications: Application[];
  message?: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fullDate(iso);
}

const fileSize = (bytes: number | null) => {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function ApplicationsConsole({ focusId }: { focusId?: number }) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyWithCv, setOnlyWithCv] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(focusId ?? null);
  const [confirmScope, setConfirmScope] = useState<"one" | "person" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/applications", { cache: "no-store" });
      const payload = (await response.json()) as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Could not load applications");
      setData(payload);
      setUpdatedAt(new Date());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deferred a tick so the first paint is the skeleton and the fetch never
    // starts inside the render commit.
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const applications = useMemo(() => data?.applications ?? [], [data]);

  const selected = useMemo(
    () => applications.find((row) => row.id === selectedId) ?? null,
    [applications, selectedId],
  );

  const personCount = useMemo(() => {
    if (!selected) return 0;
    return applications.filter(
      (row) => row.email.toLowerCase() === selected.email.toLowerCase(),
    ).length;
  }, [applications, selected]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((row) => {
      if (onlyWithCv && !row.hasCv) return false;
      if (!needle) return true;
      return [row.fullName, row.email, row.phone, row.jobTitle, row.jobCompany, row.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [applications, onlyWithCv, query]);

  useEffect(() => {
    if (selectedId === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedId(null);
        setConfirmScope(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  }

  async function remove(scope: "one" | "person") {
    if (!selected) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/applications/${selected.id}?scope=${scope}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        ok: boolean;
        deleted?: number;
        person?: string | null;
        message?: string;
      };
      if (!response.ok) throw new Error(payload.message ?? "Could not delete");

      const count = payload.deleted ?? 1;
      setNotice(
        scope === "person"
          ? `Deleted ${count} application${count === 1 ? "" : "s"} from ${payload.person ?? selected.email}, CVs included.`
          : `Deleted the application from ${selected.fullName}, CV included.`,
      );
      setConfirmScope(null);
      setSelectedId(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  }

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
                Applications
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Overview
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-400/40 bg-brand-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-brand-200 transition hover:bg-brand-500/25"
            >
              <Activity className="size-3.5" aria-hidden="true" />
              Traffic
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
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

      <main className="wrap space-y-4 py-5">
        <div className="admin-rise flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-xl font-extrabold text-ink-900">Applications</h1>
            <p className="mt-0.5 text-[11.5px] text-ink-500">
              Every application, with the CV attached. Download it, or delete it — the file goes with
              the record.
            </p>
          </div>
          <p className="text-[10.5px] text-ink-400">
            {updatedAt ? `Updated ${updatedAt.toLocaleTimeString("en-NG")}` : "Loading…"}
          </p>
        </div>

        {notice ? (
          <p className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[11.5px] text-brand-800">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {notice}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "All time", value: data?.totals.total ?? 0 },
            { label: "Today", value: data?.totals.today ?? 0 },
            { label: "Last 7 days", value: data?.totals.week ?? 0 },
            { label: "With CV on file", value: data?.totals.withCv ?? 0 },
          ].map((item) => (
            <div key={item.label} className="card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                {item.label}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-ink-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {error ? (
          <div className="card flex items-start gap-2 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-ink-900">{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-1 text-[11px] font-semibold text-brand-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : null}

        <section className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300"
                aria-hidden="true"
              />
              <span className="sr-only">Search applications</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, phone or role"
                className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-[12.5px] text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400"
              />
            </label>
            <button
              type="button"
              onClick={() => setOnlyWithCv((value) => !value)}
              aria-pressed={onlyWithCv}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11.5px] font-semibold transition ${
                onlyWithCv
                  ? "border-brand-300 bg-brand-50 text-brand-800"
                  : "border-ink-200 bg-white text-ink-600 hover:border-brand-200"
              }`}
            >
              <FileText className="size-3.5" aria-hidden="true" />
              CV on file
            </button>
          </div>

          {loading && applications.length === 0 ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-14 animate-pulse rounded-xl bg-ink-50" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-ink-200 bg-cream p-8 text-center">
              <Users className="mx-auto size-6 text-ink-300" aria-hidden="true" />
              <p className="mt-2 text-[12.5px] font-semibold text-ink-700">
                {applications.length === 0 ? "No applications yet." : "Nothing matches that search."}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
                {applications.length === 0
                  ? "Applications arrive here the moment a candidate applies — no email needed."
                  : "Clear the search or the CV filter to see everything."}
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-ink-50">
              {rows.map((row) => (
                <li key={row.id} className="py-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                      {initials(row.fullName)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-[12.5px] font-semibold text-ink-900">{row.fullName}</p>
                        {row.hasCv ? (
                          <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-brand-700">
                            CV
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-700">
                            No file
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 break-all text-[10.5px] text-ink-400">
                        {row.email} · {row.phone}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-600">
                        <span className="font-medium text-ink-800">
                          {row.jobTitle ?? "Listing removed"}
                        </span>
                        {row.jobCompany ? ` · ${row.jobCompany}` : ""}
                        {row.location ? ` · ${row.location}` : ""}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                      <span className="text-[10px] text-ink-400">{timeAgo(row.createdAt)}</span>
                      <div className="flex items-center gap-1.5">
                        {row.hasCv ? (
                          <a
                            href={`/api/admin/applications/${row.id}/cv`}
                            className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[10.5px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                          >
                            <Download className="size-3" aria-hidden="true" />
                            CV
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(row.id);
                            setConfirmScope(null);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-ink-950 px-2.5 py-1 text-[10.5px] font-semibold text-white transition hover:bg-ink-800"
                        >
                          <Eye className="size-3" aria-hidden="true" />
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data && rows.length > 0 ? (
            <p className="mt-3 border-t border-ink-50 pt-3 text-[10.5px] text-ink-400">
              Showing {rows.length} of {data.totals.total} applications
              {data.totals.total > applications.length
                ? ` · the newest ${applications.length} are loaded`
                : ""}
              .
            </p>
          ) : null}
        </section>

        <p className="pb-8 text-center text-[10px] text-ink-300">
          {BRAND.name} admin · CVs are private and served only to a signed-in admin
        </p>
      </main>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
              setConfirmScope(null);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-ink-100 bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                  {initials(selected.fullName)}
                </span>
                <div className="min-w-0">
                  <h2 id="application-title" className="truncate font-display text-sm font-bold text-ink-900">
                    {selected.fullName}
                  </h2>
                  <p className="text-[10.5px] text-ink-400">{fullDate(selected.createdAt)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setConfirmScope(null);
                }}
                className="grid size-7 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-500 transition hover:bg-ink-50"
                aria-label="Close"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              <dl className="grid gap-2 text-[11.5px] sm:grid-cols-2">
                <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2">
                  <dt className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    <Mail className="size-3" aria-hidden="true" /> Email
                  </dt>
                  <dd className="mt-0.5 break-all">
                    <a href={`mailto:${selected.email}`} className="font-medium text-brand-700">
                      {selected.email}
                    </a>
                  </dd>
                </div>
                <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2">
                  <dt className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    <Phone className="size-3" aria-hidden="true" /> Phone
                  </dt>
                  <dd className="mt-0.5">
                    <a href={`tel:${selected.phone}`} className="font-medium text-brand-700">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
                <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2">
                  <dt className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    <Briefcase className="size-3" aria-hidden="true" /> Applied for
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink-800">
                    {selected.jobTitle ?? "Listing removed"}
                    {selected.jobCompany ? ` · ${selected.jobCompany}` : ""}
                  </dd>
                </div>
                <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2">
                  <dt className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    <MapPin className="size-3" aria-hidden="true" /> Location
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink-800">
                    {selected.location || "Not provided"}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                  Cover note
                </p>
                <p className="mt-1 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-ink-100 bg-white px-3 py-2 text-[11.5px] leading-relaxed text-ink-700">
                  {selected.coverLetter || "No cover note provided."}
                </p>
              </div>

              <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-800">
                      <FileText className="size-3.5 text-brand-600" aria-hidden="true" />
                      {selected.hasCv ? "CV on file" : "No CV archived"}
                    </p>
                    <p className="mt-0.5 break-all text-[10.5px] text-ink-400">
                      {selected.hasCv
                        ? `${selected.cvFileName ?? "CV"}${fileSize(selected.cvSize) ? ` · ${fileSize(selected.cvSize)}` : ""}`
                        : "This application arrived before CVs were archived in the console — ask the candidate to resend it."}
                    </p>
                  </div>
                  {selected.hasCv ? (
                    <a
                      href={`/api/admin/applications/${selected.id}/cv`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-[11px] font-bold text-ink-950 transition hover:bg-brand-400"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      Download CV
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-800">
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </p>

                {confirmScope === null ? (
                  <>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-rose-700/80">
                      Deleting removes the record and the CV file permanently. There is no undo.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmScope("one")}
                        className="rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Delete this application
                      </button>
                      {personCount > 1 ? (
                        <button
                          type="button"
                          onClick={() => setConfirmScope("person")}
                          className="rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Delete all {personCount} from this person
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-[10.5px] font-semibold leading-relaxed text-rose-800">
                      {confirmScope === "person"
                        ? `Delete all ${personCount} application${personCount === 1 ? "" : "s"} from ${selected.email}, CVs included?`
                        : `Delete ${selected.fullName}'s application and CV?`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void remove(confirmScope)}
                        disabled={deleting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1 text-[10.5px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        {deleting ? (
                          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="size-3" aria-hidden="true" />
                        )}
                        {deleting ? "Deleting…" : "Yes, delete permanently"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmScope(null)}
                        disabled={deleting}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-600 transition hover:bg-ink-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>

              <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-ink-400">
                <Clock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                Received {fullDate(selected.createdAt)}
                {selected.jobSlug ? (
                  <>
                    {" · "}
                    <Link
                      href={`/jobs/${selected.jobSlug}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      view listing
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
