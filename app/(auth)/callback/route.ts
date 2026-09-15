import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const redirectTarget = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  const redirectWithError = (error: string, message?: string) => {
    const errorUrl = new URL(redirectTarget, request.url);
    errorUrl.searchParams.set("error", error);
    if (message) errorUrl.searchParams.set("message", message);
    return NextResponse.redirect(errorUrl);
  };

  if (oauthError) {
    return redirectWithError("oauth", oauthError);
  }

  if (!code) {
    return redirectWithError("missing_code");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return redirectWithError("configuration");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithError("oauth");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user && session.provider_token) {
    await supabase.from("github_connections").upsert({
      user_id: session.user.id,
      access_token: session.provider_token,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.redirect(new URL(redirectTarget, request.url));
}
