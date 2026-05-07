export default function AssociationsLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="container-shell py-8">
        <div className="h-8 w-64 rounded-lg bg-slate-100" />
        <div className="mt-2 h-4 w-96 rounded bg-slate-50" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-32 rounded bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
