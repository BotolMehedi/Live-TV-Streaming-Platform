-- Cloudflare D1 Database Schema for AHCL
-- Run: wrangler d1 execute ahcl-db --file=./worker/schema.sql

CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT 'admin',
  password TEXT NOT NULL DEFAULT 'admin',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('tv', 'movie')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Insert default admin
INSERT OR IGNORE INTO admin (id, username, password) VALUES (1, 'admin', 'admin');

-- Insert default TV playlists
INSERT INTO playlists (url, type, sort_order) VALUES
  ('https://raw.githubusercontent.com/abusaeeidx/Mrgify-BDIX-IPTV/refs/heads/main/playlist.m3u', 'tv', 1),
  ('https://raw.githubusercontent.com/time2shine/IPTV/refs/heads/master/combined.m3u', 'tv', 2),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/Worldwide/LiveTV.m3u', 'tv', 3),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/USA/LiveTV.m3u', 'tv', 4),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/Pakistan/LiveTV.m3u', 'tv', 5),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/Bangladesh/LiveTV.m3u', 'tv', 6),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/India/LiveTV.m3u', 'tv', 7);

-- Insert default Movie playlists
INSERT INTO playlists (url, type, sort_order) VALUES
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/Movies/Worldwide/Movies.m3u', 'movie', 1),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/Movies/WorldCollection/Movies.m3u', 'movie', 2),
  ('https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/Movies/Bollywood/Movies.m3u', 'movie', 3);