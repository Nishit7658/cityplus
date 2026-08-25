const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'vmc_citypulse_gov_jwt_secret_key_2026';

/**
 * Signs a JWT token for a staff member / officer
 */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'officer',
      ward_id: user.ward_id || null,
      department: user.department || null,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Authentication Middleware: Enforces valid JWT token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Optional Auth Middleware: Attaches req.user if token is present, but doesn't block unauthenticated requests
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore
    }
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string[]} allowedRoles - e.g. ['admin', 'dispatcher', 'officer']
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
}

module.exports = {
  signToken,
  requireAuth,
  optionalAuth,
  requireRole,
  JWT_SECRET,
};
