-- WHAT THIS FILE IS: Human-readable reference for the Postgres tables (users, submissions, rewards, …).
-- IN THIS PROJECT: The running app applies the real schema from ddl.js via ensureSchema.js on boot — this file
--   does not auto-sync; change ddl/ensureSchema for behavior, keep this for docs and DBA discussions.
-- WHY IT MATTERS: One place to read column types and relationships without spelunking JS strings.

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

CREATE UNIQUE INDEX users_username_lower ON users (lower(btrim(username)));

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
