import { githubRequest } from "@/lib/github/client";

export async function getContributors(owner: string, repo: string) {
  return githubRequest(`/repos/${owner}/${repo}/contributors`);
}
