"use client";

import { ChevronDown, Database, ExternalLink, Loader2, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisSnapshot } from "@/types/analysis";

export default function DatabasePage() {
  const [snapshots, setSnapshots] = useState<AnalysisSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "score">("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadSnapshots(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
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
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const loadId = window.setTimeout(() => {
      void loadSnapshots();
    }, 0);
    return () => window.clearTimeout(loadId);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSnapshots = snapshots
    .filter((snapshot) => {
      const matchesQuery = !normalizedQuery || `${snapshot.owner}/${snapshot.repo}`.toLowerCase().includes(normalizedQuery);
      const score = snapshot.result.overall;
      const matchesScore = scoreFilter === "all"
        || (scoreFilter === "strong" && score >= 70)
        || (scoreFilter === "review" && score < 70);
      return matchesQuery && matchesScore;
    })
    .sort((a, b) => {
      if (sortOrder === "score") return b.result.overall - a.result.overall;
      const difference = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "newest" ? difference : -difference;
    });

  const averageScore = snapshots.length
    ? Math.round(snapshots.reduce((total, snapshot) => total + snapshot.result.overall, 0) / snapshots.length)
    : 0;
  const repositoryCount = new Set(snapshots.map((snapshot) => `${snapshot.owner}/${snapshot.repo}`)).size;

  return (
    <main className="min-h-screen bg-[#0d1117] p-5 text-[#c9d1d9] md:p-10">
      <div className="mx-auto max-w-350 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#58a6ff]">Database</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#e6edf3]">Saved project intelligence</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#8b949e]">Browse every persisted snapshot and open a record to inspect the complete analysis payload.</p>
          </div>
          <button type="button" onClick={() => loadSnapshots(true)} disabled={loading || refreshing} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#238636] px-3 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:opacity-60">
            <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh data
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          {[{ label: "Saved snapshots", value: snapshots.length }, { label: "Repositories", value: repositoryCount }, { label: "Average score", value: snapshots.length ? `${averageScore}/100` : "--" }].map((stat) => (
            <div key={stat.label} className="border border-[#30363d] bg-[#161b22] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b949e]">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-[#e6edf3]">{stat.value}</p>
            </div>
          ))}
        </section>

        <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-[#e6edf3]"><Database className="h-5 w-5 text-[#58a6ff]" /> Analysis snapshots</CardTitle>
                <CardDescription>{visibleSnapshots.length} of {snapshots.length} records shown</CardDescription>
              </div>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row lg:shrink-0">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#748093]" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a repository" className="h-9 w-full rounded-lg border border-[#30363d] bg-[#0d1117] pl-9 pr-3 text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff] sm:w-52" />
                </label>
                <label className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#748093]" />
                  <select value={scoreFilter} onChange={(event) => setScoreFilter(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-[#30363d] bg-[#0d1117] pl-9 pr-8 text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff]">
                    <option value="all">All scores</option><option value="strong">70 and above</option><option value="review">Needs review</option>
                  </select>
                </label>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)} className="h-9 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff]">
                  <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="score">Highest score</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 p-5 text-sm text-[#8b949e]"><Loader2 className="h-4 w-4 animate-spin" /> Loading database records...</div>
            ) : snapshots.length === 0 ? (
              <p className="rounded-lg border border-[#d29922]/30 bg-[#d29922]/10 p-5 text-sm text-[#e3b341]">{message || "No saved analyses yet. Analyze a repository first."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-left text-sm">
                  <thead className="border-b border-[#30363d] text-xs uppercase tracking-wider text-[#8b949e]">
                    <tr><th className="px-3 py-3">Repository</th><th className="px-3 py-3">Health</th><th className="px-3 py-3">Quality</th><th className="px-3 py-3">Activity</th><th className="px-3 py-3">Saved</th><th className="px-3 py-3"><span className="sr-only">Open</span></th></tr>
                  </thead>
                  <tbody>
                    {visibleSnapshots.map((snapshot) => (
                      <Fragment key={snapshot.id}>
                      <tr key={snapshot.id} className="border-b border-[#30363d] last:border-0">
                        <td className="max-w-56 px-3 py-4 font-semibold text-[#e6edf3]"><a href={snapshot.result.repository.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 wrap-break-word hover:text-[#58a6ff]">{snapshot.owner}/{snapshot.repo}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></td>
                        <td className="px-3 py-4 font-bold text-[#e6edf3]">{snapshot.result.overall}/100</td>
                        <td className="px-3 py-4 text-[#8b949e]">{snapshot.result.codeQuality}/100</td>
                        <td className="px-3 py-4 text-[#8b949e]">{snapshot.result.activity}/100</td>
                        <td className="px-3 py-4 text-[#8b949e]">{new Date(snapshot.created_at).toLocaleString()}</td>
                        <td className="px-3 py-4 text-right"><button type="button" onClick={() => setExpandedId(expandedId === snapshot.id ? null : snapshot.id)} aria-expanded={expandedId === snapshot.id} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#58a6ff] hover:bg-[#30363d]"><ChevronDown className={`h-4 w-4 transition-transform ${expandedId === snapshot.id ? "rotate-180" : ""}`} /> {expandedId === snapshot.id ? "Close" : "Details"}</button></td>
                      </tr>
                      {expandedId === snapshot.id ? <tr><td colSpan={6} className="px-3 pb-5"><div className="grid gap-4 rounded-lg bg-[#18243a] p-4 text-xs text-slate-200 md:grid-cols-2"><div><p className="mb-2 font-semibold uppercase tracking-wider text-[#f2c14e]">Repository</p><p>{snapshot.result.repository.description || "No description"}</p><p className="mt-2">{snapshot.result.repository.language || "Unknown language"} · {snapshot.result.repository.visibility || "Unknown visibility"} · {snapshot.result.repository.defaultBranch || "Unknown branch"}</p><p className="mt-2">{snapshot.result.repository.stars} stars · {snapshot.result.repository.forks} forks · {snapshot.result.repository.openIssues} open issues</p><p className="mt-2">Topics: {snapshot.result.repository.topics.length ? snapshot.result.repository.topics.join(", ") : "None"}</p></div><div><p className="mb-2 font-semibold uppercase tracking-wider text-[#f2c14e]">Analysis</p><p>Documentation: {snapshot.result.documentation}/100 · Security: {snapshot.result.security}/100</p><p className="mt-2">Pull requests: {snapshot.result.codeReview.pullRequests.length} · Commits: {snapshot.result.codeReview.recentCommits.length}</p><p className="mt-2">Recommendations: {snapshot.result.recommendations.length}</p></div><pre className="max-h-64 overflow-auto whitespace-pre-wrap border-t border-slate-700 pt-3 text-[11px] leading-5 text-slate-300 md:col-span-2">{JSON.stringify(snapshot.result, null, 2)}</pre></div></td></tr> : null}
                      </Fragment>
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
