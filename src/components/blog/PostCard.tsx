import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";

import { HUB_ICONS } from "@/components/blog/hub-icons";
import { formatDate, getHub, type Post } from "@/data/blog";

interface Props {
  post: Post;
  /** "wide" is the featured card at the top of the index. */
  variant?: "default" | "wide";
}

export function PostCard({ post, variant = "default" }: Props) {
  const hub = getHub(post.hub);
  const Icon = HUB_ICONS[post.hub];
  const wide = variant === "wide";

  return (
    <article
      className={`card group flex min-w-0 flex-col overflow-hidden transition hover:border-brand-300 hover:shadow-[0_24px_50px_-38px_rgba(5,20,15,0.6)] ${
        wide ? "sm:flex-row" : ""
      }`}
    >
      {wide ? (
        <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-ink-950 sm:block">
          <div
            className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-12 right-0 size-40 rounded-full bg-amber-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex h-full flex-col justify-between p-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-300">
              <Icon className="size-3" aria-hidden="true" />
              {hub.name}
            </span>
            <p className="font-display text-[15px] font-bold leading-snug text-white/85">
              {hub.tagline}
              <span className="mt-1 block text-[12px] font-normal text-white/45">
                {hub.description.split(".")[0]}.
              </span>
            </p>
          </div>
        </div>
      ) : null}

      <div className={`flex min-w-0 flex-1 flex-col ${wide ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}>
        {!wide ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">
            <Icon className="size-3" aria-hidden="true" />
            {hub.name}
          </span>
        ) : null}

        <h3
          className={`mt-2.5 font-display font-extrabold leading-snug tracking-tight text-ink-900 ${
            wide ? "text-[22px] sm:text-[28px]" : "text-[15.5px]"
          }`}
        >
          <Link href={`/blog/${post.slug}`} className="transition group-hover:text-brand-800">
            {post.title}
          </Link>
        </h3>

        <p
          className={`mt-1.5 flex-1 leading-relaxed text-ink-500 ${
            wide ? "text-[13.5px]" : "text-[12.5px]"
          }`}
        >
          {post.excerpt}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
          <time dateTime={post.published}>{formatDate(post.published)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            {post.minutes} min read
          </span>
          <Link
            href={`/blog/${post.slug}`}
            className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-700 transition group-hover:text-brand-900"
            aria-label={`Read ${post.title}`}
          >
            Read
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
