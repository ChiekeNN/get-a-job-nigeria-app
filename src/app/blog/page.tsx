import { ArrowRight, BookOpen, Building2, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HUB_ICONS } from "@/components/blog/hub-icons";
import { PostCard } from "@/components/blog/PostCard";
import {
  FEATURED,
  POSTS,
  formatDate,
  getHub,
  postsInHub,
  type Hub,
  type Post,
} from "@/data/blog";
import { BRAND } from "@/data/site";

export const metadata: Metadata = {
  title: "Career advice for Nigeria — CVs, interviews, salaries and hiring",
  description:
    "Practical, Nigerian-specific job advice: CVs that pass ATS, interview answers that work, what roles actually pay, and how to hire lawfully. Written by the GetAJob team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "GetAJob advice — CVs, interviews, salaries and hiring in Nigeria",
    description:
      "Twelve guides on getting hired in Nigeria, and on hiring well. No filler.",
    type: "website",
  },
};

const SEEKER_HUBS: Hub[] = (["cv", "interviews", "search", "sectors"] as const).map(getHub);
const EMPLOYER_HUBS: Hub[] = (["hiring", "adverts"] as const).map(getHub);

function Section({
  hub,
  posts,
}: {
  hub: Hub;
  posts: Post[];
}) {
  const Icon = HUB_ICONS[hub.id];
  const [lead, ...rest] = posts;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink-900 sm:text-xl">
            <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-white">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            {hub.name}
          </h2>
          <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-ink-500">
            {hub.description}
          </p>
        </div>
        <Link
          href={`/blog/topic/${hub.id}`}
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-900"
        >
          All {postsInHub(hub.id).length}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[lead, ...rest].filter(Boolean).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

export default function BlogIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "GetAJob advice",
            description:
              "Practical Nigerian job advice: CVs, interviews, salaries, job search and hiring.",
            url: `${BRAND.url}/blog`,
            hasPart: POSTS.map((post) => ({
              "@type": "Article",
              headline: post.title,
              url: `${BRAND.url}/blog/${post.slug}`,
              datePublished: post.published,
            })),
          }),
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 size-64 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="wrap relative py-9 sm:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-amber-200">
            <BookOpen className="size-3.5" aria-hidden="true" />
            GetAJob advice · {POSTS.length} guides
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-[30px] font-extrabold leading-[1.06] tracking-tight sm:text-[46px]">
            Practical advice for getting hired in Nigeria.
            <span className="mt-1 block text-brand-300">And for hiring well.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-white/70 sm:text-[15px]">
            No filler. Each guide answers one question Nigerians actually ask — what a CV should
            look like, what to say about salary, what a role really pays, what the law lets an
            employer ask — and then points you at the page that can help.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[SEEKER_HUBS, EMPLOYER_HUBS].flat().map((hub) => {
              const Icon = HUB_ICONS[hub.id];
              return (
                <Link
                  key={hub.id}
                  href={`/blog/topic/${hub.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {hub.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────── */}
      <section className="wrap mt-8 sm:mt-10">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-400">
            Start here
          </p>
          <p className="text-[11px] text-ink-400">Updated {formatDate(FEATURED.updated ?? FEATURED.published)}</p>
        </div>
        <div className="mt-2">
          <PostCard post={FEATURED} variant="wide" />
        </div>
      </section>

      {/* ── For job seekers ──────────────────────────────────────────── */}
      <div className="wrap mt-10">
        <div className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <UserRound className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-extrabold text-ink-900">For job seekers</h2>
            <p className="text-[11.5px] text-ink-500">
              {SEEKER_HUBS.flatMap((hub) => postsInHub(hub.id)).length} guides on CVs, interviews,
              searching and pay.
            </p>
          </div>
        </div>
        {SEEKER_HUBS.map((hub) => (
          <Section key={hub.id} hub={hub} posts={postsInHub(hub.id)} />
        ))}
      </div>

      {/* ── For employers ────────────────────────────────────────────── */}
      <div className="wrap mt-12">
        <div className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <Building2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-extrabold text-ink-900">For employers</h2>
            <p className="text-[11.5px] text-ink-500">
              Hiring lawfully, and writing adverts that bring the right people.
            </p>
          </div>
        </div>
        {EMPLOYER_HUBS.map((hub) => (
          <Section key={hub.id} hub={hub} posts={postsInHub(hub.id)} />
        ))}
      </div>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="wrap my-12 sm:my-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-600 px-5 py-6 text-white sm:flex-row sm:items-center sm:px-7">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">
              Reading is step one. The board is step two.
            </h2>
            <p className="mt-1 text-[13px] text-white/85">
              {BRAND.name} lists verified roles across all 36 states, with the salary shown where the
              employer disclosed it.
            </p>
          </div>
          <Link
            href="/jobs"
            className="btn w-full shrink-0 justify-center bg-white text-brand-800 hover:bg-brand-50 sm:w-auto"
          >
            Browse jobs
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
