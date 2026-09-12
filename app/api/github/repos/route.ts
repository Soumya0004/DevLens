import { NextResponse } from "next/server";

import { getGithubAccessToken } from "@/lib/github/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured yet" }, { status: 503 });
  }

  const accessToken = await getGithubAccessToken(supabase);

  if (!accessToken) {
    return NextResponse.json({ error: "GitHub authentication required" }, { status: 401 });
  }

  const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Unable to load GitHub repositories" }, { status: response.status });
  }

  const repos = await response.json();

  return NextResponse.json(
    repos.map((item: { full_name: string; name: string; html_url: string }) => ({
      full_name: item.full_name,
      name: item.name,
      html_url: item.html_url,
    })),
  );
}
