// Allowed Categories & Statuses
const VALID_CATEGORIES = [
  'pothole',
  'water_leak',
  'broken_streetlight',
  'garbage_overflow',
  'open_manhole',
  'exposed_wiring',
  'drainage_overflow',
  'gas_leak',
  'traffic_signal',
  'road_damage',
  'other',
];

const VALID_STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

// Valid Status Transitions map
const ALLOWED_TRANSITIONS = {
  Pending: ['Assigned', 'In Progress', 'Resolved'],
  Assigned: ['Pending', 'In Progress', 'Resolved'],
  'In Progress': ['Assigned', 'Resolved', 'Pending'],
  Resolved: ['Pending'], // Re-opened on citizen verification 'No'
};

/**
 * Validates Vadodara Metro Coordinate Bounds
 * Latitude: ~22.15 to ~22.45
 * Longitude: ~73.05 to ~73.35
 */
function isValidVadodaraCoordinate(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) return false;
  return latitude >= 22.0 && latitude <= 22.6 && longitude >= 73.0 && longitude <= 73.4;
}

/**
 * Validates Complaint Creation Body
 */
function validateCreateComplaint(req, res, next) {
  const { category, latitude, longitude, description, reporter_phone } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required.' });
  }

  const normCat = category.toLowerCase().replace(/\s+/g, '_');
  if (!VALID_CATEGORIES.includes(normCat)) {
    return res.status(400).json({
      error: `Invalid category '${category}'. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  if (latitude !== undefined && longitude !== undefined) {
    if (!isValidVadodaraCoordinate(latitude, longitude)) {
      return res.status(400).json({
        error: 'Coordinates must be within the Vadodara Municipal Corporation jurisdiction (Lat ~22.3, Lng ~73.2).',
      });
    }
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string.' });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description exceeds maximum allowed length of 1000 characters.' });
  }

  next();
}

/**
 * Validates Complaint Status Patch / Update Body
 */
function validateUpdateComplaint(req, res, next) {
  const { status, assigned_officer_id } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status '${status}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
    });
  }

  if (assigned_officer_id !== undefined && assigned_officer_id !== null) {
    const officerId = parseInt(assigned_officer_id, 10);
    if (isNaN(officerId) || officerId <= 0) {
      return res.status(400).json({ error: 'assigned_officer_id must be a positive integer.' });
    }
  }

  next();
}

module.exports = {
  VALID_CATEGORIES,
  VALID_STATUSES,
  ALLOWED_TRANSITIONS,
  isValidVadodaraCoordinate,
  validateCreateComplaint,
  validateUpdateComplaint,
};
