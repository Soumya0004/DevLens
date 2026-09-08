export type AnalysisScore = {
  snapshotId?: string;
  savedAt?: string;
  persisted?: boolean;
  userId?: string;
  saveWarning?: string;
  overall: number;
  codeQuality: number;
  documentation: number;
  security: number;
  activity: number;
  repository: {
    name: string;
    description: string | null;
    htmlUrl: string;
    language: string | null;
    stars: number;
    openIssues: number;
    forks: number;
    watchers: number;
    size: number;
    visibility: string | null;
    license: string | null;
    defaultBranch: string | null;
    topics: string[];
    archived: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };
  readme: {
    path: string;
    content: string;
  } | null;
  codeReview: {
    pullRequests: CodeReviewPullRequest[];
    recentCommits: CodeReviewCommit[];
  };
  recommendations: Recommendation[];
};

export type AnalysisSnapshot = {
  id: string;
  owner: string;
  repo: string;
  result: AnalysisScore;
  created_at: string;
};

export type CodeReviewPullRequest = {
  title: string;
  state: string;
  author: string;
  updatedAt: string;
  url: string;
};

export type CodeReviewCommit = {
  message: string;
  author: string;
  date: string;
  url: string;
};

export type Recommendation = {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
};
