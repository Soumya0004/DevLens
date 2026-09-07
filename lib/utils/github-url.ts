export function normalizeGithubUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("github.com")) {
      const [, owner, repo] = url.pathname.split("/").filter(Boolean);
      if (owner && repo) return { owner, repo };
    }
  } catch {
    // allow owner/repo shorthand
  }

  const match = trimmed.match(/^github\.com\/?([^/]+)\/([^/]+)$/i)
    ?? trimmed.match(/^([^/]+)\/([^/]+)$/);

  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }

  return null;
}
