export function Spinner({ size = 18, label }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="inline-block animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400"
        style={{ width: size, height: size }}
      />
      {label && <span className="text-sm text-zinc-400">{label}</span>}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/[0.02]">
      <div className="aspect-[2/3] animate-pulse bg-zinc-900" />
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-16 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-800" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-900" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-800" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-8 md:px-10">
      <div className="mb-6 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-900" />
        <div className="h-12 w-96 max-w-full animate-pulse rounded bg-zinc-800" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-zinc-900" />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/6 bg-white/[0.02] p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden min-h-[380px] animate-pulse rounded-2xl bg-zinc-900 lg:block" />
          <div className="space-y-5">
            <div className="flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded-xl bg-zinc-800" />
              <div className="h-8 w-24 animate-pulse rounded-xl bg-zinc-800" />
            </div>
            <div className="h-14 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-900" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-900" />
              <div className="h-4 w-8/12 animate-pulse rounded bg-zinc-900" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-900" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
