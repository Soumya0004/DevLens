-- Seed data for DevLens
-- Add your application seed data here when ready.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repository_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  score INTEGER NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
