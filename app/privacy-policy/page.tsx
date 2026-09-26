import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DevLens",
  description: "How DevLens handles repository data, sessions, and saved analyses.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#58a6ff]">Privacy policy</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#e6edf3]">How DevLens handles your repository data</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[#8b949e]">
          <p>
            DevLens reads repository metadata and activity from GitHub to create a health summary for the project you are reviewing.
            We use that data to generate an analysis, recommendations, and any saved report history tied to your workspace.
          </p>

          <p>
            We do not modify your repository, push changes, or change source files. We only read the metadata and project signals needed to understand the current state of the project.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">Data we may access</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Repository name, owner, README content, and activity metadata</li>
            <li>Pull request and commit information associated with the project</li>
            <li>Saved analysis snapshots and settings in your workspace</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#e6edf3]">How it is used</h2>
          <p>
            The data is used to generate scores, explain project health, support recommendations, and build a history of saved analyses for your account.
            We do not sell repository data or use it for unrelated advertising purposes.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">Your controls</h2>
          <p>
            You control which repositories you analyze, what you save, and how your settings are managed from the app. You can remove saved analysis history in the workspace or disconnect access from your authentication provider if applicable.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">Data retention</h2>
          <p>
            Saved analysis snapshots are kept to support the history and dashboard features in DevLens. If you want a smaller footprint, you can remove saved snapshots from your workspace settings or history screens.
          </p>
        </div>
      </div>
    </main>
  );
}
