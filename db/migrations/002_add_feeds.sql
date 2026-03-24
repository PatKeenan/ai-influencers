CREATE TABLE IF NOT EXISTS feeds (
  id SERIAL PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'substack', 'blog', 'atom')),
  url TEXT NOT NULL UNIQUE,
  last_checked_at TIMESTAMPTZ,
  last_found_at TIMESTAMPTZ,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feeds_person ON feeds(person_id);
