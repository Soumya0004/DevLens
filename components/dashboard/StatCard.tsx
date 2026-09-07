import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  change,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
            tone === "danger" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {change}
        </span>
      </div>
      <p className="mt-5 text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
