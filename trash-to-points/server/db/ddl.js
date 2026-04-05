/**
 * Here's what this is for:
 * Exports SCHEMA_V2_FULL: the big SQL transaction that creates/drops tables for the v2 data model.
 *
 * How it fits in:
 * Consumed by ensureSchema when upgrading an empty or older DB — defines columns and relationships.
 *
 * Why it matters:
 * Schema mistakes corrupt or lose data; treat edits here like a migration plan, not casual tweaks.
 */
export const SCHEMA_V2_FULL = `
BEGIN;

DROP TABLE IF EXISTS redemptions CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS point_rules CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
  total_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower ON users (lower(btrim(username)));

CREATE TABLE bins (
  id SERIAL PRIMARY KEY,
  bin_code TEXT NOT NULL UNIQUE,
  qr_value TEXT UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  reward_name TEXT NOT NULL,
  points_required INT NOT NULL,
  description TEXT,
  stock INT NOT NULL DEFAULT 0
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bin_code TEXT NOT NULL REFERENCES bins(bin_code),
  image_url TEXT NOT NULL,
  user_reported_quantity INT NOT NULL CHECK (user_reported_quantity >= 1),
  admin_verified_quantity INT,
  points_awarded INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id INT REFERENCES users(id)
);

CREATE TABLE redemptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id INT NOT NULL REFERENCES rewards(id),
  redemption_code TEXT NOT NULL UNIQUE,
  points_used INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Claimed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  schedule TEXT,
  time TEXT,
  location TEXT,
  description TEXT,
  participants TEXT,
  activities TEXT
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);
CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_bins_code ON bins(bin_code);

COMMIT;
`;
