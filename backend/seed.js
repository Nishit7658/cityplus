const db = require('./src/config/db');
const { calculateSeverityScore } = require('./src/services/gisService');

async function seed() {
  console.log('🌱 Starting CityPulse VMC Database Seeding...');

  try {
    // 1. Seed Wards
    const wardsData = [
      { name: 'Ward 1 - Sayajigunj' },
      { name: 'Ward 2 - Akota' },
      { name: 'Ward 3 - Raopura' },
      { name: 'Ward 4 - Karelibaug' },
      { name: 'Ward 5 - Fatehgunj' },
    ];

    console.log('Inserting Wards...');
    const wardIds = [];
    for (const w of wardsData) {
      const res = await db.query(
        `INSERT INTO wards (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id;`,
        [w.name]
      );
      if (res.rows.length > 0) {
        wardIds.push(res.rows[0].id);
      }
    }

    // Fetch all ward ids if already exist
    const allWardsRes = await db.query(`SELECT id FROM wards ORDER BY id ASC;`);
    const wardList = allWardsRes.rows.map(r => r.id);

    // 2. Seed Officers
    console.log('Inserting Officers...');
    const officersData = [
      { name: 'Rajesh Parmar', department: 'Roads & Drainage', phone: '+919825011111', ward_id: wardList[0] },
      { name: 'Sunita Patel', department: 'Water Supply', phone: '+919825022222', ward_id: wardList[1] },
      { name: 'Vikram Shah', department: 'Electrical & Lighting', phone: '+919825033333', ward_id: wardList[2] },
      { name: 'Anish Varma', department: 'Solid Waste Management', phone: '+919825044444', ward_id: wardList[3] },
      { name: 'Mahendra Solanki', department: 'Gas & Emergency Services', phone: '+919825055555', ward_id: wardList[4] },
    ];

    const officerIds = [];
    for (const o of officersData) {
      const res = await db.query(
        `INSERT INTO officers (name, department, phone, ward_id) VALUES ($1, $2, $3, $4) RETURNING id;`,
        [o.name, o.department, o.phone, o.ward_id]
      );
      officerIds.push(res.rows[0].id);
    }

    // 3. Seed Problem Spots (Historical recurring locations in Vadodara)
    console.log('Inserting Problem Spots...');
    const problemSpotsData = [
      {
        category: 'pothole',
        lat: 22.3072,
        lng: 73.1812,
        ward_id: wardList[0], // Near Station Road
        total_cycles: 4,
        total_reports: 12,
        first_reported_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
      },
      {
        category: 'open_manhole',
        lat: 22.3120,
        lng: 73.1750,
        ward_id: wardList[1], // Akota Circle
        total_cycles: 2,
        total_reports: 6,
        first_reported_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      },
      {
        category: 'water_leak',
        lat: 22.3005,
        lng: 73.1920,
        ward_id: wardList[2], // Mandvi / Raopura
        total_cycles: 1,
        total_reports: 2,
        first_reported_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    const spotIds = [];
    for (const s of problemSpotsData) {
      const res = await db.query(
        `INSERT INTO problem_spots (category, location, ward_id, total_cycles, total_reports, first_reported_at)
         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5, $6, $7)
         RETURNING id;`,
        [s.category, s.lng, s.lat, s.ward_id, s.total_cycles, s.total_reports, s.first_reported_at]
      );
      spotIds.push(res.rows[0].id);
    }

    // 4. Seed Complaints
    console.log('Inserting Complaints...');
    const complaintsData = [
      {
        category: 'open_manhole',
        description: 'Dangerous uncovered manhole near Alkapuri petrol pump junction.',
        reporter_phone: '+919898012345',
        lat: 22.3120,
        lng: 73.1750,
        status: 'Pending',
        confirmation_count: 9, // Red tier (8+)
        is_recurring: true,
        problem_spot_id: spotIds[1],
        assigned_officer_id: officerIds[0],
        ward_id: wardList[1],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        category: 'exposed_wiring',
        description: 'Sparking street light wires hanging low near Sayajigunj bridge.',
        reporter_phone: '+919898023456',
        lat: 22.3090,
        lng: 73.1830,
        status: 'Assigned',
        confirmation_count: 5, // Orange tier (4-7)
        is_recurring: false,
        problem_spot_id: null,
        assigned_officer_id: officerIds[2],
        ward_id: wardList[0],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        category: 'pothole',
        description: 'Deep road cave-in on RC Dutt Road right outside Station main gate.',
        reporter_phone: '+919898034567',
        lat: 22.3072,
        lng: 73.1812,
        status: 'Pending',
        confirmation_count: 11, // Red tier (8+)
        is_recurring: true,
        problem_spot_id: spotIds[0],
        assigned_officer_id: officerIds[0],
        ward_id: wardList[0],
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        category: 'garbage_overflow',
        description: 'Huge trash dump spilling onto road near Karelibaug water tank.',
        reporter_phone: '+919898045678',
        lat: 22.3250,
        lng: 73.1950,
        status: 'Pending',
        confirmation_count: 2, // Yellow tier (1-3)
        is_recurring: false,
        problem_spot_id: null,
        assigned_officer_id: officerIds[3],
        ward_id: wardList[3],
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        category: 'water_leak',
        description: 'Main pipeline burst causing water logging near Mandvi gate.',
        reporter_phone: '+919898056789',
        lat: 22.3005,
        lng: 73.1920,
        status: 'Resolved',
        confirmation_count: 6, // Green resolved override
        is_recurring: true,
        problem_spot_id: spotIds[2],
        assigned_officer_id: officerIds[1],
        ward_id: wardList[2],
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        resolved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        category: 'gas_leak',
        description: 'Piped gas smell detected near Fatehgunj circle restaurant line.',
        reporter_phone: '+919898067890',
        lat: 22.3200,
        lng: 73.1870,
        status: 'Assigned',
        confirmation_count: 8, // High risk + 8 confirmations = top priority
        is_recurring: false,
        problem_spot_id: null,
        assigned_officer_id: officerIds[4],
        ward_id: wardList[4],
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];

    for (const c of complaintsData) {
      const severityScore = calculateSeverityScore(c.confirmation_count, c.created_at, c.category);

      await db.query(
        `INSERT INTO complaints (
          category, description, reporter_phone, location, status, confirmation_count,
          severity_score, is_recurring, problem_spot_id, assigned_officer_id, ward_id,
          created_at, resolved_at
        )
        VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
        [
          c.category,
          c.description,
          c.reporter_phone,
          c.lng,
          c.lat,
          c.status,
          c.confirmation_count,
          severityScore,
          c.is_recurring,
          c.problem_spot_id,
          c.assigned_officer_id,
          c.ward_id,
          c.created_at,
          c.resolved_at || null,
        ]
      );
    }

    console.log('✅ CityPulse VMC Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seed();
