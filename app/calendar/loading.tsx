export default function CalendarLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="container-shell py-6">
        {/* Filter bar skeleton */}
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-xl bg-slate-100" />
          ))}
        </div>
        {/* Calendar grid skeleton */}
        <div className="mt-6 grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-slate-50 sm:h-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
