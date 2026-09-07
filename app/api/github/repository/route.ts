import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.provider_token) {
      headers.Authorization = `Bearer ${session.provider_token}`;
    }
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch repository metadata from GitHub" },
      { status: response.status },
    );
  }

  const repository = await response.json();

  return NextResponse.json({
    repository: {
      full_name: repository.full_name,
      stargazers_count: repository.stargazers_count,
      forks_count: repository.forks_count,
      open_issues_count: repository.open_issues_count,
      default_branch: repository.default_branch,
      html_url: repository.html_url,
      description: repository.description,
    },
  });
}
