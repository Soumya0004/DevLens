import type { CodeReviewCommit } from "@/types/analysis";

export function CommitChart({ commits }: { commits: CodeReviewCommit[] }) {
  if (!commits.length) return <p className="text-sm text-slate-500">Analyze a repository to see commit activity.</p>;

  const data = commits.slice(0, 7);

  return (
    <div className="flex h-52 items-end gap-2 sm:gap-3">
      {data.map((commit, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl bg-slate-950/90" style={{ height: `${Math.max(24, 180 - index * 20)}px` }} title={commit.message} />
          <span className="text-[10px] text-slate-500">
            {"SMTWTFS"[index]}
          </span>
        </div>
      ))}
    </div>
  );
}
