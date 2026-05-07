export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 bg-slate-100 sm:h-80" />
      <div className="container-shell py-8">
        <div className="h-8 w-2/3 rounded-lg bg-slate-100" />
        <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
