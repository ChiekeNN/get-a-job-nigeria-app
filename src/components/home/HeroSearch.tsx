"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { NIGERIAN_STATES } from "@/data/site";

const POPULAR = ["Graduate trainee", "Customer service", "HSE Officer", "Data analyst", "Remote"];

interface Props {
  initialKeyword?: string;
  initialState?: string;
  compact?: boolean;
}

export function HeroSearch({ initialKeyword = "", initialState = "", compact = false }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (state) params.set("state", state);
    setPending(true);
    router.push(`/jobs${params.size ? `?${params.toString()}` : ""}`);
    window.setTimeout(() => setPending(false), 1200);
  }

  return (
    <div className={compact ? "" : "mt-7"}>
      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/70 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(5,20,15,0.5)] sm:p-3"
        role="search"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_190px_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="field !border-transparent !bg-ink-50/70 !pl-9 focus:!border-brand-300 focus:!bg-white"
              placeholder="Job title, company or keyword"
              aria-label="Job title, company or keyword"
            />
          </div>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <select
              value={state}
              onChange={(event) => setState(event.target.value)}
              className="field !border-transparent !bg-ink-50/70 !pl-9 focus:!border-brand-300 focus:!bg-white"
              aria-label="Select a Nigerian state"
            >
              <option value="">All states + FCT</option>
              {NIGERIAN_STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary h-full px-6">
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}
            Search jobs
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
          Trending:
        </span>
        {POPULAR.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setKeyword(item);
              router.push(`/jobs?keyword=${encodeURIComponent(item)}`);
            }}
            className="rounded-full border border-ink-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-ink-600 transition hover:border-brand-300 hover:bg-white hover:text-brand-800"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
