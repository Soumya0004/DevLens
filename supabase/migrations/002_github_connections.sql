CREATE TABLE IF NOT EXISTS public.github_connections (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GitHub connection" ON public.github_connections;
CREATE POLICY "Users can view their own GitHub connection"
  ON public.github_connections
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own GitHub connection" ON public.github_connections;
CREATE POLICY "Users can create their own GitHub connection"
  ON public.github_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GitHub connection" ON public.github_connections;
CREATE POLICY "Users can update their own GitHub connection"
  ON public.github_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON TABLE public.github_connections TO authenticated;

NOTIFY pgrst, 'reload schema';