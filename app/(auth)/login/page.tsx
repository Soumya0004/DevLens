"use client";

import { GitFork, Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const message = params.get("message");

      setErrorMessage(
        error === "configuration"
          ? "Authentication is not configured yet."
          : message
            ? `GitHub sign-in could not be completed: ${message}`
            : error
              ? "GitHub sign-in could not be completed. Please try again."
              : "",
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const supabase = createClient();

    if (!supabase) {
      setErrorMessage("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env, then restart the dev server.");
      setIsLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    const redirectTarget = next?.startsWith("/") ? next : "/analyze";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(redirectTarget)}`,
      },
    });

    if (error) {
      console.error("GitHub OAuth sign-in failed:", error.message);
      setErrorMessage(
        error.code === "validation_failed" && error.message.includes("provider is not enabled")
          ? "GitHub login is disabled in Supabase. Enable Authentication > Providers > GitHub, add the GitHub OAuth credentials, and try again."
          : "GitHub sign-in failed. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] p-6">
      <Card className="w-full max-w-md border-[#d8d3c9] bg-[#fffdf9] shadow-xl shadow-slate-900/10">
        <CardHeader className="space-y-4 p-8 pb-6">
          <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <LockKeyhole size={20} strokeWidth={1.8} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-950">Welcome back</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to inspect your repositories and keep engineering health in view.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-8 pt-0">
          <Button className="h-11 w-full gap-2 bg-slate-950 text-white hover:bg-slate-800" onClick={handleGitHubLogin} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <GitFork />}
            {isLoading ? "Connecting..." : "Continue with GitHub"}
          </Button>
          {errorMessage && <p className="text-center text-sm text-red-600" role="alert">{errorMessage}</p>}
          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-center text-xs text-slate-400">Secure access through GitHub OAuth</p>
        </CardContent>
      </Card>
    </main>
  );
}
