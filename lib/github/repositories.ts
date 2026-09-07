import type { GitHubRepository } from "@/types/github";

import { githubRequest } from "@/lib/github/client";

export async function getRepository(owner: string, repo: string) {
  return githubRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
}

export async function searchRepositories(query: string) {
  return githubRequest<{ items: GitHubRepository[] }>(`/search/repositories?q=${encodeURIComponent(query)}`);
}
