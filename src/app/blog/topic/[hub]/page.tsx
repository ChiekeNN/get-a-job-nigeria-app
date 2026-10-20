import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { HUB_ICONS } from "@/components/blog/hub-icons";
import { BLOG_HUBS, getHub, postsInHub, type HubId } from "@/data/blog";

interface Props {
  params: Promise<{ hub: string }>;
}

function isHub(value: string): value is HubId {
  return BLOG_HUBS.some((hub) => hub.id === value);
}

export function generateStaticParams() {
  return BLOG_HUBS.map((hub) => ({ hub: hub.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub: id } = await params;
  if (!isHub(id)) return { title: "Topic not found" };
  const hub = getHub(id);

  return {
    title: `${hub.name} — ${hub.tagline}`,
    description: hub.description,
    alternates: { canonical: `/blog/topic/${hub.id}` },
  };
}

export default async function HubPage({ params }: Props) {
  const { hub: id } = await params;
  if (!isHub(id)) notFound();

  const hub = getHub(id);
  const posts = postsInHub(hub.id);
  const Icon = HUB_ICONS[hub.id];
  const others = BLOG_HUBS.filter((item) => item.id !== hub.id);

  return (
    <>
      <section className="border-b border-ink-100 bg-gradient-to-b from-brand-50/70 to-white">
        <div className="wrap py-8 sm:py-11">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500 transition hover:text-brand-700"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All advice
          </Link>

          <div className="mt-3 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-700">
                {hub.audience} · {posts.length} {posts.length === 1 ? "guide" : "guides"}
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                {hub.name}
              </h1>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-500">
                {hub.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap mt-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      <section className="wrap mt-12">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900">
          Other topics
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => {
            const OtherIcon = HUB_ICONS[item.id];
            return (
              <Link
                key={item.id}
                href={`/blog/topic/${item.id}`}
                className="card group flex items-center gap-2.5 p-3.5 transition hover:border-brand-300"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-600 group-hover:bg-brand-50 group-hover:text-brand-700">
                  <OtherIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold text-ink-900">{item.name}</span>
                  <span className="block truncate text-[11px] text-ink-400">{item.tagline}</span>
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-ink-300 group-hover:text-brand-600" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
