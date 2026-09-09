"use client";

import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
	ArrowRight,
	Check,
	ChevronRight,
	GitBranch,
	LockKeyhole,
	Search,
	ShieldCheck,
	Zap,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
	const [repository, setRepository] = useState("");
	const homeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const home = homeRef.current;

		if (!home) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		const context = gsap.context(() => {
			gsap.from("[data-gsap-hero]", {
				x: -70,
				opacity: 0,
				duration: 1,
				ease: "power3.out",
				stagger: 0.15,
			});

			gsap.utils
				.toArray<HTMLElement>("[data-yellow-heading]")
				.forEach((heading, index) => {
					gsap.from(heading, {
						clipPath: "inset(0 100% 0 0)",
						opacity: 0,
						y: 20,
						duration: 0.9,
						delay: index * 0.05,
						ease: "power4.out",
						scrollTrigger: {
							trigger: heading,
							start: "top 85%",
							toggleActions: "play none none reverse",
						},
					});
				});

			gsap.from("[data-gsap-repository]", {
				x: 80,
				opacity: 0,
				duration: 1.1,
				delay: 0.2,
				ease: "power3.out",
			});

			gsap.to("[data-gsap-repository]", {
				y: -35,
				ease: "none",
				scrollTrigger: {
					trigger: "[data-gsap-repository]",
					start: "top bottom",
					end: "bottom top",
					scrub: 1.2,
				},
			});

			gsap.utils
				.toArray<HTMLElement>("main > section:not(:first-child)")
				.forEach((element) => {
					gsap.from(element, {
						y: 60,
						opacity: 0,
						duration: 0.9,
						ease: "power3.out",
						scrollTrigger: {
							trigger: element,
							start: "top 82%",
							toggleActions: "play none none reverse",
						},
					});
				});

			gsap.utils
				.toArray<HTMLElement>("[data-gsap-card]")
				.forEach((card, index) => {
					gsap.from(card, {
						y: 40,
						opacity: 0,
						scale: 0.97,
						duration: 0.7,
						delay: index * 0.05,
						ease: "power3.out",
						scrollTrigger: {
							trigger: card,
							start: "top 88%",
							toggleActions: "play none none reverse",
						},
					});
				});

			gsap.utils
				.toArray<HTMLElement>("[data-gsap-step]")
				.forEach((step, index) => {
					gsap.from(step, {
						x: 50,
						opacity: 0,
						duration: 0.75,
						delay: index * 0.12,
						ease: "power3.out",
						scrollTrigger: {
							trigger: step,
							start: "top 88%",
							toggleActions: "play none none reverse",
						},
					});
				});

			gsap.utils
				.toArray<HTMLElement>("[data-gsap-stat]")
				.forEach((stat, index) => {
					gsap.from(stat, {
						y: 25,
						opacity: 0,
						duration: 0.6,
						delay: index * 0.1,
						ease: "power2.out",
						scrollTrigger: {
							trigger: stat,
							start: "top 90%",
							toggleActions: "play none none reverse",
						},
					});
				});

			gsap.from("[data-gsap-privacy]", {
				x: 60,
				opacity: 0,
				duration: 0.8,
				ease: "power3.out",
				scrollTrigger: {
					trigger: "[data-gsap-privacy]",
					start: "top 82%",
					toggleActions: "play none none reverse",
				},
			});

			gsap.to("[data-gsap-background]", {
				y: 100,
				ease: "none",
				scrollTrigger: {
					trigger: "[data-gsap-background]",
					start: "top top",
					end: "bottom top",
					scrub: 1,
				},
			});
		}, home);

		return () => context.revert();
	}, []);

	function handleAnalyze(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		window.location.href = repository.trim()
			? `/analyze?repo=${encodeURIComponent(repository.trim())}`
			: "/analyze";
	}

	return (
		<main
			ref={homeRef}
			className="min-h-screen overflow-hidden bg-[#0d1117] text-[#c9d1d9]"
		>
			<section className="relative overflow-hidden border-b border-[#30363d]">
				<div
					data-gsap-background
					className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(88,166,255,0.16),transparent_35%),radial-gradient(circle_at_0%_80%,rgba(35,134,54,0.12),transparent_30%)]"
				/>

				<div className="relative mx-auto grid max-w-350 gap-14 px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
					<div data-gsap-hero>
						<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b949e]">
							<span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
							GitHub project intelligence
						</div>

						<h1
							data-yellow-heading
							className="max-w-2xl text-5xl font-bold leading-[0.95] tracking-tight text-[#0d1117] md:text-7xl"
						>
							<span className="box-decoration-clone bg-[#f6c453] px-2 py-1">
								Know the shape of a codebase before you change it.
							</span>
						</h1>

						<p className="mt-7 max-w-xl text-base leading-7 text-[#8b949e] md:text-lg">
							DevLens reads the signals around a GitHub repository and
							turns them into a health report your team can understand
							and act on.
						</p>

						<form
							onSubmit={handleAnalyze}
							className="mt-9 max-w-xl"
						>
							<label
								htmlFor="repository"
								className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8b949e]"
							>
								Start with a repository
							</label>

							<div className="flex flex-col gap-2 sm:flex-row">
								<div className="relative flex-1">
									<Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8b949e]" />

									<input
										id="repository"
										value={repository}
										onChange={(event) =>
											setRepository(event.target.value)
										}
										placeholder="owner/repository or GitHub URL"
										className="h-11 w-full rounded-md border border-[#30363d] bg-[#161b22] pl-10 pr-3 text-sm text-[#e6edf3] outline-none placeholder:text-[#8b949e] focus:border-[#58a6ff]"
									/>
								</div>

								<button
									type="submit"
									className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#238636] px-5 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
								>
									Analyze repository
									<ArrowRight className="h-4 w-4" />
								</button>
							</div>
						</form>

						<div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#8b949e]">
							<span className="flex items-center gap-2">
								<LockKeyhole className="h-3.5 w-3.5 text-[#3fb950]" />
								OAuth protected
							</span>

							<span className="flex items-center gap-2">
								<Check className="h-3.5 w-3.5 text-[#3fb950]" />
								No repository changes
							</span>

							<span className="flex items-center gap-2">
								<Zap className="h-3.5 w-3.5 text-[#d29922]" />
								Fast first read
							</span>
						</div>
					</div>

					<div className="relative">
						<div className="absolute -inset-8 bg-[#58a6ff]/10 blur-3xl" />

						<div
							data-gsap-repository
							className="relative rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl shadow-black/30"
						>
							<div className="flex items-center justify-between border-b border-[#30363d] px-5 py-4">
								<span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8b949e]">
									<GitBranch className="h-4 w-4 text-[#3fb950]" />
									GitHub repository
								</span>

								<span className="font-mono text-xs text-[#8b949e]">
									public
								</span>
							</div>

							<div className="p-5 md:p-7">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b949e]">
											Repository
										</p>

										<h2 className="mt-2 text-2xl font-semibold text-[#e6edf3]">
											vercel / next.js
										</h2>

										<p className="mt-1 text-sm text-[#8b949e]">
											The React framework for the web
										</p>
									</div>

									<span className="rounded-full border border-[#30363d] px-3 py-1 text-xs text-[#8b949e]">
										TypeScript
									</span>
								</div>

								<div className="mt-6 flex items-center gap-3 border-y border-[#30363d] py-3 text-xs text-[#8b949e]">
									<span className="rounded-md border border-[#30363d] px-3 py-1.5 font-mono text-[#c9d1d9]">
										main
									</span>

									<span>24 contributors</span>
									<span>148 commits</span>
								</div>

								<div className="mt-5 overflow-hidden rounded-md border border-[#30363d]">
									<div className="grid grid-cols-[1fr_auto] border-b border-[#30363d] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8b949e]">
										<span>Files</span>
										<span>Latest commit</span>
									</div>

									<div className="divide-y divide-[#30363d] text-sm">
										<GithubRow
											name="app"
											type="folder"
											detail="Improve app router loading"
										/>

										<GithubRow
											name="packages"
											type="folder"
											detail="Update compiler packages"
										/>

										<GithubRow
											name="README.md"
											type="file"
											detail="Clarify getting started"
										/>

										<GithubRow
											name="package.json"
											type="file"
											detail="Refresh dependencies"
										/>
									</div>
								</div>

								<div className="mt-5 flex items-center justify-between text-xs text-[#8b949e]">
									<span>Updated 2 hours ago</span>

									<span className="font-semibold text-[#58a6ff]">
										View repository{" "}
										<ArrowRight className="ml-1 inline h-3.5 w-3.5" />
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="border-b border-[#30363d] bg-[#161b22]">
				<div className="mx-auto grid max-w-350 gap-6 px-5 py-8 md:grid-cols-4 md:px-10">
					<div data-gsap-stat>
						<Stat value="4" label="Health dimensions" />
					</div>

					<div data-gsap-stat>
						<Stat value="50+" label="Signals collected" />
					</div>

					<div data-gsap-stat>
						<Stat value="90 sec" label="Typical first scan" />
					</div>

					<div data-gsap-stat>
						<Stat
							value="Actionable"
							label="Every report ends with a next step"
							accent
						/>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-350 px-5 py-20 md:px-10 md:py-28">
				<div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#58a6ff]">
							How it works
						</p>

						<div className="mt-4">
							<YellowHeading>
								A clear read in three moves.
							</YellowHeading>
						</div>

						<p className="mt-7 max-w-sm text-sm leading-6 text-[#8b949e]">
							A shared starting point for repository reviews,
							onboarding, release planning, and maintenance.
						</p>
					</div>

					<div className="divide-y divide-[#30363d] border-y border-[#30363d]">
						<div data-gsap-step>
							<Step
								number="01"
								icon={<GitBranch />}
								title="Connect"
								text="Paste a public GitHub URL or choose a repository from your connected account."
							/>
						</div>

						<div data-gsap-step>
							<Step
								number="02"
								icon={<ShieldCheck />}
								title="Understand"
								text="See the evidence behind quality, documentation, security, and activity scores."
							/>
						</div>

						<div data-gsap-step>
							<Step
								number="03"
								icon={<ArrowRight />}
								title="Act"
								text="Save the snapshot, follow the recommendation, and generate a README suggestion."
							/>
						</div>
					</div>
				</div>
			</section>

			<section className="border-y border-[#30363d] bg-[#161b22]">
				<div className="mx-auto grid max-w-350 gap-10 px-5 py-20 md:grid-cols-2 md:px-10 md:py-24">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3fb950]">
							Built for useful decisions
						</p>

						<div className="mt-4">
							<YellowHeading>
								Less time decoding. More time improving.
							</YellowHeading>
						</div>

						<p className="mt-7 max-w-lg text-sm leading-7 text-[#8b949e]">
							Use DevLens before adopting a library, joining a team,
							reviewing a codebase, or preparing a release. It turns
							scattered GitHub signals into context people can discuss.
						</p>

						<Link
							href="/dashboard"
							className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#58a6ff] hover:text-white"
						>
							Explore the dashboard
							<ChevronRight className="h-4 w-4" />
						</Link>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<ValueCard
							title="Review"
							text="Focus attention on the risks that matter."
						/>

						<ValueCard
							title="Onboard"
							text="Understand the project before changing it."
						/>

						<ValueCard
							title="Track"
							text="Compare saved health snapshots over time."
						/>

						<ValueCard
							title="Explain"
							text="Turn analysis into a README starting point."
						/>
					</div>
				</div>
			</section>

			<section
				id="privacy-policy"
				className="mx-auto max-w-350 px-5 py-20 md:px-10 md:py-24"
			>
				<div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d29922]">
							Privacy policy
						</p>

						<div className="mt-4">
							<YellowHeading>
								Your repository stays yours.
							</YellowHeading>
						</div>

						<p className="mt-7 text-sm leading-7 text-[#8b949e]">
							DevLens uses repository metadata and activity to create
							your report. It does not modify repositories, ask you to
							paste source code, or sell your analysis data.
						</p>

						<Link
							href="/settings"
							className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#58a6ff] hover:text-white"
						>
							Review settings
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>

					<div
						data-gsap-privacy
						className="border border-[#30363d] bg-[#161b22] p-6"
					>
						<div className="flex items-center gap-2 border-b border-[#30363d] pb-4 font-mono text-xs text-[#8b949e]">
							<LockKeyhole className="h-4 w-4 text-[#3fb950]" />
							PRIVACY_POLICY.md
						</div>

						<div className="mt-5 grid gap-4 text-sm text-[#c9d1d9] sm:grid-cols-2">
							<p>
								<strong className="text-[#e6edf3]">
									Collected:
								</strong>
								<br />
								Repository metadata, activity, README content,
								and saved results.
							</p>

							<p>
								<strong className="text-[#e6edf3]">
									Used for:
								</strong>
								<br />
								Scores, recommendations, history, and README
								suggestions.
							</p>

							<p>
								<strong className="text-[#e6edf3]">
									Your control:
								</strong>
								<br />
								Choose what to analyze and manage your session
								in Settings.
							</p>

							<p>
								<strong className="text-[#e6edf3]">
									Repository safety:
								</strong>
								<br />
								DevLens only reads signals needed for analysis.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section
				id="user-experience-review"
				className="border-y border-[#30363d] bg-[#161b22]"
			>
				<div className="mx-auto grid max-w-350 gap-10 px-5 py-20 md:grid-cols-2 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#58a6ff]">
							User experience review
						</p>

						<div className="mt-4">
							<YellowHeading>
								Every report should feel easy to use.
							</YellowHeading>
						</div>

						<p className="mt-7 text-sm leading-7 text-[#8b949e]">
							We review the product around the work developers
							actually need to do: start quickly, understand the
							evidence, and know what to do next.
						</p>

						<Link
							href="/analyze"
							className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#58a6ff] hover:text-white"
						>
							Try the analysis flow
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<ReviewCard
							title="Start clearly"
							text="One repository field and one obvious next action."
						/>

						<ReviewCard
							title="Scan quickly"
							text="Scores, evidence, and trends are structured for comparison."
						/>

						<ReviewCard
							title="Stay oriented"
							text="Loading, empty, and error states explain what happens next."
						/>

						<ReviewCard
							title="Act confidently"
							text="Recommendations connect directly to the underlying signal."
						/>
					</div>
				</div>
			</section>

			<section className="border-t border-[#30363d] bg-[#161b22]">
				<div className="mx-auto flex max-w-350 flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-10">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#58a6ff]">
							Ready to inspect?
						</p>

						<div className="mt-4">
							<h2
								data-yellow-heading
								className="inline-block text-3xl font-bold leading-tight tracking-tight text-[#0d1117]"
							>
								<span className="box-decoration-clone bg-[#f6c453] px-2 py-1">
									Start with one repository.
								</span>
							</h2>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Link
							href="/analyze"
							className="inline-flex items-center justify-center gap-2 bg-[#238636] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2ea043]"
						>
							Analyze a repository
							<ArrowRight className="h-4 w-4" />
						</Link>

						<Link
							href="#privacy-policy"
							className="inline-flex items-center justify-center gap-2 border border-[#30363d] px-5 py-3 text-sm font-semibold text-[#c9d1d9] hover:border-[#58a6ff]"
						>
							Privacy policy
						</Link>

						<Link
							href="#user-experience-review"
							className="inline-flex items-center justify-center gap-2 border border-[#30363d] px-5 py-3 text-sm font-semibold text-[#c9d1d9] hover:border-[#58a6ff]"
						>
							UX review
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}

function YellowHeading({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<h2
			data-yellow-heading
			className={`inline-block max-w-lg text-4xl font-bold leading-[1.05] tracking-tight text-[#0d1117] ${className}`}
		>
			<span className="box-decoration-clone bg-[#f6c453] px-2 py-1">
				{children}
			</span>
		</h2>
	);
}

function Stat({
	value,
	label,
	accent = false,
}: {
	value: string;
	label: string;
	accent?: boolean;
}) {
	return (
		<div>
			<p
				className={`text-2xl font-bold ${
					accent ? "text-[#3fb950]" : "text-[#e6edf3]"
				}`}
			>
				{value}
			</p>

			<p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b949e]">
				{label}
			</p>
		</div>
	);
}

function Step({
	number,
	icon,
	title,
	text,
}: {
	number: string;
	icon: ReactNode;
	title: string;
	text: string;
}) {
	return (
		<article className="grid gap-4 py-6 sm:grid-cols-[48px_32px_1fr] sm:items-start">
			<span className="font-mono text-xs font-bold text-[#58a6ff]">
				{number}
			</span>

			<span className="text-[#3fb950]">{icon}</span>

			<div>
				<h3 className="font-semibold text-[#e6edf3]">{title}</h3>

				<p className="mt-2 text-sm leading-6 text-[#8b949e]">
					{text}
				</p>
			</div>
		</article>
	);
}

function ValueCard({
	title,
	text,
}: {
	title: string;
	text: string;
}) {
	return (
		<article
			data-gsap-card
			className="border border-[#30363d] bg-[#0d1117] p-5 transition-colors duration-300 hover:border-[#58a6ff]"
		>
			<h3 className="font-semibold text-[#e6edf3]">{title}</h3>

			<p className="mt-2 text-sm leading-6 text-[#8b949e]">
				{text}
			</p>
		</article>
	);
}

function ReviewCard({
	title,
	text,
}: {
	title: string;
	text: string;
}) {
	return (
		<article
			data-gsap-card
			className="border border-[#30363d] bg-[#0d1117] p-5 transition-colors duration-300 hover:border-[#58a6ff]"
		>
			<h3 className="font-semibold text-[#e6edf3]">{title}</h3>

			<p className="mt-2 text-sm leading-6 text-[#8b949e]">
				{text}
			</p>
		</article>
	);
}

function GithubRow({
	name,
	type,
	detail,
}: {
	name: string;
	type: "file" | "folder";
	detail: string;
}) {
	return (
		<div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-[#1c2128]">
			<span className="flex items-center gap-2 text-[#c9d1d9]">
				<span
					className={
						type === "folder"
							? "text-[#58a6ff]"
							: "text-[#8b949e]"
					}
				>
					{type === "folder" ? "▸" : "·"}
				</span>

				{name}
			</span>

			<span className="max-w-44 truncate text-xs text-[#8b949e]">
				{detail}
			</span>
		</div>
	);
}