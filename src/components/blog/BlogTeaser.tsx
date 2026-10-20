import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

import { HOMEPAGE_POSTS, formatDate, getHub } from "@/data/blog";

/**
 * A compact strip on the homepage. Three guides, each pointing at a post that
 * points at a product — which is how the advice section earns its place.
 */
export function BlogTeaser() {
  return (
    <section className="wrap mt-12 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="eyebrow">
            <BookOpen className="size-3.5 text-brand-600" aria-hidden="true" />
            GetAJob advice
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Before you apply, read this
          </h2>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-500">
            Straight answers on CVs, interviews, salary and job scams — written for Nigeria, not
            translated from somewhere else.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-brand-700 hover:text-brand-900"
        >
          All advice
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {HOMEPAGE_POSTS.map((post) => {
          const hub = getHub(post.hub);
          return (
            <article
              key={post.slug}
              className="card group flex min-w-0 flex-col p-4 transition hover:border-brand-300"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">
                {hub.name}
              </span>
              <h3 className="mt-2 font-display text-[14.5px] font-bold leading-snug text-ink-900">
                <Link href={`/blog/${post.slug}`} className="transition group-hover:text-brand-800">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-500">{post.excerpt}</p>
              <div className="mt-3 flex items-center gap-2 text-[10.5px] text-ink-400">
                <time dateTime={post.published}>{formatDate(post.published)}</time>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" aria-hidden="true" />
                  {post.minutes} min
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
