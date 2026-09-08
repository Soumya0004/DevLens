"use client";

import Link from "next/link";
import { ArrowLeft, Check, Clipboard, Download, FileText, GitBranch, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import type { AnalysisSnapshot } from "@/types/analysis";

function buildReadme(snapshot: AnalysisSnapshot) {
  const { result } = snapshot;
  const repository = result.repository;
  const recommendations = result.recommendations
    .map((recommendation) => `- **${recommendation.title}:** ${recommendation.description}`)
    .join("\n");
  const topics = repository.topics.length ? repository.topics.map((topic) => `\`${topic}\``).join(" ") : "`github`";

  return `# ${repository.name}\n\n${repository.description || "A GitHub project analyzed with DevLens."}\n\n![Health score](https://img.shields.io/badge/health-${result.overall}%2F100-${result.overall >= 70 ? "1d8a82" : "e7654b"})\n\n## Overview\n\n${repository.name} is a ${repository.visibility || "repository"} project${repository.language ? ` built with ${repository.language}` : ""}. This README was suggested from its latest DevLens analysis.\n\n- **Health:** ${result.overall}/100\n- **Code quality:** ${result.codeQuality}/100\n- **Documentation:** ${result.documentation}/100\n- **Security:** ${result.security}/100\n- **Activity:** ${result.activity}/100\n- **Default branch:** ${repository.defaultBranch || "main"}\n- **License:** ${repository.license || "Not specified"}\n\n## Getting started\n\nClone the repository and install its dependencies:\n\n\`\`\`bash\ngit clone ${repository.htmlUrl}.git\ncd ${repository.name}\n# Install dependencies with the package manager used by this project\n\`\`\`\n\n## Development\n\nStart the local development server or application using the project scripts. Add the exact command here so a new contributor can run the project quickly.\n\n## Contributing\n\n1. Create a feature branch.\n2. Make focused changes and add tests where appropriate.\n3. Open a pull request with context about the change.\n\n## Project topics\n\n${topics}\n\n## Recommended follow-up\n\n${recommendations || "- Keep the project documentation current as the codebase evolves."}\n\n## Repository\n\n[View ${repository.name} on GitHub](${repository.htmlUrl})\n`;
}

export default function ReadmeSuggestionPage() {
  const [snapshot, setSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadSnapshot(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedRepo = params.get("repo")?.toLowerCase();
      const response = await fetch("/api/analysis/history", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "The analysis could not be loaded.");
      const match = (data.snapshots ?? []).find((item: AnalysisSnapshot) => `${item.owner}/${item.repo}`.toLowerCase() === requestedRepo);
      const selected = match ?? data.snapshots?.[0] ?? null;
      if (!selected) {
        setMessage("Run an analysis first to generate a README suggestion.");
        return;
      }
      setSnapshot(selected);
      setContent(buildReadme(selected));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The analysis could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const loadId = window.setTimeout(() => {
      void loadSnapshot();
    }, 0);
    return () => window.clearTimeout(loadId);
  }, []);

  const copyContent = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "README-suggested.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] p-5 md:p-10">
      <div className="mx-auto max-w-350 space-y-7">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/analyze" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#748093] hover:text-[#e7654b]"><ArrowLeft className="h-4 w-4" /> Back to analysis</Link>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7654b]">Post-analysis tool</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#18243a] md:text-4xl">README suggestion</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748093]">A starting README generated from repository metadata, health scores, and the recommendations found in your latest analysis. Edit it before committing.</p>
          </div>
          <button type="button" onClick={() => void loadSnapshot(true)} disabled={loading || refreshing} className="inline-flex h-9 items-center justify-center gap-2 bg-[#18243a] px-3 text-sm font-semibold text-white transition hover:bg-[#e7654b] disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh analysis</button>
        </header>

        {loading ? <div className="flex items-center gap-2 border border-[#e3ded4] bg-white p-6 text-sm text-[#748093]"><Loader2 className="h-4 w-4 animate-spin" /> Loading the latest analysis...</div> : message ? <div className="border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{message}</div> : snapshot ? (
          <>
            <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center"><div className="border border-[#e3ded4] bg-white p-5"><div className="flex items-center gap-3"><GitBranch className="h-5 w-5 text-[#e7654b]" /><div><p className="font-bold text-[#18243a]">{snapshot.owner}/{snapshot.repo}</p><p className="mt-1 text-xs text-[#748093]">Generated from the snapshot saved {new Date(snapshot.created_at).toLocaleString()}</p></div></div></div><a href={snapshot.result.repository.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#d8d4cb] px-4 py-3 text-sm font-bold text-[#18243a] hover:border-[#e7654b]">Open repository <GitBranch className="h-4 w-4" /></a></section>
            <section className="border border-[#e3ded4] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ded4] px-5 py-4"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#e7654b]" /><div><h2 className="font-bold text-[#18243a]">Suggested README.md</h2><p className="text-xs text-[#748093]">Markdown draft based on the analyzed codebase</p></div></div><div className="flex gap-2"><button type="button" onClick={() => void copyContent()} className="inline-flex items-center gap-2 border border-[#d8d4cb] px-3 py-2 text-xs font-bold text-[#18243a] hover:border-[#e7654b]"><Clipboard className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}</button><button type="button" onClick={downloadContent} className="inline-flex items-center gap-2 bg-[#18243a] px-3 py-2 text-xs font-bold text-white hover:bg-[#e7654b]"><Download className="h-3.5 w-3.5" /> Download</button></div></div><textarea value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} aria-label="Suggested README content" className="min-h-170 w-full resize-y bg-[#18243a] p-5 font-mono text-xs leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-[#f2c14e]" /></section>
            <div className="flex items-center gap-2 text-xs text-[#748093]"><Check className="h-4 w-4 text-[#1d8a82]" /> This is an editable suggestion. Review commands and project-specific details before publishing.</div>
          </>
        ) : null}
      </div>
    </main>
  );
}
