import { githubRequest } from "@/lib/github/client";

export async function getRepositoryCommits(owner: string, repo: string) {
  return githubRequest(`/repos/${owner}/${repo}/commits`);
}
