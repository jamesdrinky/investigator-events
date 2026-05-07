export default function AssociationPageLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-48 bg-slate-100 sm:h-64" />
      <div className="container-shell -mt-8 pb-8">
        <div className="flex items-end gap-4">
          <div className="h-20 w-20 rounded-2xl border-4 border-white bg-slate-200" />
          <div>
            <div className="h-7 w-48 rounded-lg bg-slate-100" />
            <div className="mt-2 h-4 w-32 rounded bg-slate-50" />
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-slate-50" />
          <div className="h-4 w-full rounded bg-slate-50" />
          <div className="h-4 w-2/3 rounded bg-slate-50" />
        </div>
      </div>
    </div>
  );
}
