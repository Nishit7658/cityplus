-- CityPulse PostgreSQL + PostGIS Database Schema
-- 100% Free & Open-Source Municipal Grievance Redressal Architecture
-- Vadodara Municipal Corporation (VMC) / Government of Gujarat

-- 0. Enable PostGIS Spatial Engine Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table (Staff, Dispatchers & Municipal Admin JWT Authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'officer' CHECK (role IN ('admin', 'dispatcher', 'officer')),
  department TEXT NOT NULL DEFAULT 'Administration',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- 2. Wards Table (Municipal Administrative Divisions & Centroid Geo-Coordinates)
CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  ward_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  centroid_lat NUMERIC(9, 6) NOT NULL,
  centroid_lng NUMERIC(9, 6) NOT NULL,
  population INTEGER DEFAULT 180000,
  area_sq_km NUMERIC(5, 2) DEFAULT 15.5
);

-- 3. Officers Table (Designated Ward Engineers & Department Personnel)
CREATE TABLE IF NOT EXISTS officers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Problem Spots Table (Persistent Historical Hotspots & Defect Density Tracking)
CREATE TABLE IF NOT EXISTS problem_spots (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  first_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_cycles INTEGER DEFAULT 1,
  total_reports INTEGER DEFAULT 1,
  last_resolved_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS problem_spots_geo_idx ON problem_spots USING GIST (location);

-- 5. Complaints Table (Citizen Grievance Records with Evidence Photos & GIS Point)
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  reporter_phone TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved')),
  confirmation_count INTEGER DEFAULT 1,
  severity_score NUMERIC DEFAULT 0,
  is_recurring BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  photo_after_url TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  reopened_count INTEGER DEFAULT 0,
  problem_spot_id INTEGER REFERENCES problem_spots(id) ON DELETE SET NULL,
  assigned_officer_id INTEGER REFERENCES officers(id) ON DELETE SET NULL,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS complaints_geo_idx ON complaints USING GIST (location);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints (status);
CREATE INDEX IF NOT EXISTS complaints_ward_idx ON complaints (ward_id);

-- 6. Confirmations Table (De-duplicated Citizen Verifications for Multi-Citizen Hotspots)
CREATE TABLE IF NOT EXISTS confirmations (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  reporter_phone TEXT NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(complaint_id, reporter_phone)
);

-- 7. Status Logs Table (Auditable Tamper-Proof Resolution History)
CREATE TABLE IF NOT EXISTS status_logs (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by INTEGER REFERENCES officers(id) ON DELETE SET NULL,
  officer_name TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS status_logs_complaint_idx ON status_logs (complaint_id);
