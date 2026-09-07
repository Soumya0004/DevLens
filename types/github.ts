export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  description?: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  html_url: string;
};

export type GitHubFile = {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url?: string;
  sha?: string;
};
