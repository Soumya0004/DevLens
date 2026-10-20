"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, ExternalLink, FileCode2, Folder, GitCommit, GitPullRequest, Search, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YellowHeading } from "@/components/ui/yellow-heading";
import { Input } from "@/components/ui/input";
import { OPEN_LOGIN_EVENT } from "@/components/auth/login-modal";
import { RepositoryArchitectureGraph } from "@/components/analyze/RepositoryArchitectureGraph";
import { normalizeGithubUrl } from "@/lib/utils/github-url";
import type { AnalysisScore, Recommendation } from "@/types/analysis";

type GithubRepository = { full_name: string; name: string; html_url: string };
type StructureNode = { name: string; path: string; type: "file" | "folder" };
type GithubContentItem = { name: string; path: string; type: "file" | "dir" };

function toStructureNodes(contents: GithubContentItem[]): StructureNode[] {
  return contents
    .map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type === "dir" ? "folder" as const : "file" as const,
    }))
    .sort((first, second) => {
      if (first.type !== second.type) return first.type === "folder" ? -1 : 1;
      return first.name.localeCompare(second.name);
    });
}

const severityOrder: Record<Recommendation["severity"], number> = { high: 0, medium: 1, low: 2 };

function formatDate(value: string) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function CodeStructureCard({ repository }: { repository: string }) {
  const [owner, repo] = repository.split("/");
  const [structure, setStructure] = useState<StructureNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStructure() {
      setLoading(true);
      setError("");

      if (!owner || !repo) {
        setError("Repository name is unavailable.");
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ owner, repo });
        const response = await fetch(`/api/github/contents?${params}`, { cache: "no-store" });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Repository structure could not be loaded.");
        }

        if (!cancelled) {
          setStructure(toStructureNodes(Array.isArray(data) ? data : []));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Repository structure could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStructure();
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return (
    <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Folder className="h-5 w-5 text-sky-600" /> Code structure</CardTitle>
        <CardDescription>Browse files and folders in the analyzed repository.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
          <div className="border-b border-[#30363d] px-4 py-3 font-mono text-xs text-[#8b949e]">{repository} /</div>
          {loading ? <p className="px-4 py-5 text-sm text-[#8b949e]">Loading repository files...</p> : null}
          {!loading && error ? <p className="px-4 py-5 text-sm text-amber-300">{error}</p> : null}
          {!loading && !error && structure.length === 0 ? <p className="px-4 py-5 text-sm text-[#8b949e]">No files were found for this repository.</p> : null}
          {!loading && !error && structure.length > 0 ? (
            <div className="divide-y divide-[#30363d]">
              {structure.map((item) => <StructureItem key={item.name} item={item} owner={owner} repo={repo} />)}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function StructureItem({ item, owner, repo, depth = 0 }: { item: StructureNode; owner: string; repo: string; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<StructureNode[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggleFolder() {
    if (item.type !== "folder") return;
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (!nextExpanded || loaded || loading) return;

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ owner, repo, path: item.path });
      const response = await fetch(`/api/github/contents?${params}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Folder contents could not be loaded.");
      }
      setChildren(toStructureNodes(Array.isArray(data) ? data : []));
      setLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Folder contents could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={toggleFolder} aria-expanded={item.type === "folder" ? expanded : undefined} disabled={item.type === "file"} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-[#161b22] disabled:hover:bg-transparent" style={{ paddingLeft: `${16 + depth * 20}px` }}>
        {item.type === "folder" ? <ChevronRight className={`h-4 w-4 text-[#8b949e] transition-transform ${expanded ? "rotate-90" : ""}`} /> : <span className="w-4" />}
        {item.type === "folder" ? <Folder className="h-4 w-4 text-[#58a6ff]" /> : <FileCode2 className="h-4 w-4 text-[#8b949e]" />}
        <span className="font-mono text-[#c9d1d9]">{item.name}</span>
      </button>
      {expanded ? (
        <div className="border-l border-[#30363d]">
          {loading ? <p className="px-4 py-2 text-xs text-[#8b949e]">Loading folder...</p> : null}
          {error ? <p className="px-4 py-2 text-xs text-amber-300">{error}</p> : null}
          {!loading && !error && loaded && children.length === 0 ? <p className="px-4 py-2 text-xs text-[#8b949e]">This folder is empty.</p> : null}
          {children.map((child) => <StructureItem key={child.path} item={child} owner={owner} repo={repo} depth={depth + 1} />)}
        </div>
      ) : null}
    </div>
  );
}

export default function AnalyzePage() {
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [repoInput, setRepoInput] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [result, setResult] = useState<AnalysisScore | null>(null);
  const [graphRevision, setGraphRevision] = useState(0);
  const [visibleCommitCount, setVisibleCommitCount] = useState(4);
  const [analyzing, setAnalyzing] = useState(false);
  const analysisInFlight = useRef(false);
  const [error, setError] = useState("");
  const [repoLoadMessage, setRepoLoadMessage] = useState("");

  useEffect(() => {
    async function loadRepos() {
      try {
        const response = await fetch("/api/github/repos");
        if (!response.ok) {
          if (response.status === 401) {
            setRepoLoadMessage("GitHub authorization is missing or expired. Paste a public URL or reconnect GitHub to load your accessible repositories.");
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
        const initialRepo = new URLSearchParams(window.location.search).get("repo");
        if (initialRepo) {
          setRepoInput(initialRepo);
          setSelectedRepo(initialRepo.replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, ""));
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
    if (analysisInFlight.current) return;
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

    analysisInFlight.current = true;
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
          setError("Sign in and connect GitHub before analyzing a repository.");
          return;
        }
        throw new Error(data?.error || `Analysis failed (${response.status})`);
      }

      setResult(data);
      setGraphRevision((revision) => revision + 1);
      setVisibleCommitCount(4);
      setSelectedRepo(resolvedRepo);
      setRepoInput(`https://github.com/${resolvedRepo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The repository could not be analyzed right now.");
      console.error(err);
    } finally {
      analysisInFlight.current = false;
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] p-6 text-[#c9d1d9] md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#58a6ff]">Analyze</p>
            <YellowHeading className="text-4xl font-bold tracking-tight md:text-5xl">Inspect a GitHub repository</YellowHeading>
          <p className="mx-auto max-w-2xl text-[#8b949e]">
            Paste the GitHub URL, or choose a repo from your account, and DevLens will score the project health.
          </p>
        </div>

        <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3] shadow-lg shadow-black/20">
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

            <div className="space-y-2 border-t border-[#30363d] pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="github-repository" className="text-xs font-medium uppercase tracking-[0.2em] text-[#8b949e]">Choose from your GitHub repositories</label>
                {repoLoadMessage ? <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_LOGIN_EVENT))} className="text-xs font-semibold text-[#58a6ff] hover:text-white">Reconnect GitHub</button> : null}
              </div>
              <select
                id="github-repository"
                value={selectedRepo}
                onChange={(event) => {
                  setSelectedRepo(event.target.value);
                  setRepoInput(event.target.value ? `https://github.com/${event.target.value}` : "");
                  setError("");
                }}
                className="h-11 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                disabled={loadingRepos || repos.length === 0}
              >
                <option value="">{loadingRepos ? "Loading your GitHub repositories..." : repos.length ? "Select a repository to analyze" : "No connected repositories available"}</option>
                {repos.map((repo) => (
                  <option key={repo.full_name} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#8b949e]">Selecting a repository fills the URL above. Your analysis still starts only when you press Analyze.</p>
              {repoLoadMessage ? <p className="text-sm text-[#e3b341]">{repoLoadMessage}</p> : null}
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap gap-2 text-xs text-[#8b949e]">
              <span className="rounded-full bg-[#30363d] px-3 py-1">Quality</span>
              <span className="rounded-full bg-[#30363d] px-3 py-1">Security</span>
              <span className="rounded-full bg-[#30363d] px-3 py-1">Documentation</span>
              <span className="rounded-full bg-[#30363d] px-3 py-1">Activity</span>
            </div>
          </CardContent>
        </Card>

        {analyzing && !result ? <RepositoryArchitectureGraph loading /> : null}

        {result ? (
          <div className="space-y-5">
            <RepositoryArchitectureGraph
              key={graphRevision}
              architecture={result.architecture}
              error={result.architectureError}
              loading={analyzing}
            />
            <Card className="min-w-0 overflow-hidden border-[#30363d] bg-[#161b22] text-[#e6edf3] shadow-lg shadow-black/20">
              <CardHeader className="border-b border-slate-100 bg-slate-950 text-white">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <CardTitle className="wrap-break-word text-2xl">{result.repository.name}</CardTitle>
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

            <CodeStructureCard repository={result.repository.name} />

            <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-sky-600" /> README preview</CardTitle>
                <CardDescription>{result.readme?.path ?? "README.md"} from the analyzed repository</CardDescription>
              </CardHeader>
              <CardContent>
                {result.readme ? (
                  <pre className="readme-preview max-h-128 overflow-auto whitespace-pre-wrap rounded-xl border border-[#30363d] bg-[#0d1117] p-5 font-mono text-xs leading-6 text-[#c9d1d9]">{result.readme.content}</pre>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No README file was found in this repository.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GitPullRequest className="h-5 w-5 text-violet-600" /> Code review</CardTitle>
                <CardDescription>Recent pull requests and commits, ordered newest first.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                {result.codeReview.pullRequests.length ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Pull requests</h3>
                    {result.codeReview.pullRequests.map((pull) => (
                      <a key={`${pull.url}-${pull.title}`} href={pull.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-3"><p className="min-w-0 wrap-break-word font-semibold text-slate-900">{pull.title}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.15em] ${pull.state === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{pull.state}</span></div>
                        <p className="mt-2 text-xs text-slate-500">{pull.author} · updated {formatDate(pull.updatedAt)}</p>
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className={`space-y-3 ${result.codeReview.pullRequests.length ? "" : "lg:col-span-2"}`}>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b949e]">Recent commits</h3>
                  {result.codeReview.recentCommits.length ? result.codeReview.recentCommits.slice(0, visibleCommitCount).map((commit) => (
                    <a key={`${commit.url}-${commit.date}`} href={commit.url} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-[#30363d] bg-[#0d1117] p-4 transition-colors hover:bg-[#1f2937]">
                      <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-[#f2c14e]" /><div className="min-w-0"><p className="wrap-break-word font-semibold text-[#e6edf3]">{commit.message}</p><p className="mt-2 wrap-break-word text-xs text-[#8b949e]">{commit.author} · {formatDate(commit.date)}</p></div>
                    </a>
                  )) : <p className="rounded-xl bg-[#0d1117] p-4 text-sm text-[#8b949e]">No recent commits found.</p>}
                  {result.codeReview.recentCommits.length > 4 ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCommitCount((count) => count >= result.codeReview.recentCommits.length ? 4 : count + 4)}
                      className="w-full rounded-lg border border-[#30363d] px-4 py-2.5 text-sm font-semibold text-[#58a6ff] transition-colors hover:bg-[#161b22]"
                    >
                      {visibleCommitCount >= result.codeReview.recentCommits.length ? "Show less" : "View more"}
                    </button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Prioritized recommendations</CardTitle><CardDescription>Start with the highest-impact actions.</CardDescription></div>
                  <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600">Open dashboard <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...result.recommendations].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).map((item: Recommendation) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><p className="min-w-0 wrap-break-word font-semibold text-slate-900">{item.title}</p><span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-600">{item.severity}</span></div><p className="mt-2 wrap-break-word text-sm text-slate-600">{item.description}</p></div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#238636]/40 bg-[#161b22] text-[#e6edf3]">
              <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3fb950]">Final step</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#e6edf3]">Turn this analysis into a better README.md</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b949e]">Generate an editable README.md from the repository files, project configuration, and analysis.</p>
                </div>
                {result.persisted ? (
                  <Link href={`/readme-suggestion?repo=${encodeURIComponent(selectedRepo)}`} className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#238636] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043]">Create README.md <ArrowRight className="h-4 w-4" /></Link>
                ) : (
                  <span className="max-w-xs text-sm text-[#e3b341]">Save the analysis before creating a README.md.</span>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
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

          <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
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

          <Card className="border-[#30363d] bg-[#161b22] text-[#e6edf3]">
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
