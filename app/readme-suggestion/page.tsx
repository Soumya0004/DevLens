"use client";

import Link from "next/link";
import { ArrowLeft, Check, Clipboard, Download, FileText, GitBranch, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import type { AnalysisSnapshot } from "@/types/analysis";
import { YellowHeading } from "@/components/ui/yellow-heading";

type ReadmeContext = {
  repository: {
    fullName: string;
    description: string | null;
    htmlUrl: string;
    defaultBranch: string;
    license: string | null;
    topics: string[];
  };
  fileCount: number;
  sourceFileCount: number;
  directories: string[];
  rootFiles: string[];
  languages: Record<string, number>;
  entryPoints: string[];
  manifests: { path: string; content: string }[];
  truncated: boolean;
};

type PackageManifest = {
  description?: string;
  packageManager?: string;
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function readManifest(context: ReadmeContext, name: string) {
  const manifest = context.manifests.find((item) => item.path.split("/").at(-1) === name);
  return manifest?.content ?? "";
}

function buildReadme(snapshot: AnalysisSnapshot, context: ReadmeContext) {
  const { result } = snapshot;
  const repository = result.repository;
  let packageManifest: PackageManifest | null = null;
  try {
    const packageJson = readManifest(context, "package.json");
    packageManifest = packageJson ? JSON.parse(packageJson) as PackageManifest : null;
  } catch {
    packageManifest = null;
  }

  const packageManager = packageManifest?.packageManager?.split("@")[0]
    ?? (context.rootFiles.includes("pnpm-lock.yaml") ? "pnpm"
      : context.rootFiles.includes("yarn.lock") ? "yarn"
        : context.rootFiles.some((file) => file === "bun.lock" || file === "bun.lockb") ? "bun"
          : "npm");
  const dependencies = {
    ...packageManifest?.dependencies,
    ...packageManifest?.devDependencies,
  };
  const frameworks = [
    ["next", "Next.js"],
    ["react", "React"],
    ["vue", "Vue"],
    ["svelte", "Svelte"],
    ["@angular/core", "Angular"],
    ["express", "Express"],
    ["fastify", "Fastify"],
    ["vite", "Vite"],
  ].filter(([dependency]) => dependency in dependencies).map(([, name]) => name);
  const languages = Object.entries(context.languages)
    .sort((first, second) => second[1] - first[1])
    .map(([language, count]) => `- ${language}: ${count} files`)
    .join("\n");
  const directoryList = context.directories.length
    ? context.directories.map((directory) => `- \`${directory}/\``).join("\n")
    : "No top-level directories were found.";
  const setupCommands: string[] = [];
  const developmentCommands: string[] = [];

  if (packageManifest) {
    const installCommand = packageManager === "npm" && context.rootFiles.includes("package-lock.json")
      ? "npm ci"
      : `${packageManager} install`;
    setupCommands.push(`\`\`\`sh\n${installCommand}\n\`\`\``);
    const scripts = Object.entries(packageManifest.scripts ?? {});
    for (const [name, script] of scripts) {
      const command = packageManager === "npm" ? `npm run ${name}` : `${packageManager} ${name}`;
      developmentCommands.push(`| \`${command}\` | ${script.replaceAll("|", "\\|")} |`);
    }
  }

  const requirements = readManifest(context, "requirements.txt");
  if (context.manifests.some((item) => item.path.endsWith("pyproject.toml"))) {
    const installCommand = context.rootFiles.includes("uv.lock") ? "uv sync" : "python -m pip install .";
    setupCommands.push(`\`\`\`sh\n${installCommand}\n\`\`\``);
  } else if (requirements) {
    setupCommands.push("\`\`\`sh\npython -m pip install -r requirements.txt\n\`\`\`");
  }
  if (context.manifests.some((item) => item.path.endsWith("go.mod"))) {
    setupCommands.push("\`\`\`sh\ngo mod download\n\`\`\`");
    developmentCommands.push("| `go test ./...` | Run Go tests |", "| `go build ./...` | Build all Go packages |");
  }
  if (context.manifests.some((item) => item.path.endsWith("Cargo.toml"))) {
    setupCommands.push("\`\`\`sh\ncargo build\n\`\`\`");
    developmentCommands.push("| `cargo test` | Run Rust tests |", "| `cargo build` | Build the project |");
  }
  if (context.rootFiles.includes("pom.xml")) {
    const wrapper = context.rootFiles.includes("mvnw") ? "./mvnw" : "mvn";
    setupCommands.push(`\`\`\`sh\n${wrapper} install\n\`\`\``);
    developmentCommands.push(`| \`${wrapper} test\` | Run Java tests |`);
  }
  if (context.rootFiles.includes("build.gradle") || context.rootFiles.includes("build.gradle.kts")) {
    const wrapper = context.rootFiles.includes("gradlew") ? "./gradlew" : "gradle";
    setupCommands.push(`\`\`\`sh\n${wrapper} build\n\`\`\``);
    developmentCommands.push(`| \`${wrapper} test\` | Run project tests |`);
  }
  if (context.manifests.some((item) => item.path.endsWith("composer.json"))) {
    setupCommands.push("\`\`\`sh\ncomposer install\n\`\`\`");
  }

  const uniqueSetupCommands = [...new Set(setupCommands)];
  const sections = [
    `# ${context.repository.fullName || repository.name}`,
    context.repository.description || packageManifest?.description || (repository.description ?? ""),
    "## Overview",
    `This repository contains ${context.fileCount} tracked files, including ${context.sourceFileCount} recognized source files.${context.truncated ? " GitHub returned a partial file tree." : ""}`,
    "## Languages and frameworks",
    [languages, frameworks.length ? `Frameworks detected from package dependencies: ${frameworks.join(", ")}.` : ""]
      .filter(Boolean).join("\n\n") || "No source languages were recognized from file extensions.",
    "## Project structure",
    directoryList,
    context.entryPoints.length ? `Detected entry-point files:\n${context.entryPoints.map((path) => `- \`${path}\``).join("\n")}` : "",
    uniqueSetupCommands.length ? `## Getting started\n\nClone the repository:\n\n\`\`\`sh\ngit clone ${context.repository.htmlUrl}.git\ncd ${snapshot.repo}\n\`\`\`\n\nInstall dependencies:\n\n${uniqueSetupCommands.join("\n\n")}` : "## Getting started\n\nNo supported dependency manifest was found. Review the project files to determine its setup requirements.",
    developmentCommands.length ? `## Development commands\n\n| Command | Purpose |\n| --- | --- |\n${developmentCommands.join("\n")}` : "",
    context.manifests.length ? `## Project manifests\n\n${context.manifests.map((item) => `- \`${item.path}\``).join("\n")}` : "",
    context.repository.license || repository.license ? `## License\n\n${context.repository.license || repository.license}` : "",
    context.repository.topics.length ? `## Topics\n\n${context.repository.topics.map((topic) => `\`${topic}\``).join(" ")}` : "",
    `## Repository\n\n[View on GitHub](${context.repository.htmlUrl || repository.htmlUrl})`,
  ].filter(Boolean);

  return `${sections.join("\n\n")}\n`;
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

      const contextResponse = await fetch("/api/readme/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: selected.owner, repo: selected.repo }),
      });
      const contextData = await contextResponse.json().catch(() => null);
      if (!contextResponse.ok) {
        throw new Error(contextData?.error || "Repository files could not be analyzed.");
      }

      setSnapshot(selected);
      setContent(buildReadme(selected, contextData as ReadmeContext));
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
    anchor.download = "README.md";
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
            <YellowHeading className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">README.md creator</YellowHeading>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748093]">Build an editable README from the repository file tree, project manifests, available scripts, and analysis. Review it before adding it to the project.</p>
          </div>
          <button type="button" onClick={() => void loadSnapshot(true)} disabled={loading || refreshing} className="inline-flex h-9 items-center justify-center gap-2 bg-[#18243a] px-3 text-sm font-semibold text-white transition hover:bg-[#e7654b] disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Regenerate README</button>
        </header>

        {loading ? <div className="flex items-center gap-2 border border-[#e3ded4] bg-white p-6 text-sm text-[#748093]"><Loader2 className="h-4 w-4 animate-spin" /> Loading the latest analysis...</div> : message ? <div className="border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{message}</div> : snapshot ? (
          <>
            <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center"><div className="border border-[#e3ded4] bg-white p-5"><div className="flex items-center gap-3"><GitBranch className="h-5 w-5 text-[#e7654b]" /><div><p className="font-bold text-[#18243a]">{snapshot.owner}/{snapshot.repo}</p><p className="mt-1 text-xs text-[#748093]">Generated from the snapshot saved {new Date(snapshot.created_at).toLocaleString()}</p></div></div></div><a href={snapshot.result.repository.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#d8d4cb] px-4 py-3 text-sm font-bold text-[#18243a] hover:border-[#e7654b]">Open repository <GitBranch className="h-4 w-4" /></a></section>
            <section className="border border-[#e3ded4] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ded4] px-5 py-4"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#e7654b]" /><div><h2 className="font-bold text-[#18243a]">README.md</h2><p className="text-xs text-[#748093]">Generated from repository files and configuration</p></div></div><div className="flex gap-2"><button type="button" onClick={() => void copyContent()} className="inline-flex items-center gap-2 border border-[#d8d4cb] px-3 py-2 text-xs font-bold text-[#18243a] hover:border-[#e7654b]"><Clipboard className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}</button><button type="button" onClick={downloadContent} className="inline-flex items-center gap-2 bg-[#18243a] px-3 py-2 text-xs font-bold text-white hover:bg-[#e7654b]"><Download className="h-3.5 w-3.5" /> Download README.md</button></div></div><textarea value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} aria-label="Editable README.md content" className="min-h-170 w-full resize-y bg-[#18243a] p-5 font-mono text-xs leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-[#f2c14e]" /></section>
            <div className="flex items-center gap-2 text-xs text-[#748093]"><Check className="h-4 w-4 text-[#1d8a82]" /> Edit the generated file, then download it as README.md. DevLens does not write to GitHub.</div>
          </>
        ) : null}
      </div>
    </main>
  );
}
