-- CityPulse PostgreSQL + PostGIS Database Schema
-- Run this script in your Supabase SQL Editor or local PostgreSQL database instance.

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Wards Table (Municipal administrative divisions)
CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- 2. Officers Table (Municipal field/department officers)
CREATE TABLE IF NOT EXISTS officers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL
);

-- 3. Problem Spots Table (Persistent historical locations where complaints have ever been logged)
CREATE TABLE IF NOT EXISTS problem_spots (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  first_reported_at TIMESTAMP DEFAULT NOW(),
  total_cycles INTEGER DEFAULT 1,
  total_reports INTEGER DEFAULT 1,
  last_resolved_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS problem_spots_geo_idx ON problem_spots USING GIST (location);

-- 4. Complaints Table (Active & historical citizen reports)
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  reporter_phone TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  status TEXT DEFAULT 'Pending',
  confirmation_count INTEGER DEFAULT 1,
  severity_score NUMERIC DEFAULT 0,
  is_recurring BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  reopened_count INTEGER DEFAULT 0,
  problem_spot_id INTEGER REFERENCES problem_spots(id) ON DELETE SET NULL,
  assigned_officer_id INTEGER REFERENCES officers(id) ON DELETE SET NULL,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS complaints_geo_idx ON complaints USING GIST (location);

-- 5. Confirmations Table (Records unique reporters confirming an active complaint to avoid double counting)
CREATE TABLE IF NOT EXISTS confirmations (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  reporter_phone TEXT NOT NULL,
  confirmed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(complaint_id, reporter_phone)
);

-- 6. Status Logs Table (Audit history for complaint status transitions)
CREATE TABLE IF NOT EXISTS status_logs (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by INTEGER REFERENCES officers(id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);
