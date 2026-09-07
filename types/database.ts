export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type RepositorySnapshot = {
  id: string;
  user_id: string;
  repo_name: string;
  owner: string;
  score: number;
  summary: string;
  created_at: string;
};
