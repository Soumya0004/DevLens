import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | DevLens",
  description: "Terms of use for DevLens and repository analysis workflows.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#58a6ff]">Terms and conditions</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#e6edf3]">Terms of use</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[#8b949e]">
          <p>
            DevLens provides tools for understanding repository health, project signals, and maintenance context. By using the app, you agree to use it responsibly and only for lawful purposes.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">Service scope</h2>
          <p>
            DevLens is a project analysis and reporting tool. It is designed to read repository metadata and provide summaries, recommendations, and saved history for engineering work. It is not a substitute for code review, legal review, or compliance review.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">User responsibility</h2>
          <p>
            You are responsible for the repositories you analyze, the decisions you make from the data, and the appropriateness of the information you share or save in the app. Review all project signals in context before making operational or security decisions.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">No warranty</h2>
          <p>
            DevLens is provided on an as-is basis. We aim for accuracy and useful context, but repository data can change quickly and may not reflect the full operational reality of a project at every moment.
          </p>

          <h2 className="text-lg font-semibold text-[#e6edf3]">Changes</h2>
          <p>
            We may update these terms or the product features over time. Continued use of DevLens after updates indicates acceptance of the revised terms.
          </p>
        </div>
      </div>
    </main>
  );
}
