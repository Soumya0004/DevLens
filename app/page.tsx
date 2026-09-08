"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Check, ChevronRight, GitBranch, GitCommit, LockKeyhole, Search, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import { FormEvent, useState } from "react";

const scoreRows = [
	{ label: "Code quality", value: 84, color: "bg-[#58a6ff]" },
	{ label: "Documentation", value: 71, color: "bg-[#3fb950]" },
	{ label: "Security", value: 78, color: "bg-[#d29922]" },
	{ label: "Activity", value: 91, color: "bg-[#8957e5]" },
];

export default function Home() {
	const [repository, setRepository] = useState("");
	const [preview, setPreview] = useState<"health" | "activity">("health");

	function handleAnalyze(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		window.location.href = repository.trim()
			? `/analyze?repo=${encodeURIComponent(repository.trim())}`
			: "/analyze";
	}

	return (
		<main className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
			<section className="relative overflow-hidden border-b border-[#30363d]">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(88,166,255,0.16),transparent_35%),radial-gradient(circle_at_0%_80%,rgba(35,134,54,0.12),transparent_30%)]" />
				<div className="relative mx-auto grid max-w-350 gap-14 px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
					<div>
						<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b949e]"><span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" /> GitHub project intelligence</div>
						<h1 className="max-w-2xl text-5xl font-bold leading-[0.95] tracking-tight text-[#e6edf3] md:text-7xl">Know the shape of a codebase before you change it.</h1>
						<p className="mt-7 max-w-xl text-base leading-7 text-[#8b949e] md:text-lg">DevLens reads the signals around a GitHub repository and turns them into a health report your team can understand and act on.</p>
						<form onSubmit={handleAnalyze} className="mt-9 max-w-xl">
							<label htmlFor="repository" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8b949e]">Start with a repository</label>
							<div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8b949e]" /><input id="repository" value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="owner/repository or GitHub URL" className="h-11 w-full rounded-md border border-[#30363d] bg-[#161b22] pl-10 pr-3 text-sm text-[#e6edf3] outline-none placeholder:text-[#8b949e] focus:border-[#58a6ff]" /></div><button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#238636] px-5 text-sm font-semibold text-white transition hover:bg-[#2ea043]">Analyze repository <ArrowRight className="h-4 w-4" /></button></div>
						</form>
						<div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#8b949e]"><span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-[#3fb950]" /> OAuth protected</span><span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#3fb950]" /> No repository changes</span><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-[#d29922]" /> Fast first read</span></div>
					</div>

					<div className="relative">
						<div className="absolute -inset-8 bg-[#58a6ff]/10 blur-3xl" />
						<div className="relative rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl shadow-black/30">
							<div className="flex items-center justify-between border-b border-[#30363d] px-5 py-4"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8b949e]"><span className="h-2 w-2 rounded-full bg-[#3fb950]" /> Live report preview</span><span className="font-mono text-xs text-[#8b949e]">snapshot_04</span></div>
							<div className="p-5 md:p-7"><div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b949e]">Repository health</p><h2 className="mt-2 text-2xl font-semibold text-[#e6edf3]">vercel / next.js</h2><p className="mt-1 text-sm text-[#8b949e]">Updated a few moments ago</p></div><div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-[#3fb950] text-[#3fb950]"><span className="text-2xl font-bold">82</span><span className="text-[9px] tracking-widest">HEALTH</span></div></div><div className="mt-7 flex gap-1 border-b border-[#30363d]"><button type="button" onClick={() => setPreview("health")} className={`px-3 pb-3 text-xs font-bold ${preview === "health" ? "border-b-2 border-[#58a6ff] text-[#e6edf3]" : "text-[#8b949e]"}`}>Health dimensions</button><button type="button" onClick={() => setPreview("activity")} className={`px-3 pb-3 text-xs font-bold ${preview === "activity" ? "border-b-2 border-[#58a6ff] text-[#e6edf3]" : "text-[#8b949e]"}`}>Activity pulse</button></div>{preview === "health" ? <div className="mt-6 space-y-4">{scoreRows.map((row) => <div key={row.label}><div className="mb-2 flex justify-between text-xs"><span className="text-[#c9d1d9]">{row.label}</span><span className="font-bold text-[#e6edf3]">{row.value}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-[#0d1117]"><div className={`h-full ${row.color}`} style={{ width: `${row.value}%` }} /></div></div>)}</div> : <div className="mt-6 grid grid-cols-2 gap-3"><Metric icon={<GitCommit />} label="Commits / 30d" value="148" /><Metric icon={<GitBranch />} label="Contributors" value="24" /><Metric icon={<Target />} label="Open issues" value="37" /><Metric icon={<BarChart3 />} label="Trend" value="+18%" /></div>}<div className="mt-7 flex items-center gap-3 border-t border-[#30363d] pt-5"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#238636]/15 text-[#3fb950]"><Sparkles className="h-4 w-4" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b949e]">Suggested next step</p><p className="text-sm font-semibold text-[#e6edf3]">Document the release workflow</p></div></div></div>
						</div>
					</div>
				</div>
			</section>

			<section className="border-b border-[#30363d] bg-[#161b22]"><div className="mx-auto grid max-w-350 gap-6 px-5 py-8 md:grid-cols-4 md:px-10"><Stat value="4" label="Health dimensions" /><Stat value="50+" label="Signals collected" /><Stat value="90 sec" label="Typical first scan" /><Stat value="Actionable" label="Every report ends with a next step" accent /></div></section>

			<section className="mx-auto max-w-350 px-5 py-20 md:px-10 md:py-28"><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#58a6ff]">How it works</p><h2 className="mt-3 max-w-md text-4xl font-bold leading-tight text-[#e6edf3]">A clear read in three moves.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#8b949e]">A shared starting point for repository reviews, onboarding, release planning, and maintenance.</p></div><div className="divide-y divide-[#30363d] border-y border-[#30363d]"><Step number="01" icon={<GitBranch />} title="Connect" text="Paste a public GitHub URL or choose a repository from your connected account." /><Step number="02" icon={<ShieldCheck />} title="Understand" text="See the evidence behind quality, documentation, security, and activity scores." /><Step number="03" icon={<ArrowRight />} title="Act" text="Save the snapshot, follow the recommendation, and generate a README suggestion." /></div></div></section>

			<section className="border-y border-[#30363d] bg-[#161b22]"><div className="mx-auto grid max-w-350 gap-10 px-5 py-20 md:grid-cols-2 md:px-10 md:py-24"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3fb950]">Built for useful decisions</p><h2 className="mt-3 max-w-lg text-4xl font-bold leading-tight text-[#e6edf3]">Less time decoding. More time improving.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-[#8b949e]">Use DevLens before adopting a library, joining a team, reviewing a codebase, or preparing a release. It turns scattered GitHub signals into context people can discuss.</p><Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#58a6ff] hover:text-white">Explore the dashboard <ChevronRight className="h-4 w-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2"><ValueCard title="Review" text="Focus attention on the risks that matter." /><ValueCard title="Onboard" text="Understand the project before changing it." /><ValueCard title="Track" text="Compare saved health snapshots over time." /><ValueCard title="Explain" text="Turn analysis into a README starting point." /></div></div></section>

			<section id="privacy-policy" className="mx-auto max-w-350 px-5 py-20 md:px-10 md:py-24"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d29922]">Privacy policy</p><h2 className="mt-3 text-4xl font-bold leading-tight text-[#e6edf3]">Your repository stays yours.</h2><p className="mt-5 text-sm leading-7 text-[#8b949e]">DevLens uses repository metadata and activity to create your report. It does not modify repositories, ask you to paste source code, or sell your analysis data.</p><Link href="/settings" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#58a6ff] hover:text-white">Review settings <ArrowRight className="h-4 w-4" /></Link></div><div className="border border-[#30363d] bg-[#161b22] p-6"><div className="flex items-center gap-2 border-b border-[#30363d] pb-4 font-mono text-xs text-[#8b949e]"><LockKeyhole className="h-4 w-4 text-[#3fb950]" /> PRIVACY_POLICY.md</div><div className="mt-5 grid gap-4 text-sm text-[#c9d1d9] sm:grid-cols-2"><p><strong className="text-[#e6edf3]">Collected:</strong><br />Repository metadata, activity, README content, and saved results.</p><p><strong className="text-[#e6edf3]">Used for:</strong><br />Scores, recommendations, history, and README suggestions.</p><p><strong className="text-[#e6edf3]">Your control:</strong><br />Choose what to analyze and manage your session in Settings.</p><p><strong className="text-[#e6edf3]">Repository safety:</strong><br />DevLens only reads signals needed for analysis.</p></div></div></div></section>

			<section className="border-t border-[#30363d] bg-[#161b22]"><div className="mx-auto flex max-w-350 flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#58a6ff]">Ready to inspect?</p><h2 className="mt-3 text-3xl font-bold text-[#e6edf3]">Start with one repository.</h2></div><div className="flex flex-col gap-3 sm:flex-row"><Link href="/analyze" className="inline-flex items-center justify-center gap-2 bg-[#238636] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2ea043]">Analyze a repository <ArrowRight className="h-4 w-4" /></Link><Link href="#privacy-policy" className="inline-flex items-center justify-center gap-2 border border-[#30363d] px-5 py-3 text-sm font-semibold text-[#c9d1d9] hover:border-[#58a6ff]">Privacy policy</Link></div></div></section>
		</main>
	);
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) { return <div><p className={`text-2xl font-bold ${accent ? "text-[#3fb950]" : "text-[#e6edf3]"}`}>{value}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b949e]">{label}</p></div>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="border border-[#30363d] bg-[#0d1117] p-4"><div className="flex items-center gap-2 text-[#58a6ff]">{icon}<span className="text-[10px] uppercase tracking-[0.14em] text-[#8b949e]">{label}</span></div><p className="mt-3 text-2xl font-bold text-[#e6edf3]">{value}</p></div>; }
function Step({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) { return <article className="grid gap-4 py-6 sm:grid-cols-[48px_32px_1fr] sm:items-start"><span className="font-mono text-xs font-bold text-[#58a6ff]">{number}</span><span className="text-[#3fb950]">{icon}</span><div><h3 className="font-semibold text-[#e6edf3]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#8b949e]">{text}</p></div></article>; }
function ValueCard({ title, text }: { title: string; text: string }) { return <article className="border border-[#30363d] bg-[#0d1117] p-5"><h3 className="font-semibold text-[#e6edf3]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#8b949e]">{text}</p></article>; }
