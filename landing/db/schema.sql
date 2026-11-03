-- Waitlist table for Cloudflare D1 (binding name: DB).
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  referrer TEXT, country TEXT,
  created_at TEXT NOT NULL
);
