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

  return NextResponse.redirect(new URL(redirectTarget, request.url));
}
