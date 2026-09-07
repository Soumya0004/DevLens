"use client";

export default function RepositoryError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg shadow-rose-100/50">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Error</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Repository not available</h1>
        <p className="mt-3 text-sm text-slate-600">
          We couldn’t load this repository snapshot. Try again and check that the repository URL is valid.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
