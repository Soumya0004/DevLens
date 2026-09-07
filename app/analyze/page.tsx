"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ExternalLink, GitCommit, GitPullRequest, Search, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeGithubUrl } from "@/lib/utils/github-url";
import type { AnalysisScore, Recommendation } from "@/types/analysis";

type GithubRepository = { full_name: string; name: string; html_url: string };

const severityOrder: Record<Recommendation["severity"], number> = { high: 0, medium: 1, low: 2 };

function formatDate(value: string) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AnalyzePage() {
  const router = useRouter();
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [repoInput, setRepoInput] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [result, setResult] = useState<AnalysisScore | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [repoLoadMessage, setRepoLoadMessage] = useState("");

  useEffect(() => {
    async function loadRepos() {
      try {
        const response = await fetch("/api/github/repos");
        if (!response.ok) {
          if (response.status === 401) {
            setRepoLoadMessage("Your GitHub repository list is unavailable. Paste a public GitHub URL to continue.");
            return;
          }
          throw new Error("GitHub repositories could not be loaded");
        }
        const data = await response.json();
        setRepos(data);
        if (data[0]) {
          setSelectedRepo(data[0].full_name);
          setRepoInput(data[0].html_url);
        }
      } catch (err) {
        setRepoLoadMessage(err instanceof Error ? err.message : "GitHub repositories could not be loaded");
      } finally {
        setLoadingRepos(false);
      }
    }

    loadRepos();
  }, []);

  const resolveRepo = () => {
    const raw = repoInput.trim() || selectedRepo.trim();
    if (!raw) {
      return null;
    }

    const parsed = normalizeGithubUrl(raw);
    if (parsed) {
      return `${parsed.owner}/${parsed.repo}`;
    }

    const cleaned = raw
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\.git$/i, "")
      .replace(/\/$/, "");

    if (cleaned.includes("/")) {
      return cleaned;
    }

    return null;
  };

  const handleAnalyze = async () => {
    const resolvedRepo = resolveRepo();
    if (!resolvedRepo) {
      setError("Enter a valid GitHub URL like https://github.com/owner/repo or choose a repo.");
      return;
    }

    const [owner, repo] = resolvedRepo.split("/");
    if (!owner || !repo) {
      setError("Repository format is invalid. Use owner/repo or a GitHub URL.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner, repo }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login?next=%2Fanalyze");
          return;
        }
        throw new Error(data?.error || `Analysis failed (${response.status})`);
      }

      setResult(data);
      setSelectedRepo(resolvedRepo);
      setRepoInput(`https://github.com/${resolvedRepo}`);
      if (data.persisted) {
        router.push("/dashboard");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The repository could not be analyzed right now.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Analyze</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">Inspect a GitHub repository</h1>
          <p className="mx-auto max-w-2xl text-slate-600">
            Paste the GitHub URL, or choose a repo from your account, and DevLens will score the project health.
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <CardHeader>
            <CardTitle>Repository input</CardTitle>
            <CardDescription>Enter a GitHub URL or pick a repo from your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={repoInput}
                onChange={(event) => setRepoInput(event.target.value)}
                placeholder="https://github.com/vercel/next.js"
                className="h-12 flex-1"
              />
              <Button className="h-12 gap-2 px-5" onClick={handleAnalyze} disabled={analyzing}>
                <Search className="h-4 w-4" />
                {analyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>

            {repos.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Or use a repo from GitHub</p>
                <select
                  value={selectedRepo}
                  onChange={(event) => {
                    setSelectedRepo(event.target.value);
                    setRepoInput(`https://github.com/${event.target.value}`);
                  }}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  disabled={loadingRepos || repos.length === 0}
                >
                  {loadingRepos ? (
                    <option value="">Loading repositories...</option>
                  ) : (
                    repos.map((repo) => (
                      <option key={repo.full_name} value={repo.full_name}>
                        {repo.full_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ) : null}

            {repoLoadMessage ? <p className="text-sm text-slate-500">{repoLoadMessage}</p> : null}

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Quality</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Security</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Documentation</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Activity</span>
            </div>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-5">
            <Card className="overflow-hidden border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <CardHeader className="border-b border-slate-100 bg-slate-950 text-white">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <CardTitle className="text-2xl">{result.repository.name}</CardTitle>
                    <CardDescription className="mt-2 text-slate-300">
                      {result.repository.description || "Repository health overview"}
                      {result.savedAt ? ` · Saved to database ${formatDate(result.savedAt)}` : ""}
                    </CardDescription>
                  </div>
                  <a href={result.repository.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-slate-300">
                    View on GitHub <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                {result.persisted === false || result.saveWarning ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{result.saveWarning ?? "This analysis was not saved to history."}</p> : null}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {result.repository.language ? <span>{result.repository.language}</span> : null}
                  <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {result.repository.stars.toLocaleString()} stars</span>
                  <span>{result.repository.openIssues} open issues</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Forks", result.repository.forks.toLocaleString()],
                    ["Watchers", result.repository.watchers.toLocaleString()],
                    ["Repository size", `${result.repository.size.toLocaleString()} KB`],
                    ["Default branch", result.repository.defaultBranch ?? "Unavailable"],
                    ["Visibility", result.repository.visibility ?? "Unavailable"],
                    ["License", result.repository.license ?? "Not specified"],
                    ["Created", result.repository.createdAt ? formatDate(result.repository.createdAt) : "Unavailable"],
                    ["Updated", result.repository.updatedAt ? formatDate(result.repository.updatedAt) : "Unavailable"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900" title={value}>{value}</p>
                    </div>
                  ))}
                </div>
                {result.repository.topics.length ? (
                  <div className="flex flex-wrap gap-2">
                    {result.repository.topics.map((topic) => (
                      <span key={topic} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{topic}</span>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {[["Overall", result.overall], ["Quality", result.codeQuality], ["Docs", result.documentation], ["Security", result.security], ["Activity", result.activity]].map(([label, score]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-950">{score}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${score}%` }} /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-sky-600" /> README preview</CardTitle>
                <CardDescription>{result.readme?.path ?? "README.md"} from the analyzed repository</CardDescription>
              </CardHeader>
              <CardContent>
                {result.readme ? (
                  <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 font-mono text-xs leading-6 text-slate-700">{result.readme.content}</pre>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No README file was found in this repository.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GitPullRequest className="h-5 w-5 text-violet-600" /> Code review</CardTitle>
                <CardDescription>Recent pull requests and commits, ordered newest first.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Pull requests</h3>
                  {result.codeReview.pullRequests.length ? result.codeReview.pullRequests.map((pull) => (
                    <a key={`${pull.url}-${pull.title}`} href={pull.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3"><p className="font-semibold text-slate-900">{pull.title}</p><span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.15em] ${pull.state === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{pull.state}</span></div>
                      <p className="mt-2 text-xs text-slate-500">{pull.author} · updated {formatDate(pull.updatedAt)}</p>
                    </a>
                  )) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No recent pull requests found.</p>}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Recent commits</h3>
                  {result.codeReview.recentCommits.length ? result.codeReview.recentCommits.map((commit) => (
                    <a key={`${commit.url}-${commit.date}`} href={commit.url} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                      <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><p className="font-semibold text-slate-900">{commit.message}</p><p className="mt-2 text-xs text-slate-500">{commit.author} · {formatDate(commit.date)}</p></div>
                    </a>
                  )) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No recent commits found.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Prioritized recommendations</CardTitle><CardDescription>Start with the highest-impact actions.</CardDescription></div>
                  <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600">Open dashboard <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...result.recommendations].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).map((item: Recommendation) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{item.title}</p><span className="rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-600">{item.severity}</span></div><p className="mt-2 text-sm text-slate-600">{item.description}</p></div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Find weak configuration and risky dependency patterns.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRight className="h-4 w-4 text-sky-600" />
                Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Track activity, recent changes, and maintenance health.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-violet-600" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Get concrete recommendations for engineering teams.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
