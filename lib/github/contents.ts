import { githubRequest } from "@/lib/github/client";

export async function getRepositoryContents(owner: string, repo: string, path = "") {
  return githubRequest(`/repos/${owner}/${repo}/contents/${path}`);
}
