export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="h-72 rounded-xl bg-slate-200" />
          <div className="h-72 rounded-xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
