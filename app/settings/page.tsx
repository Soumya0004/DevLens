"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, GitBranch, Info, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const defaultOrganizationKey = "devlens-default-organization";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [defaultOrganization, setDefaultOrganization] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadId = window.setTimeout(() => {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured. Account settings are unavailable.");
        return;
      }

      supabase.auth.getUser().then(({ data, error: userError }) => {
        if (userError || !data.user) {
          setError("Sign in to manage your workspace settings.");
          return;
        }
        setEmail(data.user.email ?? "");
        setDefaultOrganization(window.localStorage.getItem(defaultOrganizationKey) ?? "");
      });
    }, 0);

    return () => window.clearTimeout(loadId);
  }, []);

  const savePreferences = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    window.localStorage.setItem(defaultOrganizationKey, defaultOrganization.trim());
    window.setTimeout(() => {
      setSaving(false);
      setMessage("Workspace preferences saved on this device.");
    }, 250);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#0d1117] p-5 text-[#c9d1d9] md:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#58a6ff]">Settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#e6edf3]">Control your DevLens workspace</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8b949e]">Settings explain how your account is used, where your analysis history belongs, and which repository preference should be ready next time.</p>
        </header>

        {error ? <div className="border border-[#f85149]/40 bg-[#f85149]/10 p-4 text-sm text-[#ff7b72]">{error}</div> : null}
        {message ? <div className="flex items-center gap-2 border border-[#3fb950]/40 bg-[#238636]/10 p-4 text-sm text-[#3fb950]"><Check className="h-4 w-4" /> {message}</div> : null}

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={<UserRound />} title="Account" text="Your signed-in Supabase account identifies which saved analyses you can access." />
          <InfoCard icon={<GitBranch />} title="Repository" text="Choose a default organization as a shortcut. You can still analyze any permitted repository." />
          <InfoCard icon={<ShieldCheck />} title="Privacy" text="DevLens stores analysis snapshots for your workspace and never changes repository code." />
        </section>

        <form onSubmit={savePreferences} className="border border-[#30363d] bg-[#161b22]">
          <div className="border-b border-[#30363d] px-6 py-5"><h2 className="font-semibold text-[#e6edf3]">Workspace preferences</h2><p className="mt-1 text-sm text-[#8b949e]">These preferences make repeated repository reviews faster.</p></div>
          <div className="space-y-5 p-6">
            <div><label htmlFor="account-email" className="mb-2 block text-sm font-medium text-[#c9d1d9]">Signed-in email</label><input id="account-email" value={email} readOnly className="h-11 w-full border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#8b949e] outline-none md:max-w-xl" /><p className="mt-2 text-xs text-[#8b949e]">This comes from your authentication provider and cannot be edited here.</p></div>
            <div><label htmlFor="default-organization" className="mb-2 block text-sm font-medium text-[#c9d1d9]">Default organization or owner</label><input id="default-organization" value={defaultOrganization} onChange={(event) => setDefaultOrganization(event.target.value)} placeholder="your-github-owner" className="h-11 w-full border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#e6edf3] outline-none placeholder:text-[#8b949e] focus:border-[#58a6ff] md:max-w-xl" /><p className="mt-2 text-xs text-[#8b949e]">Used as a personal shortcut only. It does not grant access or create a GitHub connection.</p></div>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#238636] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save preferences"}</button>
          </div>
        </form>

        <section className="border border-[#30363d] bg-[#161b22] p-6"><div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-[#58a6ff]" /><div><h2 className="font-semibold text-[#e6edf3]">How GitHub access works</h2><p className="mt-2 text-sm leading-6 text-[#8b949e]">You do not need to paste a personal access token into this page. DevLens uses the configured GitHub and Supabase authentication flow. Public repository analysis can use a repository URL; connected repository lists require a signed-in GitHub session.</p><Link href="/analyze" className="mt-4 inline-flex text-sm font-semibold text-[#58a6ff] hover:text-white">Go to repository analysis</Link></div></div></section>

        <section className="flex flex-col justify-between gap-4 border border-[#30363d] bg-[#0d1117] p-6 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-[#e6edf3]">Sign out of this workspace</h2><p className="mt-1 text-sm text-[#8b949e]">End the current Supabase session on this device.</p></div><button type="button" onClick={handleLogout} disabled={loggingOut} className="inline-flex items-center justify-center gap-2 border border-[#f85149]/50 px-4 py-2.5 text-sm font-semibold text-[#ff7b72] transition hover:bg-[#f85149]/10 disabled:opacity-60"><LogOut className="h-4 w-4" /> {loggingOut ? "Signing out..." : "Sign out"}</button></section>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="border border-[#30363d] bg-[#161b22] p-5"><div className="flex h-9 w-9 items-center justify-center bg-[#0d1117] text-[#58a6ff]">{icon}</div><h2 className="mt-4 font-semibold text-[#e6edf3]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#8b949e]">{text}</p></article>;
}
