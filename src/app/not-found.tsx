import { ArrowRight, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900">
        This page has moved on
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
        The role you are looking for may have closed or been filled. Browse thousands of verified
        Nigerian openings instead.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link href="/jobs" className="btn btn-primary">
          Browse all jobs
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
