import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured yet" }, { status: 503 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("analysis_snapshots")
    .select("id, user_id, owner, repo, result, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Could not load analysis history:", error.message);
    const tableMissing = error.message.includes("analysis_snapshots") && error.message.includes("schema cache");
    if (tableMissing) {
      return NextResponse.json({
        snapshots: [],
        setupRequired: true,
        message: "History is unavailable because public.analysis_snapshots does not exist in Supabase. Run supabase/migrations/001_analysis_snapshots.sql in Supabase SQL Editor.",
      });
    }

    return NextResponse.json(
      {
        error: `Analysis history is unavailable: ${error.message}`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ snapshots: data ?? [] });
}
