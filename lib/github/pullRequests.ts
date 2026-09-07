import { githubRequest } from "@/lib/github/client";

export async function getPullRequests(owner: string, repo: string) {
  return githubRequest(`/repos/${owner}/${repo}/pulls`);
}
