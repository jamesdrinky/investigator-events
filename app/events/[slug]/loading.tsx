export default function EventLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero image skeleton */}
      <div className="h-[22rem] w-full bg-slate-200 sm:h-[36rem]" />
      <div className="container-shell py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {/* Date / location / organiser */}
            <div className="flex gap-4">
              <div className="h-16 w-40 rounded-xl bg-slate-100" />
              <div className="h-16 w-40 rounded-xl bg-slate-100" />
              <div className="h-16 w-32 rounded-xl bg-slate-100" />
            </div>
            {/* Description */}
            <div className="mt-8 space-y-3">
              <div className="h-6 w-48 rounded-lg bg-slate-100" />
              <div className="h-4 w-full rounded bg-slate-50" />
              <div className="h-4 w-full rounded bg-slate-50" />
              <div className="h-4 w-3/4 rounded bg-slate-50" />
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="hidden lg:block">
            <div className="h-64 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
