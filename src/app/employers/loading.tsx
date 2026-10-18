export default function EmployersLoading() {
  return (
    <div>
      <div className="bg-ink-950 py-12">
        <div className="wrap space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-full max-w-xl animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="wrap grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-ink-100/70" />
        ))}
      </div>
      <span className="sr-only">Loading employer workspace…</span>
    </div>
  );
}
