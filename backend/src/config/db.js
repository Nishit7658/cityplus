const { Pool } = require('pg');
const inMemoryStore = require('./inMemoryStore');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/citypulse';

const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('supabase.co');

let pool = null;
let isDbConnected = false;

try {
  pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: process.env.NODE_ENV === 'test' ? 200 : 2500,
    idleTimeoutMillis: 10000,
    max: 20,
  });

  pool.on('connect', () => {
    isDbConnected = true;
  });

  pool.on('error', (err) => {
    isDbConnected = false;
  });
} catch (err) {
  console.warn('⚠️ PostgreSQL initialization info:', err.message);
}

/**
 * Universal Database Query Interface
 * 1. Tries PostgreSQL Pool first.
 * 2. If PostgreSQL is offline/inaccessible, routes queries through the in-memory transactional store
 *    preserving SQL semantics, accurate status/category/ward filtering, and real 404 behavior.
 */
const safeQuery = async (text, params = []) => {
  if (pool) {
    try {
      const result = await pool.query(text, params);
      isDbConnected = true;
      return result;
    } catch (err) {
      isDbConnected = false;
      // If error is a network connection failure, route to inMemoryStore
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message.includes('timeout') || err.message.includes('connect')) {
        // Fall through to inMemoryStore
      } else {
        // Legitimate SQL syntax or constraint errors should throw
        throw err;
      }
    }
  }

  return inMemoryStore.executeInMemoryQuery(text, params);
};

module.exports = {
  query: safeQuery,
  pool,
  getIsDbConnected: () => isDbConnected,
  inMemoryStore,
};
