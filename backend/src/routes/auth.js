const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { signToken, requireAuth } = require('../middleware/auth');
const db = require('../config/db');

// Dedicated Brute-Force Rate Limiter for Login Endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
});

// Seeded Staff / Dispatcher accounts for VMC Control Center (All passwords securely bcrypt-hashed)
const DEFAULT_HASH = bcrypt.hashSync('VmcGov2026!', 10);

const SEEDED_USERS = [
  {
    id: 901,
    email: 'admin@vmc.gov.in',
    name: 'VMC Control Officer',
    role: 'admin',
    department: 'Central Municipal Command',
    ward_id: null,
    password_hash: DEFAULT_HASH,
  },
  {
    id: 902,
    email: 'dispatcher@vmc.gov.in',
    name: 'Sayajigunj Zonal Dispatcher',
    role: 'dispatcher',
    department: 'Zonal Redressal Cell',
    ward_id: 1,
    password_hash: DEFAULT_HASH,
  },
  {
    id: 1,
    email: 'rajesh.patel@vmc.gov.in',
    name: 'Rajesh Patel',
    role: 'officer',
    department: 'Road & Building Dept',
    ward_id: 1,
    password_hash: DEFAULT_HASH,
  },
  {
    id: 3,
    email: 'officer.patel@vmc.gov.in',
    name: 'Rajesh Patel (EE)',
    role: 'officer',
    department: 'Road & Building Dept',
    ward_id: 1,
    password_hash: DEFAULT_HASH,
  },
];

/**
 * POST /api/auth/login
 * Staff authentication endpoint returning JWT token
 * Checks PostgreSQL users table with bcrypt password_hash, or falls back to SEEDED_USERS.
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. Try querying PostgreSQL users table
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
    if (result && result.rows && result.rows.length > 0) {
      const dbUser = result.rows[0];
      const isMatch = await bcrypt.compare(password, dbUser.password_hash);
      if (isMatch) {
        const token = signToken(dbUser);
        return res.json({
          success: true,
          token,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            department: dbUser.department,
            ward_id: dbUser.ward_id,
          },
        });
      }
    }
  } catch (err) {
    // If DB query fails or table does not exist, fall through to SEEDED_USERS
  }

  // 2. Fallback to SEEDED_USERS with bcrypt comparison
  const user = SEEDED_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      ward_id: user.ward_id,
    },
  });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile
 */
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
