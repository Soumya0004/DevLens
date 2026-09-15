"use client";

import { GitFork, Loader2, LockKeyhole, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export const OPEN_LOGIN_EVENT = "devlens:open-login";

type LoginModalProps = {
  open: boolean;
  required?: boolean;
  onClose: () => void;
};

function getCurrentTarget() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getUrlErrorMessage() {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const message = params.get("message");

  return error === "configuration"
    ? "Authentication is not configured yet."
    : message
      ? `GitHub sign-in could not be completed: ${message}`
      : error
        ? "GitHub sign-in could not be completed. Please try again."
        : "";
}

export function LoginModal({ open, required = false, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open || required) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose, required]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    if (!supabase) {
      setErrorMessage(
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env, then restart the dev server.",
      );
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(getCurrentTarget())}`,
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

  if (!open) return null;

  const visibleErrorMessage = errorMessage || getUrlErrorMessage();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onMouseDown={(event) => {
        if (!required && event.target === event.currentTarget) onClose();
      }}
    >
      <Card className="relative w-full max-w-md border-[#d8d3c9] bg-[#fffdf9] shadow-2xl shadow-slate-950/30">
        {!required && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign-in dialog"
            className="absolute right-4 top-4 rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X size={18} />
          </button>
        )}

        <CardHeader className="space-y-4 p-8 pb-6">
          <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <LockKeyhole size={20} strokeWidth={1.8} />
          </div>
          <div className="space-y-2">
            <CardTitle id="login-modal-title" className="text-3xl font-bold tracking-tight text-slate-950">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to inspect your repositories and keep engineering health in view.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-8 pt-0">
          <Button
            className="h-11 w-full gap-2 bg-slate-950 text-white hover:bg-slate-800"
            onClick={handleGitHubLogin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <GitFork />}
            {isLoading ? "Connecting..." : "Continue with GitHub"}
          </Button>

          {visibleErrorMessage && (
            <p className="text-center text-sm text-red-600" role="alert">
              {visibleErrorMessage}
            </p>
          )}

          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link
              href="/signup"
              onClick={onClose}
              className="font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400">
            Secure access through GitHub OAuth
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
