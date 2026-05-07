export default function ProfileLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Banner */}
      <div className="h-40 bg-slate-100 sm:h-52" />
      <div className="container-shell -mt-12 pb-8">
        {/* Avatar */}
        <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200" />
        <div className="mt-4 h-7 w-48 rounded-lg bg-slate-100" />
        <div className="mt-2 h-4 w-32 rounded bg-slate-50" />
        {/* Bio skeleton */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full rounded bg-slate-50" />
          <div className="h-4 w-3/4 rounded bg-slate-50" />
        </div>
      </div>
    </div>
  );
}
