const db = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');

// High-risk categories that get a fixed +50 floor on severity score
const HIGH_RISK_CATEGORIES = ['open_manhole', 'exposed_wiring', 'gas_leak'];

/**
 * Calculates severity score based on prompt specification:
 * confirmation_count * 2 + days_pending * 0.5 + category_weight (+50 for high risk)
 */
function calculateSeverityScore(confirmationCount, createdAt, category) {
  const normalizedCategory = (category || '').toLowerCase().replace(/\s+/g, '_');
  const isHighRisk = HIGH_RISK_CATEGORIES.includes(normalizedCategory);
  const categoryWeight = isHighRisk ? 50 : 0;
  
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const daysPending = Math.max(0, (new Date() - createdDate) / (1000 * 60 * 60 * 24));
  
  const score = (confirmationCount * 2) + (daysPending * 0.5) + categoryWeight;
  return Math.round(score * 10) / 10;
}

/**
 * Normalizes input category strings to standard database format
 */
function normalizeCategory(cat) {
  if (!cat) return 'pothole';
  const c = cat.toLowerCase();
  if (c.includes('manhole')) return 'open_manhole';
  if (c.includes('wiring') || c.includes('wire') || c.includes('electric')) return 'exposed_wiring';
  if (c.includes('gas')) return 'gas_leak';
  if (c.includes('pot') || c.includes('road')) return 'pothole';
  if (c.includes('water') || c.includes('leak')) return 'water_leak';
  if (c.includes('light') || c.includes('street')) return 'broken_streetlight';
  if (c.includes('garb') || c.includes('trash') || c.includes('waste')) return 'garbage_overflow';
  return cat.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Assigns nearest VMC Ward geographically based on coordinates
 */
async function assignGeographicWard(lat, lng) {
  try {
    const query = `
      SELECT id, name
      FROM wards
      ORDER BY ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) ASC
      LIMIT 1;
    `;
    const res = await db.query(query, [lng, lat]);
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }
  } catch (err) {
    // Fall back to Haversine nearest ward
  }

  const nearest = inMemoryStore.findNearestWard(lat, lng);
  return nearest.id;
}

/**
 * Main GIS processing function for incoming WhatsApp/Telegram/API reports
 * 1. Checks 18m PostGIS radius for active unresolved complaint of same category
 * 2. Checks problem_spots for persistent location history
 * 3. Creates complaint or increments confirmation_count atomically
 */
async function processIncomingReport({ latitude, longitude, category, reporterPhone, description, photoUrl }) {
  const normCategory = normalizeCategory(category);
  const lat = parseFloat(latitude) || 22.3072;
  const lng = parseFloat(longitude) || 73.1812;

  // 1. Check PostGIS for active unresolved complaint of SAME category within 18m radius
  const matchQuery = `
    SELECT id, category, status, confirmation_count, created_at, is_recurring, problem_spot_id, ward_id,
           ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
    FROM complaints
    WHERE status != 'Resolved'
      AND category = $1
      AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, 18)
    ORDER BY created_at ASC
    LIMIT 1;
  `;

  const matchRes = await db.query(matchQuery, [normCategory, lng, lat]);

  if (matchRes.rows.length > 0) {
    const existing = matchRes.rows[0];

    // Check if this reporter already confirmed this specific complaint
    const checkConfirmQuery = `
      SELECT id FROM confirmations WHERE complaint_id = $1 AND reporter_phone = $2;
    `;
    const confirmRes = await db.query(checkConfirmQuery, [existing.id, reporterPhone]);

    if (confirmRes.rows.length > 0) {
      // Already confirmed by this phone number - return without inflating count twice
      return {
        action: 'already_confirmed',
        complaint: existing,
        message: 'You have already reported/confirmed this issue. Our team is working on it!'
      };
    }

    // Increment confirmation_count & update severity_score
    const newCount = (existing.confirmation_count || 1) + 1;
    const newSeverity = calculateSeverityScore(newCount, existing.created_at, normCategory);

    const updateQuery = `
      UPDATE complaints
      SET confirmation_count = $1,
          severity_score = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, category, description, reporter_phone, status, confirmation_count, severity_score, is_recurring, ward_id, created_at, updated_at,
                ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;
    `;
    const updatedRes = await db.query(updateQuery, [newCount, newSeverity, existing.id]);

    // Record confirmation
    await db.query(
      `INSERT INTO confirmations (complaint_id, reporter_phone) VALUES ($1, $2);`,
      [existing.id, reporterPhone]
    );

    return {
      action: 'incremented',
      complaint: updatedRes.rows[0],
      message: `Thanks! We added your verification to existing report #${existing.id}. Confirmation count is now ${newCount}.`
    };
  }

  // 2. Check persistent problem_spots table for history at this location (18m radius)
  const spotQuery = `
    SELECT id, total_cycles, total_reports, first_reported_at, last_resolved_at,
           EXTRACT(EPOCH FROM (NOW() - first_reported_at))/2592000 as months_span
    FROM problem_spots
    WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 18)
    LIMIT 1;
  `;
  const spotRes = await db.query(spotQuery, [lng, lat]);

  let problemSpotId = null;
  let isRecurring = false;
  let totalCycles = 1;
  let monthsSpan = 1;

  if (spotRes.rows.length > 0) {
    // Location has historical records
    const spot = spotRes.rows[0];
    problemSpotId = spot.id;
    totalCycles = (spot.total_cycles || 1) + 1;
    monthsSpan = Math.max(1, Math.round(spot.months_span || 1));
    isRecurring = true;

    await db.query(
      `UPDATE problem_spots SET total_cycles = $1, total_reports = total_reports + 1 WHERE id = $2;`,
      [totalCycles, problemSpotId]
    );
  } else {
    // Create new problem_spot
    try {
      const newSpotRes = await db.query(
        `INSERT INTO problem_spots (category, location, total_cycles, total_reports)
         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, 1, 1)
         RETURNING id;`,
        [normCategory, lng, lat]
      );
      if (newSpotRes.rows.length > 0) {
        problemSpotId = newSpotRes.rows[0].id;
      }
    } catch {
      // ignore
    }
  }

  // Assign geographic ward
  const wardId = await assignGeographicWard(lat, lng);

  // Calculate initial severity score
  const initialSeverity = calculateSeverityScore(1, new Date(), normCategory);

  // 3. Create new complaint
  const insertComplaintQuery = `
    INSERT INTO complaints (
      category, description, reporter_phone, location, status, confirmation_count,
      severity_score, is_recurring, problem_spot_id, ward_id, photo_url
    )
    VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, 'Pending', 1, $6, $7, $8, $9, $10)
    RETURNING id, category, description, reporter_phone, status, confirmation_count, severity_score, is_recurring, reopened_count, problem_spot_id, ward_id, photo_url, photo_after_url, created_at, updated_at,
              ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;
  `;

  const newComplaintRes = await db.query(insertComplaintQuery, [
    normCategory,
    description || `Reported by citizen (${reporterPhone})`,
    reporterPhone,
    lng,
    lat,
    initialSeverity,
    isRecurring,
    problemSpotId,
    wardId,
    photoUrl || null,
  ]);

  const createdComplaint = newComplaintRes.rows[0];

  // Record initial confirmation
  await db.query(
    `INSERT INTO confirmations (complaint_id, reporter_phone) VALUES ($1, $2);`,
    [createdComplaint.id, reporterPhone]
  );

  return {
    action: 'created',
    complaint: {
      ...createdComplaint,
      total_cycles: totalCycles,
      months_span: monthsSpan
    },
    message: isRecurring
      ? `Report #${createdComplaint.id} registered! ⚠️ Note: This spot has been reported ${totalCycles} times previously.`
      : `Report #${createdComplaint.id} registered successfully!`
  };
}

module.exports = {
  calculateSeverityScore,
  normalizeCategory,
  assignGeographicWard,
  processIncomingReport,
  HIGH_RISK_CATEGORIES,
};
