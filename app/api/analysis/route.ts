import { NextResponse } from "next/server";

import { buildRepositoryArchitecture } from "@/lib/analysis/architecture";
import { getGithubAccessToken } from "@/lib/github/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const maxDuration = 60;

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

  const accessToken = await getGithubAccessToken(supabase);

  const body = await request.json().catch(() => ({}));
  const owner = typeof body.owner === "string" ? body.owner.trim() : "";
  const repo = typeof body.repo === "string" ? body.repo.trim() : "";

  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(owner) || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo)) {
    return NextResponse.json({ error: "A repository owner and name are required" }, { status: 400 });
  }

  const githubHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let repositoryResponse: Response;
  let commitsResponse: Response;
  let pullsResponse: Response;
  let readmeResponse: Response;
  try {
    [repositoryResponse, commitsResponse, pullsResponse, readmeResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: githubHeaders,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`, {
        headers: githubHeaders,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`, {
        headers: githubHeaders,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: githubHeaders,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }),
    ]);
  } catch (error) {
    console.error("Could not fetch GitHub repository analysis data:", error);
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "GitHub request timed out. Please try again." : "GitHub could not be reached. Please try again." },
      { status: 502 },
    );
  }

  if (!repositoryResponse.ok) {
    const rateLimited = repositoryResponse.status === 403
      && repositoryResponse.headers.get("x-ratelimit-remaining") === "0";
    return NextResponse.json(
      { error: rateLimited ? "GitHub API rate limit reached. Try again later or connect a GitHub account." : "Repository not found or inaccessible." },
      { status: rateLimited ? 429 : repositoryResponse.status },
    );
  }

  const repoData = await repositoryResponse.json();
  let architecture = null;
  let architectureError: string | undefined;
  try {
    architecture = await buildRepositoryArchitecture({
      owner,
      repo,
      branch: repoData.default_branch ?? "main",
      headers: githubHeaders,
    });
  } catch (error) {
    architectureError = error instanceof Error
      ? error.message
      : "The repository architecture could not be analyzed.";
    console.error("Could not build repository architecture:", architectureError);
  }
  const commits = await commitsResponse.json().catch(() => []);
  const pulls = await pullsResponse.json().catch(() => []);
  const readmeData = readmeResponse.ok ? await readmeResponse.json().catch(() => null) : null;
  const readmeContent = readmeData?.encoding === "base64" && typeof readmeData.content === "string"
    ? Buffer.from(readmeData.content.replace(/\s/g, ""), "base64").toString("utf8")
    : "";

  const commitCount = Array.isArray(commits) ? commits.length : 0;
  const pullRequestCount = Array.isArray(pulls) ? pulls.length : 0;
  const openPullRequestCount = Array.isArray(pulls) ? pulls.filter((pull) => pull.state === "open").length : 0;
  const hasReadme = Boolean(readmeContent);
  const hasDescription = Boolean(repoData.description);
  const hasLicense = Boolean(repoData.license?.spdx_id && repoData.license.spdx_id !== "NOASSERTION");
  const topicCount = Array.isArray(repoData.topics) ? repoData.topics.length : 0;
  const contributorCount = Array.isArray(commits)
    ? new Set(commits.map((commit) => commit.author?.login ?? commit.commit?.author?.email).filter(Boolean)).size
    : 0;

  // Each dimension uses a different set of observable GitHub signals so scores do not converge.
  const codeQuality = Math.min(100, Math.max(35, Math.round(
    42 + (hasLicense ? 12 : 0) + (repoData.has_issues ? 8 : 0) + Math.min(18, topicCount * 3) + Math.min(20, repoData.forks_count / 25),
  )));
  const documentation = Math.min(100, Math.max(25, Math.round(
    25 + (hasReadme ? 35 : 0) + (hasDescription ? 15 : 0) + (hasLicense ? 10 : 0) + Math.min(15, topicCount * 2) + Math.min(10, readmeContent.length / 800),
  )));
  const security = Math.min(100, Math.max(35, Math.round(
    78 - (repoData.archived ? 25 : 0) - (repoData.visibility === "public" ? 0 : 5) - Math.min(18, openPullRequestCount * 3) + (hasLicense ? 8 : 0),
  )));
  const activity = Math.min(100, Math.max(25, Math.round(
    25 + Math.min(40, commitCount * 2) + Math.min(20, pullRequestCount * 2) + Math.min(15, contributorCount * 3),
  )));
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
    architecture,
    architectureError,
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
