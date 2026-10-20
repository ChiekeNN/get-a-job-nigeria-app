import { ArrowRight, BellRing, ChevronRight, MapPin, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BRAND } from "@/data/site";
import { STATE_PAGES, getStatePage, statePageForName, type StatePage } from "@/data/state-pages";
import { salaryLabel, timeAgo } from "@/lib/format";
import { listJobs } from "@/lib/jobs-service";
import type { Job } from "@/types";

/**
 * Rendered on demand and cached for ten minutes.
 *
 * The page deliberately has no `generateStaticParams`: the build has no
 * database connection, so prerendering here would bake in the fallback sample
 * and every state page would quote a number that is not the board's. First
 * request renders from the live board, then the result is reused.
 */
export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStatePage(slug);

  if (!state) {
    return { title: "State not found" };
  }

  return {
    title: `Jobs in ${state.label} — live vacancies across ${state.name}`,
    description: `Verified job openings in ${state.name}, Nigeria — ${state.sectors
      .slice(0, 3)
      .join(", ")} and more. See what is hiring in ${state.label} and apply with a CV that gets read.`,
    alternates: { canonical: `${BRAND.url}/states/${state.slug}` },
    openGraph: {
      title: `Jobs in ${state.label} | ${BRAND.name}`,
      description: `Live vacancies across ${state.name} — updated from the GetAJob board.`,
      url: `${BRAND.url}/states/${state.slug}`,
      type: "website",
    },
  };
}

/** Count by key, dropping empty keys. */
function tally(jobs: Job[], key: "category" | "jobType"): Array<[string, number]> {
  const counts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job[key]] = (acc[job[key]] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function StateJsonLd({ state, count }: { state: StatePage; count: number }) {
  const url = `${BRAND.url}/states/${state.slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BRAND.url },
      { "@type": "ListItem", position: 2, name: "Jobs by state", item: `${BRAND.url}/states` },
      { "@type": "ListItem", position: 3, name: `Jobs in ${state.label}`, item: url },
    ],
  };

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Jobs in ${state.label}`,
    description: `Verified job vacancies in ${state.name}, Nigeria.`,
    url,
    inLanguage: "en-NG",
    isPartOf: { "@type": "WebSite", name: BRAND.name, url: BRAND.url },
    about: { "@type": "Place", name: `${state.name}, Nigeria` },
    ...(count > 0 ? { numberOfItems: count } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />
    </>
  );
}

export default async function StatePageRoute({ params }: Props) {
  const { slug } = await params;
  const state = getStatePage(slug);

  if (!state) notFound();

  const jobs = await listJobs();
  const inState = jobs
    .filter((job) => job.state === state.name)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  const count = inState.length;
  const categories = tally(inState, "category").slice(0, 5);
  const types = tally(inState, "jobType").slice(0, 3);
  const latest = inState.slice(0, 8);

  const boardHref = `/jobs?state=${encodeURIComponent(state.name)}`;
  const neighbours = state.neighbours
    .map((name) => statePageForName(name))
    .filter((entry): entry is StatePage => Boolean(entry));

  return (
    <div className="wrap py-8 sm:py-10">
      <StateJsonLd state={state} count={count} />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link href="/states" className="hover:text-brand-700">
          Jobs by state
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="font-medium text-ink-700">{state.label}</span>
      </nav>

      <header className="mt-3 rounded-[26px] border border-brand-100 bg-brand-50/70 p-5 sm:p-8">
        <p className="eyebrow">
          <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
          {state.zone} · {state.capital}
        </p>
        <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
          Jobs in {state.label}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-[15px]">
          {count > 0 ? (
            <>
              <strong className="font-semibold text-ink-900">
                {count} {count === 1 ? "verified vacancy" : "verified vacancies"}
              </strong>{" "}
              open in {state.name} right now, across {categories.length || 1}{" "}
              {categories.length === 1 ? "industry" : "industries"}. Every listing below comes from
              the live board — nothing on this page is estimated.
            </>
          ) : (
            <>
              There are no live openings in {state.name} at this moment. Employers post throughout
              the week, so set an alert and we will tell you the day one lands — or browse the
              national board in the meantime.
            </>
          )}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href={boardHref} className="btn btn-primary">
            {count > 0 ? `See all ${count} ${count === 1 ? "role" : "roles"} in ${state.name}` : "Browse all jobs"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/pro" className="btn btn-outline">
            <BellRing className="size-4" aria-hidden="true" />
            Get {state.label} job alerts
          </Link>
        </div>
      </header>

      {categories.length > 0 ? (
        <section className="mt-6 card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink-900">
              What is hiring in {state.label}
            </h2>
            <span className="chip">{count} live</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(([category, n]) => (
              <Link
                key={category}
                href={`${boardHref}&category=${encodeURIComponent(category)}`}
                className="group inline-flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/60"
              >
                {category}
                <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">
                  {n}
                </span>
              </Link>
            ))}
          </div>
          {types.length > 0 ? (
            <p className="mt-3 text-xs text-ink-500">
              Contract types open now:{" "}
              {types.map(([type, n], index) => (
                <span key={type}>
                  {index > 0 ? " · " : ""}
                  <span className="font-medium text-ink-700">{type}</span> ({n})
                </span>
              ))}
            </p>
          ) : null}
        </section>
      ) : null}

      {latest.length > 0 ? (
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Latest roles in {state.label}
            </h2>
            <Link href={boardHref} className="text-xs font-semibold text-brand-700 hover:underline">
              View all {count} on the board
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {latest.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900 group-hover:text-brand-700">
                    {job.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {job.company} · {job.city || state.capital} · {job.category}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-700">
                    <Wallet className="size-3.5 text-brand-600" aria-hidden="true" />
                    {salaryLabel(job.salaryMin, job.salaryMax)}
                  </span>
                  <span className="text-[11px] text-ink-400">{timeAgo(job.postedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-ink-900">
            How hiring works in {state.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{state.blurb}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            Applications in {state.label} go through the same three gates as anywhere else in
            Nigeria: the CV screen, the interview, and verification of your certificates and NYSC
            discharge. Where {state.name} differs is the queue — a role advertised in{" "}
            {state.capital} often draws candidates from the whole {state.zone} region, so apply the
            day it is posted and make the first paragraph of your CV match the job title.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            Watch for the standard traps: adverts that ask for a fee, “processing charges” for a
            licence or certificate, and employers who will not name the company. No legitimate
            employer in {state.name} needs money from you to consider your application.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            If you are applying from outside the state, say so plainly and give a date you can
            resume. Recruiters here read that as reliability, not distance.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/cv-writing" className="btn btn-outline">
              Get a CV that survives the screen
            </Link>
            <Link href={boardHref} className="btn btn-outline">
              Browse {state.label} jobs
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-ink-900">Nearby states</h2>
            <ul className="mt-3 space-y-1.5">
              {neighbours.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/states/${entry.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-700 transition hover:bg-brand-50/70 hover:text-brand-800"
                  >
                    <span>Jobs in {entry.label}</span>
                    <ChevronRight className="size-3.5 text-ink-300 group-hover:text-brand-600" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/states"
              className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline"
            >
              All 36 states and the FCT
            </Link>
          </div>

          <div className="rounded-2xl bg-ink-950 p-5 text-white">
            <p className="font-display text-base font-bold">
              {count > 0 ? "Be first in the queue" : "No roles today — yet"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">
              {count > 0
                ? `New ${state.label} vacancies land throughout the week. Pro sends them to your WhatsApp the moment they are verified.`
                : `We check the board every day. Pro tells you the moment a verified employer posts in ${state.name}.`}
            </p>
            <Link href="/pro" className="btn btn-primary mt-3 w-full justify-center">
              Set up alerts
            </Link>
          </div>
        </aside>
      </section>

      <section className="mt-6 card p-5">
        <h2 className="font-display text-base font-bold text-ink-900">
          Other states in the {state.zone}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATE_PAGES.filter((entry) => entry.zone === state.zone && entry.slug !== state.slug).map(
            (entry) => (
              <Link
                key={entry.slug}
                href={`/states/${entry.slug}`}
                className="chip hover:border-brand-300 hover:text-brand-700"
              >
                {entry.label}
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
