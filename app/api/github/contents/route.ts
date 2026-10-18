import { NextResponse } from "next/server";

import { getGithubAccessToken } from "@/lib/github/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const path = searchParams.get("path") ?? "";

  if (!owner || !repo) {
    return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const accessToken = supabase ? await getGithubAccessToken(supabase) : null;
  const repositoryPath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const endpoint = `${repositoryPath}/contents/${path.split("/").filter(Boolean).map(encodeURIComponent).join("/")}`;

  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "GitHub contents request failed" }, { status: response.status });
  }

  const contents = await response.json();
  return NextResponse.json(Array.isArray(contents) ? contents : [contents]);
}
