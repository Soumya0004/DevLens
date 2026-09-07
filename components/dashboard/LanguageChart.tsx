export function LanguageChart({ language }: { language: string | null }) {
  return (
    <div className="space-y-4">
      {language ? <div>
        <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
          <span>{language}</span>
          <span className="font-semibold">Primary language</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100">
          <div className="h-full w-full rounded-full bg-slate-950" />
        </div>
      </div> : <p className="text-sm text-slate-500">Analyze a repository to see language data.</p>}
    </div>
  );
}
