export default function RepositoryLoading() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="h-80 rounded-xl bg-slate-200" />
          <div className="h-80 rounded-xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
