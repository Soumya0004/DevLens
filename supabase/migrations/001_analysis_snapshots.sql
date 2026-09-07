CREATE TABLE IF NOT EXISTS public.analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analysis_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own analysis snapshots" ON public.analysis_snapshots;
CREATE POLICY "Users can view their own analysis snapshots"
  ON public.analysis_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own analysis snapshots" ON public.analysis_snapshots;
CREATE POLICY "Users can create their own analysis snapshots"
  ON public.analysis_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analysis_snapshots_user_created_idx
  ON public.analysis_snapshots (user_id, created_at DESC);

GRANT SELECT, INSERT ON TABLE public.analysis_snapshots TO authenticated;

NOTIFY pgrst, 'reload schema';