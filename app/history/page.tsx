"use client";

import { Activity, Clock3, Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisSnapshot } from "@/types/analysis";

function scoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  return "Needs review";
}

export default function HistoryPage() {
  const [snapshots, setSnapshots] = useState<AnalysisSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/analysis/history", { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || "Analysis history could not be loaded.");
        }
        setSnapshots(data.snapshots ?? []);
        if (data.setupRequired) {
          setError(data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis history could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">History</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Recent analyses</h1>
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Repository scan history</CardTitle>
            <CardDescription>Track how your projects evolve over time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading saved analyses...
              </div>
            ) : error ? (
              <p className="rounded-xl bg-rose-50 p-5 text-sm text-rose-700">{error}</p>
            ) : snapshots.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                <Database className="h-4 w-4" /> No saved analyses yet. Analyze a repository to create the first snapshot.
              </div>
            ) : snapshots.map((snapshot) => (
              <details key={snapshot.id} className="rounded-xl border border-slate-200 p-4">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{snapshot.owner}/{snapshot.repo}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Clock3 className="h-3 w-3" />
                        {new Date(snapshot.created_at).toLocaleString()}
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">User ID: {snapshot.user_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
                      <p className="text-xl font-bold text-slate-950">{snapshot.result.overall}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {scoreLabel(snapshot.result.overall)}
                    </div>
                  </div>
                </summary>
                <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-200">
                  {JSON.stringify(snapshot.result, null, 2)}
                </pre>
              </details>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
