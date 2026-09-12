import type { SupabaseClient } from "@supabase/supabase-js";

export async function getGithubAccessToken(supabase: SupabaseClient) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.provider_token) {
    if (session.user) {
      await supabase.from("github_connections").upsert({
        user_id: session.user.id,
        access_token: session.provider_token,
        updated_at: new Date().toISOString(),
      });
    }
    return session.provider_token;
  }

  if (!session?.user) {
    return null;
  }

  const { data } = await supabase
    .from("github_connections")
    .select("access_token")
    .eq("user_id", session.user.id)
    .maybeSingle();

  return data?.access_token ?? null;
}