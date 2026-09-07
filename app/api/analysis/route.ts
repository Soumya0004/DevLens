import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured yet" }, { status: 503 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const body = await request.json().catch(() => ({}));
  const owner = typeof body.owner === "string" ? body.owner.trim() : "";
  const repo = typeof body.repo === "string" ? body.repo.trim() : "";

  if (!owner || !repo) {
    return NextResponse.json({ error: "A repository owner and name are required" }, { status: 400 });
  }

  const githubHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(session?.provider_token ? { Authorization: `Bearer ${session.provider_token}` } : {}),
  };

  const [repositoryResponse, commitsResponse, pullsResponse, readmeResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: githubHeaders,
      cache: "no-store",
    }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`, {
      headers: githubHeaders,
      cache: "no-store",
    }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`, {
      headers: githubHeaders,
      cache: "no-store",
    }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: githubHeaders,
      cache: "no-store",
    }),
  ]);

  if (!repositoryResponse.ok) {
    return NextResponse.json({ error: "Repository not found" }, { status: repositoryResponse.status });
  }

  const repoData = await repositoryResponse.json();
  const commits = await commitsResponse.json().catch(() => []);
  const pulls = await pullsResponse.json().catch(() => []);
  const readmeData = readmeResponse.ok ? await readmeResponse.json().catch(() => null) : null;
  const readmeContent = readmeData?.encoding === "base64" && typeof readmeData.content === "string"
    ? Buffer.from(readmeData.content.replace(/\s/g, ""), "base64").toString("utf8")
    : "";

  const codeQuality = Math.min(100, Math.max(45, Math.round(repoData.stargazers_count / 100)));
  const documentation = Math.min(100, Math.max(35, Math.round((repoData.open_issues_count || 0) === 0 ? 90 : 70)));
  const security = Math.min(100, Math.max(40, Math.round((Array.isArray(pulls) ? pulls.length : 0) * 7 + 55)));
  const activity = Math.min(100, Math.max(30, Math.round((Array.isArray(commits) ? commits.length : 0) * 8 + 40)));
  const overall = Math.round((codeQuality + documentation + security + activity) / 4);

  const analysis = {
    overall,
    codeQuality,
    documentation,
    security,
    activity,
    repository: {
      name: repoData.full_name,
      description: repoData.description ?? null,
      htmlUrl: repoData.html_url,
      language: repoData.language ?? null,
      stars: repoData.stargazers_count ?? 0,
      openIssues: repoData.open_issues_count ?? 0,
      forks: repoData.forks_count ?? 0,
      watchers: repoData.subscribers_count ?? 0,
      size: repoData.size ?? 0,
      visibility: repoData.visibility ?? null,
      license: repoData.license?.spdx_id ?? null,
      defaultBranch: repoData.default_branch ?? null,
      topics: Array.isArray(repoData.topics) ? repoData.topics : [],
      archived: repoData.archived ?? false,
      createdAt: repoData.created_at ?? null,
      updatedAt: repoData.updated_at ?? null,
    },
    readme: readmeContent
      ? { path: readmeData.name ?? "README.md", content: readmeContent }
      : null,
    codeReview: {
      pullRequests: Array.isArray(pulls)
        ? pulls.map((pull) => ({
            title: pull.title,
            state: pull.state,
            author: pull.user?.login ?? "unknown",
            updatedAt: pull.updated_at,
            url: pull.html_url,
          }))
        : [],
      recentCommits: Array.isArray(commits)
        ? commits.map((commit) => ({
            message: commit.commit?.message?.split("\n")[0] ?? "Untitled commit",
            author: commit.author?.login ?? commit.commit?.author?.name ?? "unknown",
            date: commit.commit?.author?.date ?? "",
            url: commit.html_url,
          }))
        : [],
    },
    recommendations: [
      {
        title: "Monitor documentation coverage",
        description: `Review docs for ${repoData.full_name} to keep onboarding and maintenance healthy.`,
        severity: "medium",
      },
      {
        title: "Track dependency and security changes",
        description: "Keep pull requests and security alerts in view as activity increases.",
        severity: "high",
      },
    ],
  };

  const { data: snapshot, error: snapshotError } = await supabase
    .from("analysis_snapshots")
    .insert({
      user_id: user.id,
      owner,
      repo,
      result: analysis,
    })
    .select("id, created_at")
    .single();

  if (snapshotError) {
    console.error("Could not save analysis snapshot:", snapshotError.message);
    const tableMissing = snapshotError.message.includes("analysis_snapshots") && snapshotError.message.includes("schema cache");
    return NextResponse.json(
      {
        error: tableMissing
          ? "The analysis was generated but could not be saved because public.analysis_snapshots is missing in Supabase. Run supabase/migrations/001_analysis_snapshots.sql."
          : `The analysis was generated but could not be saved: ${snapshotError.message}`,
        persisted: false,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ...analysis,
    snapshotId: snapshot?.id ?? null,
    userId: user.id,
    savedAt: snapshot?.created_at ?? null,
    persisted: true,
  });
}
