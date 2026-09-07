"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, GitBranch, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { CommitChart } from "@/components/dashboard/CommitChart";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { LanguageChart } from "@/components/dashboard/LanguageChart";
import { StatCard } from "@/components/dashboard/StatCard";
import type { AnalysisSnapshot } from "@/types/analysis";

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLatestAnalysis() {
      try {
        const response = await fetch("/api/analysis/history", { cache: "no-store" });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          setMessage(errorData?.error || "Saved analysis data could not be loaded.");
          setSnapshot(null);
          return;
        }
        const data = await response.json();
        setSnapshot(data.snapshots?.[0] ?? null);
        setMessage(data.message ?? "");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Saved analysis data could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadLatestAnalysis();

    const handleWindowFocus = () => {
      loadLatestAnalysis();
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, []);

  const result = snapshot?.result;
  const healthScore = result?.overall ?? null;

  return (
    <main className="min-h-screen bg-[#f4f5f0] p-5 md:p-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3559e0]">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#17221f]">
              {result?.repository.name ?? "Repository intelligence"}
            </h1>
          </div>
          <Link href="/analyze" className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#17221f] px-2.5 text-sm font-medium text-white transition hover:bg-[#3559e0]">
            <Sparkles size={16} />
            Analyze repo
          </Link>
        </header>

        {message ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col gap-3 p-5 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <p>{message}</p>
              <Link href="/analyze" className="font-semibold underline underline-offset-4">Analyze a repository</Link>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Stars"
            value={result ? String(result.repository.stars) : "--"}
            change={result ? "Analyzed" : "No data"}
            icon={<GitBranch className="h-4 w-4" />}
          />
          <StatCard
            title="Health score"
            value={loading ? "--" : healthScore === null ? "--" : `${healthScore}/100`}
            change={result ? "Analyzed" : "No data"}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <StatCard
            title="Forks"
            value={result ? String(result.repository.forks) : "--"}
            change={result ? "Analyzed" : "No data"}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Open issues"
            value={result ? String(result.repository.openIssues) : "--"}
            change={result ? "Analyzed" : "No data"}
            icon={<Activity className="h-4 w-4" />}
            tone="danger"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="border-[#dce3dc] bg-white/80">
            <CardHeader>
              <CardTitle>Project health</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthScore result={result} />
            </CardContent>
          </Card>

          <Card className="border-[#dce3dc] bg-white/80">
            <CardHeader>
              <CardTitle>Language mix</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageChart language={result?.repository.language ?? null} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-[#dce3dc] bg-white/80">
            <CardHeader>
              <CardTitle>Commit activity</CardTitle>
            </CardHeader>
            <CardContent>
              <CommitChart commits={result?.codeReview.recentCommits ?? []} />
            </CardContent>
          </Card>

          <Card className="border-[#dce3dc] bg-white/80">
            <CardHeader>
              <CardTitle>Developer activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart commits={result?.codeReview.recentCommits ?? []} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
