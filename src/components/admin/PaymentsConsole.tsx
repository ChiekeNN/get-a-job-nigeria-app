"use client";

import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  FileText,
  FileWarning,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BRAND } from "@/data/site";

interface Payment {
  id: number;
  reference: string;
  planId: string;
  planName: string;
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  note: string | null;
  hasProof: boolean;
  proofName: string | null;
  proofSize: number | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface Totals {
  collected: number;
  paidCount: number;
  awaitingCount: number;
  awaitingValue: number;
  thisMonth: number;
  thisMonthCount: number;
}

interface Payload {
  ok: boolean;
  totals: Totals;
  payments: Payment[];
  message?: string;
}

type Filter = "all" | "submitted" | "verified" | "cancelled";

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const STATUS_STYLE: Record<string, string> = {
  verified: "bg-brand-50 text-brand-700",
  submitted: "bg-amber-50 text-amber-700",
  cancelled: "bg-ink-100 text-ink-500",
};

const STATUS_LABEL: Record<string, string> = {
  verified: "Verified",
  submitted: "Awaiting",
  cancelled: "Cancelled",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PaymentsConsole() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/payments", { cache: "no-store" });
      const payload = (await response.json()) as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Could not load payments");
      setData(payload);
      setUpdatedAt(new Date());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const payments = useMemo(() => data?.payments ?? [], [data]);

  const selected = useMemo(
    () => payments.find((row) => row.id === selectedId) ?? null,
    [payments, selectedId],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return payments.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!needle) return true;
      return [row.reference, row.fullName, row.email, row.phone, row.planName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [payments, filter, query]);

  useEffect(() => {
    if (selectedId === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedId(null);
        setConfirmDelete(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  }

  async function setStatus(status: "verified" | "submitted" | "cancelled") {
    if (!selected) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/payments/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not update the payment");

      setNotice(
        status === "verified"
          ? `${selected.reference} marked verified — ${naira(selected.amount)} counted as collected.`
          : status === "cancelled"
            ? `${selected.reference} cancelled. It no longer counts towards anything.`
            : `${selected.reference} moved back to awaiting.`,
      );
      setSelectedId(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the payment");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/payments/${selected.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not delete the payment");
      setNotice(`Deleted ${selected.reference} and the receipt stored with it.`);
      setConfirmDelete(false);
      setSelectedId(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the payment");
    } finally {
      setBusy(false);
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
                Payments
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
              href="/admin/applications"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Applications
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
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
            <h1 className="font-display text-xl font-extrabold text-ink-900">Payments</h1>
            <p className="mt-0.5 text-[11.5px] text-ink-500">
              Every transfer someone has told us about, with the receipt they uploaded. Match it
              against the bank account before marking it verified.
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

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            {
              label: "Collected",
              value: naira(data?.totals.collected ?? 0),
              hint: `${data?.totals.paidCount ?? 0} verified`,
              icon: Wallet,
              tone: "text-brand-700",
            },
            {
              label: "This month",
              value: naira(data?.totals.thisMonth ?? 0),
              hint: `${data?.totals.thisMonthCount ?? 0} payments`,
              icon: Banknote,
              tone: "text-ink-900",
            },
            {
              label: "Awaiting you",
              value: String(data?.totals.awaitingCount ?? 0),
              hint: naira(data?.totals.awaitingValue ?? 0) + " claimed",
              icon: Clock,
              tone: "text-amber-700",
            },
            {
              label: "Average",
              value:
                data && data.totals.paidCount > 0
                  ? naira(Math.round(data.totals.collected / data.totals.paidCount))
                  : "—",
              hint: "per verified payment",
              icon: BadgeCheck,
              tone: "text-ink-900",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                <kpi.icon className="size-3" aria-hidden="true" />
                {kpi.label}
              </p>
              <p className={`mt-1 font-display text-xl font-extrabold tabular-nums ${kpi.tone}`}>
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[10px] text-ink-400">{kpi.hint}</p>
            </div>
          ))}
        </div>

        {error ? (
          <div className="card flex items-start gap-2 p-4">
            <FileWarning className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
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
              <span className="sr-only">Search payments</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reference, name, email or phone"
                className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-[12.5px] text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400"
              />
            </label>
            <div className="flex rounded-xl border border-ink-200 bg-white p-0.5">
              {(
                [
                  ["all", "All"],
                  ["submitted", "Awaiting"],
                  ["verified", "Verified"],
                  ["cancelled", "Cancelled"],
                ] as Array<[Filter, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    filter === key ? "bg-ink-950 text-white" : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading && payments.length === 0 ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-14 animate-pulse rounded-xl bg-ink-50" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-ink-200 bg-cream p-8 text-center">
              <Receipt className="mx-auto size-6 text-ink-300" aria-hidden="true" />
              <p className="mt-2 text-[12.5px] font-semibold text-ink-700">
                {payments.length === 0 ? "No payments yet." : "Nothing matches that."}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
                {payments.length === 0
                  ? "Anyone who pays by transfer and uploads a receipt appears here."
                  : "Clear the search or switch the filter."}
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
                        <p className="font-mono text-[11px] font-bold text-ink-500">{row.reference}</p>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${
                            STATUS_STYLE[row.status] ?? STATUS_STYLE.cancelled
                          }`}
                        >
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                        {row.hasProof ? null : (
                          <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-rose-700">
                            No receipt
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[12.5px] font-semibold text-ink-900">{row.fullName}</p>
                      <p className="truncate text-[10.5px] text-ink-400">
                        {row.planName} · {row.email}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                      <div className="text-right">
                        <p className="text-[12.5px] font-bold tabular-nums text-ink-900">
                          {naira(row.amount)}
                        </p>
                        <p className="text-[10px] text-ink-400">{timeAgo(row.createdAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(row.id);
                          setConfirmDelete(false);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-ink-950 px-2.5 py-1 text-[10.5px] font-semibold text-white transition hover:bg-ink-800"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data && rows.length > 0 ? (
            <p className="mt-3 border-t border-ink-50 pt-3 text-[10.5px] text-ink-400">
              Showing {rows.length} of {payments.length} payments
              {data.totals.awaitingCount > 0
                ? ` · ${data.totals.awaitingCount} waiting to be checked`
                : ""}
              .
            </p>
          ) : null}
        </section>

        <p className="pb-8 text-center text-[10px] text-ink-300">
          {BRAND.name} admin · receipts are private and served only to a signed-in admin
        </p>
      </main>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
              setConfirmDelete(false);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-ink-100 bg-white px-4 py-3">
              <div className="min-w-0">
                <h2
                  id="payment-title"
                  className="font-display text-sm font-bold text-ink-900"
                >
                  {selected.planName} · {naira(selected.amount)}
                </h2>
                <p className="mt-0.5 font-mono text-[10.5px] text-ink-400">{selected.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setConfirmDelete(false);
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
                  <dt className="text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    Paid by
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink-800">{selected.fullName}</dd>
                </div>
                <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2">
                  <dt className="text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    Status
                  </dt>
                  <dd className="mt-0.5">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        STATUS_STYLE[selected.status] ?? STATUS_STYLE.cancelled
                      }`}
                    >
                      {STATUS_LABEL[selected.status] ?? selected.status}
                    </span>
                  </dd>
                </div>
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
              </dl>

              <p className="text-[11px] text-ink-400">
                Submitted {fullDate(selected.createdAt)}
                {selected.paidAt ? ` · verified ${fullDate(selected.paidAt)}` : ""}
              </p>

              {selected.note ? (
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-ink-400">
                    Note from the buyer
                  </p>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl border border-ink-100 bg-white px-3 py-2 text-[11.5px] leading-relaxed text-ink-700">
                    {selected.note}
                  </p>
                </div>
              ) : null}

              <div className="rounded-xl border border-ink-100 bg-cream px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-800">
                  <Receipt className="size-3.5 text-brand-600" aria-hidden="true" />
                  Proof of payment
                </p>
                {selected.hasProof ? (
                  <>
                    <p className="mt-0.5 break-all text-[10.5px] text-ink-400">
                      {selected.proofName ?? "Receipt"}
                      {selected.proofSize
                        ? ` · ${Math.max(1, Math.round(selected.proofSize / 1024))} KB`
                        : ""}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/admin/payments/${selected.id}/proof`}
                      alt={`Proof of payment for ${selected.reference}`}
                      className="mt-2 max-h-72 w-full rounded-lg border border-ink-200 bg-white object-contain"
                    />
                    <a
                      href={`/api/admin/payments/${selected.id}/proof`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-700 hover:underline"
                    >
                      Open full size
                    </a>
                  </>
                ) : (
                  <p className="mt-1 text-[10.5px] leading-relaxed text-amber-700">
                    No receipt was uploaded. Match this against the bank statement by name and
                    amount, or ask the buyer to send it.
                  </p>
                )}
              </div>

              {selected.status === "verified" ? (
                <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-800">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Verified — counted in the collected total
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void setStatus("submitted")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <Undo2 className="size-3" aria-hidden="true" />
                      )}
                      Move back to awaiting
                    </button>
                    <button
                      type="button"
                      onClick={() => void setStatus("cancelled")}
                      disabled={busy}
                      className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-600 transition hover:bg-ink-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-2.5">
                  <p className="text-[11.5px] font-semibold text-brand-900">
                    Check the Fidelity Bank account, then confirm.
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-brand-800/70">
                    Verifying counts {naira(selected.amount)} as collected
                    {selected.planId === "pro" ? " and adds the buyer to the Pro list." : "."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void setStatus("verified")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1 text-[10.5px] font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                      )}
                      Money received — verify
                    </button>
                    <button
                      type="button"
                      onClick={() => void setStatus("cancelled")}
                      disabled={busy}
                      className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-600 transition hover:bg-ink-50 disabled:opacity-60"
                    >
                      Cancel this payment
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-800">
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </p>
                {confirmDelete ? (
                  <>
                    <p className="mt-1 text-[10.5px] font-semibold leading-relaxed text-rose-800">
                      Delete {selected.reference} and the receipt stored with it? This cannot be
                      undone.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void remove()}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1 text-[10.5px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        {busy ? (
                          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="size-3" aria-hidden="true" />
                        )}
                        Yes, delete permanently
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        disabled={busy}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-600 transition hover:bg-ink-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="mt-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete this record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
