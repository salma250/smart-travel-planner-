-- Supabase / Postgres schema for Smart Travel

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id serial PRIMARY KEY,
  title text NOT NULL,
  start_date date,
  end_date date,
  user_id integer REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itineraries (
  id serial PRIMARY KEY,
  trip_id integer REFERENCES trips(id),
  days jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id serial PRIMARY KEY,
  conversation_id text,
  role text,
  type text DEFAULT 'text',
  content text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cities (
  id serial PRIMARY KEY,
  name text,
  country text,
  data jsonb
);
