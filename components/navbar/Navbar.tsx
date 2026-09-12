"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, GitBranch, LogOut, Menu, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; avatarUrl?: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? {
        email: session.user.email,
        avatarUrl: session.user.user_metadata?.avatar_url,
      } : null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    if (!supabase) return;

    setLoggingOut(true);
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/95 text-[#e6edf3] backdrop-blur-xl">
      <div className="mx-auto flex h-19 max-w-350 items-center justify-between gap-3 px-4 sm:px-5 md:px-10">

        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#18243a] text-[#f2c14e] transition group-hover:rotate-6">
            <GitBranch size={18} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-[#e6edf3]">
              DevLens<span className="text-[#e7654b]">.</span>
            </p>

            <p className="hidden text-[10px] uppercase tracking-[0.18em] text-[#8b949e] sm:block">
              PROJECT INTELLIGENCE
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-[#8b949e] transition hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#8b949e] transition hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/history"
            className="text-sm font-semibold text-[#8b949e] transition hover:text-white"
          >
            History
          </Link>
          <Link
            href="/database"
            className="text-sm font-semibold text-[#8b949e] transition hover:text-white"
          >
            Database
          </Link>
        </nav>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className={`${user ? "hidden" : "block"} rounded-lg px-2 py-2.5 text-sm font-semibold text-[#8b949e] transition hover:text-white sm:px-3`}
          >
            Sign in
          </Link>

          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-lg border border-[#30363d] px-3 py-2 sm:flex">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                ) : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#238636] text-xs font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>}
                <span className="max-w-36 truncate text-xs font-semibold text-[#8b949e]">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Log out"
                title="Log out"
                className="rounded-lg p-2.5 text-[#8b949e] transition hover:bg-[#161b22] hover:text-white disabled:opacity-50"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="group hidden items-center gap-2 rounded-lg bg-[#238636] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ea043] sm:flex sm:px-4"
            >
              <Sparkles size={15} className="text-[#f2c14e]" />
              Analyze
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-[#e6edf3] md:hidden">
            <Menu size={20} />
          </button>
        </div>

      </div>

      {menuOpen ? (
        <nav className="border-t border-[#30363d] bg-[#0d1117] px-5 py-3 md:hidden">
          <div className="mx-auto flex max-w-350 flex-col gap-1">
            {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/history', 'History'], ['/database', 'Database']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-[#161b22] hover:text-white">{label}</Link>
            ))}
          </div>
        </nav>
      ) : null}

    </header>
  );
}