const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/citypulse';

const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('supabase.co');

let pool;
let isDbConnected = false;

try {
  pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 2000,
  });

  pool.on('connect', () => {
    isDbConnected = true;
    console.log('✅ Connected to PostgreSQL Database (PostGIS enabled)');
  });

  pool.on('error', (err) => {
    isDbConnected = false;
    console.warn('⚠️ PostgreSQL client idle error, running in demo-fallback mode:', err.message);
  });
} catch (err) {
  console.warn('⚠️ PostgreSQL initialization warning:', err.message);
}

// In-memory fallback mock data
const IN_MEMORY_COMPLAINTS = [
  {
    id: 101,
    category: 'pothole',
    description: 'Deep road crater near Sayajigunj Circle right in front of railway station.',
    latitude: 22.3112,
    longitude: 73.1878,
    ward_id: 1,
    ward_name: 'Ward 1 — Sayajigunj',
    status: 'Pending',
    confirmation_count: 9,
    severity_score: 88,
    reopened_count: 0,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 102,
    category: 'water_leak',
    description: 'Main 600mm distribution pipe leaking clean drinking water on Old Padra Road.',
    latitude: 22.2981,
    longitude: 73.1642,
    ward_id: 2,
    ward_name: 'Ward 2 — Akota',
    status: 'Assigned',
    assigned_officer_id: 1,
    officer_name: 'Rajesh Patel',
    confirmation_count: 6,
    severity_score: 72,
    reopened_count: 0,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 103,
    category: 'open_manhole',
    description: 'Sewer manhole lid missing near Karelibaug Muktanand Circle.',
    latitude: 22.3214,
    longitude: 73.1989,
    ward_id: 4,
    ward_name: 'Ward 4 — Karelibaug',
    status: 'Pending',
    confirmation_count: 14,
    severity_score: 96,
    is_recurring: true,
    total_cycles: 4,
    months_span: 8,
    reopened_count: 1,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 104,
    category: 'broken_streetlight',
    description: 'Continuous stretch of 6 streetlights dead along Mandvi to Champaner Gate.',
    latitude: 22.3025,
    longitude: 73.2054,
    ward_id: 3,
    ward_name: 'Ward 3 — Raopura',
    status: 'In Progress',
    assigned_officer_id: 4,
    officer_name: 'Vikram Solanki',
    confirmation_count: 4,
    severity_score: 52,
    reopened_count: 0,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 105,
    category: 'garbage_overflow',
    description: 'Municipal container overflowing near Fatehgunj Main Market.',
    latitude: 22.3168,
    longitude: 73.1895,
    ward_id: 5,
    ward_name: 'Ward 5 — Fatehgunj',
    status: 'Resolved',
    assigned_officer_id: 3,
    officer_name: 'Sneha Dave',
    confirmation_count: 8,
    severity_score: 60,
    reopened_count: 0,
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
];

const safeQuery = async (text, params) => {
  if (pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn(`[DB Safe Fallback] PostgreSQL query failed (${err.code || err.message}). Serving in-memory fallback.`);
    }
  }

  // Fallback responses based on query pattern
  const lower = text.toLowerCase();
  if (lower.includes('from complaints')) {
    return { rows: IN_MEMORY_COMPLAINTS };
  }
  if (lower.includes('from officers')) {
    return {
      rows: [
        { id: 1, name: 'Rajesh Patel', phone: '+91 98250 12345', department: 'Road & Building Dept', ward_id: 1, ward_name: 'Ward 1 — Sayajigunj', active_complaints: 6, resolved_complaints: 42 },
        { id: 2, name: 'Amit Shah', phone: '+91 98250 23456', department: 'Drainage & Sewerage', ward_id: 4, ward_name: 'Ward 4 — Karelibaug', active_complaints: 8, resolved_complaints: 38 },
        { id: 3, name: 'Sneha Dave', phone: '+91 98250 34567', department: 'Solid Waste Management', ward_id: 5, ward_name: 'Ward 5 — Fatehgunj', active_complaints: 3, resolved_complaints: 55 },
        { id: 4, name: 'Vikram Solanki', phone: '+91 98250 45678', department: 'Electrical & Lighting', ward_id: 3, ward_name: 'Ward 3 — Raopura', active_complaints: 5, resolved_complaints: 47 },
      ]
    };
  }
  if (lower.includes('from wards')) {
    return {
      rows: [
        { id: 1, name: 'Ward 1 — Sayajigunj', ward_number: 1 },
        { id: 2, name: 'Ward 2 — Akota', ward_number: 2 },
        { id: 3, name: 'Ward 3 — Raopura', ward_number: 3 },
        { id: 4, name: 'Ward 4 — Karelibaug', ward_number: 4 },
        { id: 5, name: 'Ward 5 — Fatehgunj', ward_number: 5 },
      ]
    };
  }
  return { rows: [] };
};

module.exports = {
  query: safeQuery,
  pool,
};
