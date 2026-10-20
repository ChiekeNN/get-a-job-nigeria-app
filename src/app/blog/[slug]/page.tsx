import { ArrowLeft, ArrowRight, ChevronRight, Clock, ListTree } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { PostJsonLd } from "@/components/blog/PostJsonLd";
import { Prose, headingId } from "@/components/blog/Prose";
import { ShareRow } from "@/components/blog/ShareRow";
import { HUB_ICONS } from "@/components/blog/hub-icons";
import {
  ALL_POSTS,
  POSTS,
  formatDate,
  getHub,
  getPost,
  nextPost,
  previousPost,
  relatedPosts,
} from "@/data/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.metaTitle,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.description,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const hub = getHub(post.hub);
  const Icon = HUB_ICONS[post.hub];
  const related = relatedPosts(post);
  const next = nextPost(post);
  const previous = previousPost(post);

  // The table of contents is just the h2s the article already has.
  const headings = post.blocks.flatMap((block) =>
    block.kind === "h2" ? [{ text: block.text, id: headingId(block.text) }] : [],
  );

  return (
    <div className="wrap py-6 sm:py-9">
      <PostJsonLd post={post} />
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[11.5px] text-ink-400">
        <Link href="/" className="hover:text-ink-700">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link href="/blog" className="hover:text-ink-700">
          Advice
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link href={`/blog/topic/${hub.id}`} className="hover:text-ink-700">
          {hub.name}
        </Link>
      </nav>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="mt-4 max-w-3xl">
        <Link
          href={`/blog/topic/${hub.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700 transition hover:bg-brand-100"
        >
          <Icon className="size-3" aria-hidden="true" />
          {hub.name}
        </Link>

        <h1 className="mt-3 font-display text-[27px] font-extrabold leading-[1.12] tracking-tight text-ink-900 sm:text-[40px]">
          {post.title}
        </h1>

        <p className="mt-3 text-[14px] leading-relaxed text-ink-500 sm:text-[15.5px]">
          {post.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-ink-100 pt-3.5 text-[11.5px] text-ink-400">
          <span className="font-semibold text-ink-700">{post.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.published}>{formatDate(post.published)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            {post.minutes} min read
          </span>
          {post.updated ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Updated {formatDate(post.updated)}</span>
            </>
          ) : null}
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px] lg:items-start lg:gap-10">
        <article className="min-w-0 max-w-[720px]">
          <Prose blocks={post.blocks} />
          <div className="mt-8">
            <ShareRow title={post.title} />
          </div>

          {/* ── Next / previous ─────────────────────────────────────── */}
          <nav className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="More articles">
            {previous ? (
              <Link
                href={`/blog/${previous.slug}`}
                className="card group min-w-0 p-3.5 transition hover:border-brand-300"
              >
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
                  <ArrowLeft className="size-3" aria-hidden="true" />
                  Previous
                </span>
                <p className="mt-1 line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink-800 group-hover:text-brand-800">
                  {previous.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="card group min-w-0 p-3.5 text-right transition hover:border-brand-300"
              >
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
                  Next
                  <ArrowRight className="size-3" aria-hidden="true" />
                </span>
                <p className="mt-1 line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink-800 group-hover:text-brand-800">
                  {next.title}
                </p>
              </Link>
            ) : null}
          </nav>
        </article>

        {/* ── Contents ───────────────────────────────────────────────── */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
              <ListTree className="size-3.5" aria-hidden="true" />
              On this page
            </p>
            <ol className="mt-2.5 space-y-1.5">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className="block text-[12px] leading-snug text-ink-500 transition hover:text-brand-700"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="card mt-3 p-4">
            <p className="text-[12px] font-bold text-ink-900">Looking for the jobs themselves?</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
              Every role on the board shows the employer, the location and the salary where it was
              disclosed.
            </p>
            <Link href="/jobs" className="btn btn-primary btn-sm mt-3 w-full justify-center">
              Browse jobs
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>

      {/* ── Related ──────────────────────────────────────────────────── */}
      {related.length ? (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-2">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              More on {hub.name.toLowerCase()}
            </h2>
            <Link
              href={`/blog/topic/${hub.id}`}
              className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-900"
            >
              All
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Back to the index ────────────────────────────────────────── */}
      <div className="mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All advice ({ALL_POSTS.length} guides)
        </Link>
      </div>
    </div>
  );
}
