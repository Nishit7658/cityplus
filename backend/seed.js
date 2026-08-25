const db = require('./src/config/db');
const { calculateSeverityScore } = require('./src/services/gisService');

async function seed() {
  console.log('🌱 Starting CityPulse VMC Database Seeding...');

  try {
    // 1. Seed 10 Official Wards of Vadodara Municipal Corporation
    const wardsData = [
      { id: 1, name: 'Ward 1 — Sayajigunj', lat: 22.3112, lng: 73.1878 },
      { id: 2, name: 'Ward 2 — Akota', lat: 22.2981, lng: 73.1642 },
      { id: 3, name: 'Ward 3 — Raopura', lat: 22.3025, lng: 73.2054 },
      { id: 4, name: 'Ward 4 — Karelibaug', lat: 22.3214, lng: 73.1989 },
      { id: 5, name: 'Ward 5 — Fatehgunj', lat: 22.3168, lng: 73.1895 },
      { id: 6, name: 'Ward 6 — Manjalpur', lat: 22.2680, lng: 73.1950 },
      { id: 7, name: 'Ward 7 — Gotri', lat: 22.3150, lng: 73.1480 },
      { id: 8, name: 'Ward 8 — Makarpura', lat: 22.2450, lng: 73.1880 },
      { id: 9, name: 'Ward 9 — Gorwa', lat: 22.3380, lng: 73.1620 },
      { id: 10, name: 'Ward 10 — Nizampura', lat: 22.3340, lng: 73.1820 },
    ];

    console.log('Inserting/Upserting 10 Wards...');
    for (const w of wardsData) {
      await db.query(
        `INSERT INTO wards (id, name, location)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;`,
        [w.id, w.name, w.lng, w.lat]
      );
    }

    // 2. Seed Officers with Department Rosters
    console.log('Inserting Officers...');
    const officersData = [
      { id: 1, name: 'Rajesh Patel', department: 'Road & Building Dept', phone: '+919825012345', ward_id: 1 },
      { id: 2, name: 'Amit Shah', department: 'Drainage & Sewerage', phone: '+919825023456', ward_id: 4 },
      { id: 3, name: 'Sneha Dave', department: 'Solid Waste Management', phone: '+919825034567', ward_id: 5 },
      { id: 4, name: 'Vikram Solanki', department: 'Electrical & Lighting', phone: '+919825045678', ward_id: 3 },
      { id: 5, name: 'Mehul Mehta', department: 'Water Supply Department', phone: '+919825056789', ward_id: 2 },
      { id: 6, name: 'Pooja Joshi', department: 'Health & Sanitation', phone: '+919825067890', ward_id: 6 },
      { id: 7, name: 'Kiran Desai', department: 'Road & Building Dept', phone: '+919825078901', ward_id: 7 },
      { id: 8, name: 'Dharmesh Rana', department: 'Drainage & Sewerage', phone: '+919825089012', ward_id: 8 },
    ];

    for (const o of officersData) {
      await db.query(
        `INSERT INTO officers (id, name, department, phone, ward_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department, phone = EXCLUDED.phone, ward_id = EXCLUDED.ward_id;`,
        [o.id, o.name, o.department, o.phone, o.ward_id]
      );
    }

    // 3. Seed Problem Spots
    console.log('Inserting Problem Spots...');
    const problemSpotsData = [
      { id: 1, category: 'pothole', lat: 22.3072, lng: 73.1812, ward_id: 1, total_cycles: 4, total_reports: 12 },
      { id: 2, category: 'open_manhole', lat: 22.3214, lng: 73.1989, ward_id: 4, total_cycles: 4, total_reports: 14 },
    ];

    for (const s of problemSpotsData) {
      await db.query(
        `INSERT INTO problem_spots (id, category, location, ward_id, total_cycles, total_reports)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET total_cycles = EXCLUDED.total_cycles, total_reports = EXCLUDED.total_reports;`,
        [s.id, s.category, s.lng, s.lat, s.ward_id, s.total_cycles, s.total_reports]
      );
    }

    console.log('✅ CityPulse VMC Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
