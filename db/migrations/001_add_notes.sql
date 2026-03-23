-- Migration 001: Add notes table and article content extraction columns
-- Run: psql $DATABASE_URL < db/migrations/001_add_notes.sql

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_article ON notes(article_id);

-- Add extracted_content column to articles for cached readable content
ALTER TABLE articles ADD COLUMN IF NOT EXISTS extracted_content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMPTZ;
