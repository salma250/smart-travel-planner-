-- Run this SQL to create the schema for Smart Travel Planner

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  budget TEXT,
  departure_city TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT,
  location TEXT,
  date DATE,
  price TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  image TEXT,
  comment TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cities dataset table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY,
  city TEXT,
  country TEXT,
  region TEXT,
  short_description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  avg_temp_monthly JSONB,
  ideal_durations JSONB,
  budget_level TEXT,
  culture INTEGER,
  adventure INTEGER,
  nature INTEGER,
  beaches INTEGER,
  nightlife INTEGER,
  cuisine INTEGER,
  wellness INTEGER,
  urban INTEGER,
  seclusion INTEGER
);

-- Hotel bookings dataset table (from jessemostipak/hotel-booking-demand)
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id SERIAL PRIMARY KEY,
  hotel TEXT,
  is_canceled BOOLEAN,
  lead_time INTEGER,
  arrival_date_year INTEGER,
  arrival_date_month TEXT,
  arrival_date_week_number INTEGER,
  arrival_date_day_of_month INTEGER,
  stays_in_weekend_nights INTEGER,
  stays_in_week_nights INTEGER,
  adults INTEGER,
  children INTEGER,
  babies INTEGER,
  meal TEXT,
  country TEXT,
  market_segment TEXT,
  distribution_channel TEXT,
  is_repeated_guest BOOLEAN,
  previous_cancellations INTEGER,
  previous_bookings_not_canceled INTEGER,
  reserved_room_type TEXT,
  assigned_room_type TEXT,
  booking_changes INTEGER,
  deposit_type TEXT,
  agent TEXT,
  company TEXT,
  days_in_waiting_list INTEGER,
  customer_type TEXT,
  adr NUMERIC,
  required_car_parking_spaces INTEGER,
  total_of_special_requests INTEGER,
  reservation_status TEXT,
  reservation_status_date DATE
);
