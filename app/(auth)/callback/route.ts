import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const redirectTarget = next?.startsWith("/") ? next : "/analyze";
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/login?error=oauth&message=${encodeURIComponent(oauthError)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
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
