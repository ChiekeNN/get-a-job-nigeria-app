export default function JobsLoading() {
  return (
    <div className="wrap py-8 sm:py-10">
      <div className="h-4 w-40 animate-pulse rounded bg-ink-100" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-ink-100 sm:w-1/2" />
      <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[286px_minmax(0,1fr)]">
        <div className="hidden h-[420px] animate-pulse rounded-2xl bg-ink-100/70 lg:block" />
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-ink-100/70" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[190px] animate-pulse rounded-2xl bg-ink-100/70" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading verified Nigerian jobs…</span>
    </div>
  );
}
