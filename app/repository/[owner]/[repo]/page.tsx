import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getRepository(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;

  if (!owner || !repo) {
    notFound();
  }

  const repository = await getRepository(owner, repo);

  if (!repository) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Repository</p>
              <h1 className="mt-2 wrap-break-word text-3xl font-bold tracking-tight text-slate-950">{repository.full_name}</h1>
            </div>
            <div className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
              {Math.min(100, Math.max(50, Math.round(repository.stargazers_count / 100)))} / 100 health score
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>{repository.description || "This repository has no description available on GitHub."}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stars</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{repository.stargazers_count}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Forks</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{repository.forks_count}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Issues</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{repository.open_issues_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>GitHub facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                Default branch: <span className="font-semibold text-slate-900">{repository.default_branch}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                Repository URL: <a className="font-semibold text-slate-900 underline" href={repository.html_url}>Open on GitHub</a>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                Visibility: <span className="font-semibold text-slate-900">{repository.private ? "Private" : "Public"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
