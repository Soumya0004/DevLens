import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DevLens",
  description: "How DevLens handles repository data, sessions, and saved analyses.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-[#0d1117] text-[#c9d1d9]">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16 lg:py-20">
        <div className="grid gap-10 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-16">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#58a6ff]">
              Privacy policy
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-[#e6edf3] md:text-4xl">
              Your privacy
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#8b949e]">
              How DevLens accesses, uses, and stores repository data.
            </p>

            <nav aria-label="Privacy policy sections" className="mt-8 border-l border-[#30363d] pl-4">
              <ul className="space-y-3 text-sm">
                <li><a className="text-[#8b949e] hover:text-[#e6edf3]" href="#data-access">Data we may access</a></li>
                <li><a className="text-[#8b949e] hover:text-[#e6edf3]" href="#data-use">How it is used</a></li>
                <li><a className="text-[#8b949e] hover:text-[#e6edf3]" href="#your-controls">Your controls</a></li>
                <li><a className="text-[#8b949e] hover:text-[#e6edf3]" href="#data-retention">Data retention</a></li>
              </ul>
            </nav>
          </aside>

          <article className="min-w-0 border-t border-[#30363d] lg:border-t-0">
            <section className="border-b border-[#30363d] py-7 md:py-8">
              <p className="text-base leading-7 text-[#c9d1d9]">
                DevLens reads repository metadata and activity from GitHub to create a health summary for the project you are reviewing.
                We use that data to generate an analysis, recommendations, and any saved report history tied to your workspace.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#8b949e]">
                We do not modify your repository, push changes, or change source files. We only read the metadata and project signals needed to understand the current state of the project.
              </p>
            </section>

            <section id="data-access" className="scroll-mt-28 border-b border-[#30363d] py-7 md:py-8">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Data we may access</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#8b949e]">
                <li>Repository name, owner, README content, and activity metadata</li>
                <li>Pull request and commit information associated with the project</li>
                <li>Saved analysis snapshots and settings in your workspace</li>
              </ul>
            </section>

            <section id="data-use" className="scroll-mt-28 border-b border-[#30363d] py-7 md:py-8">
              <h2 className="text-lg font-semibold text-[#e6edf3]">How it is used</h2>
              <p className="mt-4 text-sm leading-7 text-[#8b949e]">
                The data is used to generate scores, explain project health, support recommendations, and build a history of saved analyses for your account.
                We do not sell repository data or use it for unrelated advertising purposes.
              </p>
            </section>

            <section id="your-controls" className="scroll-mt-28 border-b border-[#30363d] py-7 md:py-8">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Your controls</h2>
              <p className="mt-4 text-sm leading-7 text-[#8b949e]">
                You control which repositories you analyze, what you save, and how your settings are managed from the app. You can remove saved analysis history in the workspace or disconnect access from your authentication provider if applicable.
              </p>
            </section>

            <section id="data-retention" className="scroll-mt-28 py-7 md:py-8">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Data retention</h2>
              <p className="mt-4 text-sm leading-7 text-[#8b949e]">
                Saved analysis snapshots are kept to support the history and dashboard features in DevLens. If you want a smaller footprint, you can remove saved snapshots from your workspace settings or history screens.
              </p>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
