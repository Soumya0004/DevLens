import type { AnalysisScore } from "@/types/analysis";

export function HealthScore({ result }: { result?: AnalysisScore }) {
  const metrics = result ? [
    ["Code quality", result.codeQuality, "bg-slate-950"],
    ["Documentation", result.documentation, "bg-slate-700"],
    ["Security", result.security, "bg-slate-500"],
    ["Activity", result.activity, "bg-slate-400"],
  ] as const : [];

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-slate-200 bg-white">
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-950">{result?.overall ?? "--"}</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Score</p>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {metrics.length ? metrics.map(([label, value, color]) => <div key={label}>
          <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
            <span>{label}</span>
            <span className="font-semibold">{value}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
          </div>
        </div>) : <p className="text-sm text-slate-500">Analyze a repository to see health details.</p>}
      </div>
    </div>
  );
}
