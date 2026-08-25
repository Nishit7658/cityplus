const express = require('express');
const router = express.Router();
const { signToken, requireAuth } = require('../middleware/auth');
const db = require('../config/db');

// Seeded Staff / Dispatcher accounts for VMC Control Center
const SEEDED_USERS = [
  {
    id: 901,
    email: 'admin@vmc.gov.in',
    name: 'VMC Control Officer',
    role: 'admin',
    department: 'Central Municipal Command',
    ward_id: null,
    password: 'VmcGov2026!',
  },
  {
    id: 902,
    email: 'dispatcher@vmc.gov.in',
    name: 'Sayajigunj Zonal Dispatcher',
    role: 'dispatcher',
    department: 'Zonal Redressal Cell',
    ward_id: 1,
    password: 'VmcGov2026!',
  },
  {
    id: 1,
    email: 'rajesh.patel@vmc.gov.in',
    name: 'Rajesh Patel',
    role: 'officer',
    department: 'Road & Building Dept',
    ward_id: 1,
    password: 'VmcGov2026!',
  },
];

/**
 * POST /api/auth/login
 * Staff authentication endpoint returning JWT token
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check matching user
  const user = SEEDED_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
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
