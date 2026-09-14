import { YellowLineLoader } from "@/components/ui/yellow-line-loader";

export default function AnalyzeLoading() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl animate-pulse space-y-8">
        <YellowLineLoader label="Preparing analysis" />
        <div className="h-12 w-72 rounded bg-slate-200 mx-auto" />
        <div className="h-48 rounded-xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
