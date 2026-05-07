export default function DirectoryLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="container-shell py-8">
        <div className="h-8 w-48 rounded-lg bg-slate-100" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
              <div className="h-10 w-10 rounded-full bg-slate-100" />
              <div className="flex-1">
                <div className="h-4 w-28 rounded bg-slate-100" />
                <div className="mt-1.5 h-3 w-20 rounded bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
