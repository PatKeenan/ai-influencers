-- Influence Map — Database Schema
-- Runs automatically on first docker compose up via init script

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  layer INTEGER NOT NULL DEFAULT 1,
  domains TEXT[] NOT NULL DEFAULT '{}',
  role TEXT,
  handle TEXT,
  platform TEXT,
  description TEXT,
  inbound INTEGER NOT NULL DEFAULT 0,
  anchor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE edges (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL REFERENCES people(id),
  target TEXT NOT NULL REFERENCES people(id),
  weight NUMERIC(3,1) NOT NULL DEFAULT 1,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source, target)
);

CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author_id TEXT REFERENCES people(id),
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  category TEXT,
  influence_score NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE article_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for feed sorting
CREATE INDEX idx_articles_feed ON articles(status, influence_score DESC, published_at DESC);
CREATE INDEX idx_articles_author ON articles(author_id);
