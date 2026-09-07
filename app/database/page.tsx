"use client";

import { Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisSnapshot } from "@/types/analysis";

export default function DatabasePage() {
  const [snapshots, setSnapshots] = useState<AnalysisSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSnapshots() {
      try {
        const response = await fetch("/api/analysis/history", { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Saved analysis data could not be loaded.");
        setSnapshots(data.snapshots ?? []);
        setMessage(data.message ?? "");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Saved analysis data could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadSnapshots();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Database</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your saved analysis data</h1>
          <p className="mt-2 text-sm text-slate-600">Every row belongs to the signed-in user and identifies the repository that was analyzed.</p>
        </header>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-sky-600" /> Analysis snapshots</CardTitle>
            <CardDescription>{snapshots.length} saved {snapshots.length === 1 ? "analysis" : "analyses"}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 p-5 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading database records...</div>
            ) : snapshots.length === 0 ? (
              <p className="rounded-lg bg-amber-50 p-5 text-sm text-amber-800">{message || "No saved analyses yet. Analyze a repository first."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <tr><th className="px-3 py-3">Repository</th><th className="px-3 py-3">User ID</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Saved</th></tr>
                  </thead>
                  <tbody>
                    {snapshots.map((snapshot) => (
                      <tr key={snapshot.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-4 font-semibold text-slate-900">{snapshot.owner}/{snapshot.repo}</td>
                        <td className="px-3 py-4 font-mono text-xs text-slate-500">{snapshot.user_id}</td>
                        <td className="px-3 py-4 font-bold text-slate-900">{snapshot.result.overall}/100</td>
                        <td className="px-3 py-4 text-slate-500">{new Date(snapshot.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
