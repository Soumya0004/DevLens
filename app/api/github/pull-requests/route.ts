import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=10`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "GitHub pull requests request failed" }, { status: response.status });
  }

  const pulls = await response.json();
  return NextResponse.json(pulls);
}
