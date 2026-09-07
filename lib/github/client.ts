export const githubApiBase = "https://api.github.com";

export async function githubRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${githubApiBase}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
