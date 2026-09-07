import type { CodeReviewCommit } from "@/types/analysis";

export function ActivityChart({ commits }: { commits: CodeReviewCommit[] }) {
  if (!commits.length) return <p className="text-sm text-slate-500">Analyze a repository to see developer activity.</p>;

  const points = commits.slice(0, 10).map((_, index) => `${index * 30},${120 - index * 7}`).join(" ");

  return (
    <svg viewBox="0 0 300 160" className="h-52 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="activityLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <path
        d="M 0 120 C 25 110, 45 80, 70 90 S 120 70, 150 85 S 220 40, 300 50"
        fill="none"
        stroke="url(#activityLine)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polyline
        fill="none"
        stroke="#0f172a"
        strokeWidth="2"
        points={points}
        opacity="0.15"
      />
    </svg>
  );
}
