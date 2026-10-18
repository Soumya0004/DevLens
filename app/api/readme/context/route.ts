import { NextResponse } from "next/server";

import { getGithubAccessToken } from "@/lib/github/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const manifestNames = new Set([
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "composer.json",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Gemfile",
  "Dockerfile",
  "Makefile",
]);

const languageByExtension: Record<string, string> = {
  ".c": "C",
  ".cc": "C++",
  ".cpp": "C++",
  ".cs": "C#",
  ".css": "CSS",
  ".go": "Go",
  ".h": "C/C++",
  ".html": "HTML",
  ".java": "Java",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".kt": "Kotlin",
  ".php": "PHP",
  ".py": "Python",
  ".rb": "Ruby",
  ".rs": "Rust",
  ".scss": "SCSS",
  ".swift": "Swift",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".vue": "Vue",
};

const ignoredDirectories = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "target",
  "vendor",
]);

type GithubTreeEntry = {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

function isIgnoredPath(path: string) {
  return path.split("/").some((segment) => ignoredDirectories.has(segment));
}

function getExtension(path: string) {
  const filename = path.split("/").at(-1) ?? "";
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex > 0 ? filename.slice(dotIndex).toLowerCase() : "";
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured yet" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const owner = typeof body.owner === "string" ? body.owner.trim() : "";
  const repo = typeof body.repo === "string" ? body.repo.trim() : "";
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) {
    return NextResponse.json({ error: "A valid repository owner and name are required" }, { status: 400 });
  }

  const accessToken = await getGithubAccessToken(supabase);
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  const repositoryUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const repositoryResponse = await fetch(repositoryUrl, { headers, cache: "no-store" });
  if (!repositoryResponse.ok) {
    return NextResponse.json({ error: "The repository could not be accessed with this GitHub account" }, { status: repositoryResponse.status });
  }

  const repository = await repositoryResponse.json();
  const branch = typeof repository.default_branch === "string" ? repository.default_branch : "";
  if (!branch) {
    return NextResponse.json({ error: "The repository has no default branch to inspect" }, { status: 422 });
  }

  const treeResponse = await fetch(
    `${repositoryUrl}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers, cache: "no-store" },
  );
  if (!treeResponse.ok) {
    return NextResponse.json({ error: "The repository file tree could not be inspected" }, { status: treeResponse.status });
  }

  const treeData = await treeResponse.json();
  const entries = (Array.isArray(treeData.tree) ? treeData.tree : []) as GithubTreeEntry[];
  const includedEntries = entries.filter((entry) => !isIgnoredPath(entry.path));
  const sourceEntries = includedEntries.filter((entry) => entry.type === "blob" && languageByExtension[getExtension(entry.path)]);
  const languages = sourceEntries.reduce<Record<string, number>>((counts, entry) => {
    const language = languageByExtension[getExtension(entry.path)];
    counts[language] = (counts[language] ?? 0) + 1;
    return counts;
  }, {});
  const directories = [...new Set(includedEntries
    .filter((entry) => entry.type === "tree" && !entry.path.includes("/"))
    .map((entry) => entry.path))]
    .sort((first, second) => first.localeCompare(second));
  const rootFiles = includedEntries
    .filter((entry) => entry.type === "blob" && !entry.path.includes("/"))
    .map((entry) => entry.path)
    .sort((first, second) => first.localeCompare(second));
  const entryPoints = sourceEntries
    .map((entry) => entry.path)
    .filter((path) => /(^|\/)(main|index|app)\.(c|cc|cpp|cs|go|java|js|jsx|php|py|rb|rs|ts|tsx)$/.test(path))
    .slice(0, 30);
  const manifestEntries = includedEntries
    .filter((entry) => entry.type === "blob" && manifestNames.has(entry.path.split("/").at(-1) ?? ""))
    .sort((first, second) => first.path.split("/").length - second.path.split("/").length)
    .slice(0, 12);

  const manifests = await Promise.all(manifestEntries.map(async (entry) => {
    if ((entry.size ?? 0) > 250_000) return { path: entry.path, content: "" };
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${entry.sha}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return { path: entry.path, content: "" };

    const blob = await response.json();
    const content = blob.encoding === "base64" && typeof blob.content === "string"
      ? Buffer.from(blob.content.replace(/\s/g, ""), "base64").toString("utf8")
      : "";
    return { path: entry.path, content };
  }));

  return NextResponse.json({
    repository: {
      fullName: repository.full_name,
      description: repository.description,
      htmlUrl: repository.html_url,
      defaultBranch: branch,
      license: repository.license?.spdx_id ?? null,
      topics: Array.isArray(repository.topics) ? repository.topics : [],
    },
    fileCount: includedEntries.filter((entry) => entry.type === "blob").length,
    sourceFileCount: sourceEntries.length,
    directories,
    rootFiles,
    languages,
    entryPoints,
    manifests,
    truncated: Boolean(treeData.truncated),
  });
}