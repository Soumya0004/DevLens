import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Check,
  Code2,
  FileText,
  GitBranch,
  GitFork,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";


const signals = [
  { label: "Code health", value: "88", color: "bg-[#3559e0]" },
  { label: "Security posture", value: "76", color: "bg-[#d7f36b]" },
  { label: "Documentation", value: "91", color: "bg-[#ef9d62]" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f5f0]">
      <section className="relative border-b border-[#dce3dc]">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-[1400px] gap-16 px-5 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cbd6cc] bg-[#f4f5f0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#71807a]"><span className="h-1.5 w-1.5 rounded-full bg-[#3559e0]" />GitHub project intelligence</div>
            <h1 className="display-type max-w-2xl text-[clamp(3.5rem,8vw,7.4rem)] leading-[0.86] text-[#17221f]">Read the shape of your codebase.</h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-[#71807a] md:text-lg">DevLens turns repository activity into a clear project health report, so you can see what is strong, what is drifting, and what to fix next.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/analyze" className="group inline-flex items-center justify-center gap-3 rounded-lg bg-[#17221f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3559e0]">Analyze a repository<ArrowUpRight size={17} className="text-[#d7f36b] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link><Link href="#method" className="inline-flex items-center justify-center rounded-lg border border-[#cbd6cc] px-5 py-3.5 text-sm font-bold text-[#17221f] transition hover:border-[#17221f]">See how it works</Link></div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-semibold text-[#71807a]"><span className="flex items-center gap-2"><LockKeyhole size={14} /> OAuth-ready</span><span className="flex items-center gap-2"><GitFork size={14} /> Built for GitHub</span><span className="flex items-center gap-2"><Check size={14} /> No code changes</span></div>
          </div>
          <div className="relative lg:pl-8"><div className="absolute -inset-8 bg-[#d7f36b]/25 blur-3xl" /><div className="relative overflow-hidden rounded-xl border border-[#26342f] bg-[#17221f] shadow-2xl shadow-[#17221f]/20"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-[11px] font-semibold tracking-[0.12em] text-white/45"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#d7f36b]" /> LIVE REPOSITORY VIEW</span><span>01 / 04</span></div><div className="p-5 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-white/45">PROJECT OVERVIEW</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">vercel / next.js</h2><p className="mt-1 text-sm text-white/45">Updated 8 minutes ago</p></div><div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border-4 border-[#d7f36b] text-[#d7f36b]"><span className="text-xl font-bold">86</span><span className="text-[9px] tracking-widest">HEALTH</span></div></div><div className="mt-9 space-y-5">{signals.map((signal) => <Signal key={signal.label} {...signal} />)}</div><div className="mt-9 grid grid-cols-2 gap-3 border-t border-white/10 pt-5"><Metric icon={<GitBranch size={15} />} label="Branches" value="142" /><Metric icon={<Activity size={15} />} label="30d activity" value="+18%" /></div></div></div><div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-lg border border-[#cbd6cc] bg-[#f4f5f0] px-4 py-3 shadow-xl md:-left-8"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3559e0] text-white"><Sparkles size={15} /></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#71807a]">Next recommendation</p><p className="text-xs font-bold text-[#17221f]">Document your release flow</p></div></div></div>
        </div>
      </section>
      <section id="method" className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28"><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3559e0]">The DevLens method</p><h2 className="display-type mt-4 max-w-sm text-4xl leading-none text-[#17221f] md:text-5xl">Less noise. Better engineering decisions.</h2></div><div className="grid gap-8 sm:grid-cols-3"><Method number="01" icon={<ScanSearch />} title="Connect" text="Choose a GitHub repository or paste its URL. Your existing workflow stays intact." /><Method number="02" icon={<Activity />} title="Understand" text="See activity, structure, quality, documentation, and security signals in one view." /><Method number="03" icon={<ShieldCheck />} title="Improve" text="Turn the report into a focused list of practical next steps for your team." /></div></div></section>

      <section className="border-y border-[#dce3dc] bg-[#e9ede6]">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3559e0]">One workspace, four answers</p>
            <h2 className="display-type mt-4 text-4xl leading-none text-[#17221f] md:text-6xl">Know what is happening inside your project.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#71807a]">DevLens gives a team context before it gives them a score. Explore the signals behind the health number and understand what deserves attention first.</p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#cbd6cc] bg-[#cbd6cc] md:grid-cols-2">
            <Capability icon={<BarChart3 />} label="01 / Project analytics" title="See momentum, not just activity" text="Review commits, pull requests, forks, stars, contributors, languages, and recent changes in one dashboard." />
            <Capability icon={<Code2 />} label="02 / Code quality" title="Find areas that need care" text="Use the repository structure and development signals to spot maintenance risks before they become blockers." />
            <Capability icon={<ShieldCheck />} label="03 / Security posture" title="Make risk visible" text="Surface security-related concerns and configuration patterns so your team knows where to investigate." />
            <Capability icon={<FileText />} label="04 / Documentation" title="Help people contribute" text="Check whether the project explains how to install, run, release, and contribute, then get a clear recommendation." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3559e0]">What you can do</p>
            <h2 className="display-type mt-4 max-w-md text-4xl leading-none text-[#17221f] md:text-6xl">From a GitHub URL to a useful next step.</h2>
          </div>
          <div className="space-y-0 border-t border-[#cbd6cc]">
            <ActionStep number="01" title="Analyze any repository" text="Paste a public GitHub URL or select a connected repository. DevLens fetches the project signals for you." href="/analyze" action="Open Analyze" />
            <ActionStep number="02" title="Explore the dashboard" text="Compare the health score with the underlying activity, language mix, commit rhythm, and developer signals." href="/dashboard" action="View Dashboard" />
            <ActionStep number="03" title="Track improvement over time" text="Return to previous scans and see which projects are healthy, drifting, or ready for a deeper review." href="/history" action="Open History" />
          </div>
        </div>
      </section>

      <section className="border-t border-[#dce3dc] bg-[#17221f] text-white">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7f36b]">For builders and teams</p><h2 className="display-type mt-4 max-w-3xl text-5xl leading-[0.9] md:text-7xl">Make your repository easier to understand.</h2><p className="mt-7 max-w-xl text-base leading-7 text-white/55">Whether you are reviewing a new codebase, preparing a release, or improving a project with collaborators, DevLens gives you a shared starting point.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href="/analyze" className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#d7f36b] px-5 py-3.5 text-sm font-bold text-[#17221f] transition hover:bg-white">Start an analysis <ArrowUpRight size={17} /></Link><Link href="/signup" className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition hover:border-white">Create your workspace <Users size={16} /></Link></div>
        </div>
      </section>
    </main>
  );
}

function Signal({ label, value, color }: { label: string; value: string; color: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-white/60">{label}</span><span className="font-bold text-white">{value}<span className="text-white/40">/100</span></span></div><div className="h-2 rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div></div>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3"><span className="text-[#d7f36b]">{icon}</span><div><p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p><p className="mt-0.5 font-semibold text-white">{value}</p></div></div>; }
function Method({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) { return <article className="border-t border-[#cbd6cc] pt-5"><div className="flex items-center justify-between text-[#3559e0]"><span className="text-xs font-bold tracking-widest">{number}</span>{icon}</div><h3 className="mt-9 text-lg font-bold text-[#17221f]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#71807a]">{text}</p></article>; }
function Capability({ icon, label, title, text }: { icon: React.ReactNode; label: string; title: string; text: string }) { return <article className="bg-[#f4f5f0] p-7 md:p-9"><div className="flex items-center justify-between text-[#3559e0]"><span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#71807a]">{label}</span>{icon}</div><h3 className="mt-12 text-xl font-bold text-[#17221f]">{title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#71807a]">{text}</p></article>; }
function ActionStep({ number, title, text, href, action }: { number: string; title: string; text: string; href: string; action: string }) { return <article className="grid gap-4 border-b border-[#cbd6cc] py-7 md:grid-cols-[60px_1fr_auto] md:items-center"><span className="text-xs font-bold tracking-widest text-[#3559e0]">{number}</span><div><h3 className="text-lg font-bold text-[#17221f]">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#71807a]">{text}</p></div><Link href={href} className="inline-flex items-center gap-2 text-sm font-bold text-[#17221f] transition hover:text-[#3559e0]">{action}<ArrowUpRight size={15} /></Link></article>; }
