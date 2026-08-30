const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function seed() {
  console.log('🌱 Starting CityPulse VMC Database Seeding...');

  try {
    // 1. Seed 19 Official Wards of Vadodara Municipal Corporation
    const wardsData = [
      { id: 1, ward_number: 1, name: 'Ward 1 — Sayajigunj & Fatehgunj', lat: 22.3112, lng: 73.1878, population: 185000, area: 14.2 },
      { id: 2, ward_number: 2, name: 'Ward 2 — Harni & Warasia', lat: 22.3385, lng: 73.2140, population: 162000, area: 12.8 },
      { id: 3, ward_number: 3, name: 'Ward 3 — Waghodia Road & Bapod', lat: 22.2987, lng: 73.2341, population: 198000, area: 11.5 },
      { id: 4, ward_number: 4, name: 'Ward 4 — Karelibaug & Sangam', lat: 22.3214, lng: 73.1989, population: 174000, area: 15.0 },
      { id: 5, ward_number: 5, name: 'Ward 5 — Raopura & Mandvi', lat: 22.3025, lng: 73.2054, population: 155000, area: 13.6 },
      { id: 6, ward_number: 6, name: 'Ward 6 — Akota & Gotri', lat: 22.2981, lng: 73.1642, population: 210000, area: 18.2 },
      { id: 7, ward_number: 7, name: 'Ward 7 — Nizampura & Chhani', lat: 22.3340, lng: 73.1820, population: 188000, area: 16.4 },
      { id: 8, ward_number: 8, name: 'Ward 8 — Nagarwada', lat: 22.3120, lng: 73.2010, population: 145000, area: 9.8 },
      { id: 9, ward_number: 9, name: 'Ward 9 — Ajwa Road', lat: 22.3110, lng: 73.2315, population: 168000, area: 14.8 },
      { id: 10, ward_number: 10, name: 'Ward 10 — Subhanpura & Gorwa', lat: 22.3341, lng: 73.1624, population: 172000, area: 13.9 },
      { id: 11, ward_number: 11, name: 'Ward 11 — Vasna-Bhayli & Diwalipura', lat: 22.2885, lng: 73.1465, population: 195000, area: 17.5 },
      { id: 12, ward_number: 12, name: 'Ward 12 — Makarpura & Maneja', lat: 22.2512, lng: 73.1923, population: 220000, area: 22.0 },
      { id: 13, ward_number: 13, name: 'Ward 13 — Wadi & Ghadiali Pole', lat: 22.2965, lng: 73.2085, population: 140000, area: 8.5 },
      { id: 14, ward_number: 14, name: 'Ward 14 — Tarsali & Danteshwar', lat: 22.2615, lng: 73.2045, population: 180000, area: 16.0 },
      { id: 15, ward_number: 15, name: 'Ward 15 — Bapod & Ajwa Outer', lat: 22.3180, lng: 73.2450, population: 150000, area: 15.2 },
      { id: 16, ward_number: 16, name: 'Ward 16 — Kishanwadi & Soma Talav', lat: 22.2850, lng: 73.2210, population: 165000, area: 12.4 },
      { id: 17, ward_number: 17, name: 'Ward 17 — Manjalpur & Atladra', lat: 22.2684, lng: 73.1780, population: 205000, area: 19.5 },
      { id: 18, ward_number: 18, name: 'Ward 18 — Tandalja & Vasna Road', lat: 22.2840, lng: 73.1610, population: 175000, area: 14.0 },
      { id: 19, ward_number: 19, name: 'Ward 19 — Kapurai-Tarsali (South)', lat: 22.2450, lng: 73.2250, population: 160000, area: 18.0 },
    ];

    console.log('Inserting/Upserting 19 Wards...');
    for (const w of wardsData) {
      await db.query(
        `INSERT INTO wards (id, ward_number, name, centroid_lat, centroid_lng, population, area_sq_km)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET 
           ward_number = EXCLUDED.ward_number,
           name = EXCLUDED.name, 
           centroid_lat = EXCLUDED.centroid_lat, 
           centroid_lng = EXCLUDED.centroid_lng,
           population = EXCLUDED.population,
           area_sq_km = EXCLUDED.area_sq_km;`,
        [w.id, w.ward_number, w.name, w.lat, w.lng, w.population, w.area]
      );
    }

    // 2. Seed Staff Credentials (JWT Authentication)
    console.log('Inserting Administrative Staff Users...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('VmcGov2026!', salt);

    const usersData = [
      { id: 1, email: 'admin@vmc.gov.in', password_hash: adminPass, name: 'VMC Super Admin', role: 'admin', department: 'Executive Governance' },
      { id: 2, email: 'dispatcher@vmc.gov.in', password_hash: adminPass, name: 'Central Control Dispatcher', role: 'dispatcher', department: 'Zonal Triage & Dispatch' },
      { id: 3, email: 'officer.patel@vmc.gov.in', password_hash: adminPass, name: 'Rajesh Patel (EE)', role: 'officer', department: 'Road & Building Dept' },
    ];

    for (const u of usersData) {
      await db.query(
        `INSERT INTO users (id, email, password_hash, name, role, department)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET 
           email = EXCLUDED.email, 
           password_hash = EXCLUDED.password_hash, 
           name = EXCLUDED.name, 
           role = EXCLUDED.role, 
           department = EXCLUDED.department;`,
        [u.id, u.email, u.password_hash, u.name, u.role, u.department]
      );
    }

    // 3. Seed Officers with Department Rosters
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
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name, 
           department = EXCLUDED.department, 
           phone = EXCLUDED.phone, 
           ward_id = EXCLUDED.ward_id;`,
        [o.id, o.name, o.department, o.phone, o.ward_id]
      );
    }

    // 4. Seed Problem Spots
    console.log('Inserting Problem Spots...');
    const problemSpotsData = [
      { id: 1, category: 'pothole', lat: 22.3072, lng: 73.1812, ward_id: 1, total_cycles: 4, total_reports: 12 },
      { id: 2, category: 'open_manhole', lat: 22.3214, lng: 73.1989, ward_id: 4, total_cycles: 4, total_reports: 14 },
    ];

    for (const s of problemSpotsData) {
      await db.query(
        `INSERT INTO problem_spots (id, category, location, ward_id, total_cycles, total_reports)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET 
           total_cycles = EXCLUDED.total_cycles, 
           total_reports = EXCLUDED.total_reports;`,
        [s.id, s.category, s.lng, s.lat, s.ward_id, s.total_cycles, s.total_reports]
      );
    }

    // 5. Seed Baseline Complaints
    console.log('Inserting Baseline Complaints...');
    const complaintsData = [
      { id: 101, category: 'pothole', desc: 'Large deep pothole on RC Dutt Road near Alkapuri underpass', phone: '+919825011111', lat: 22.3072, lng: 73.1812, status: 'In Progress', conf: 14, score: 94, is_rec: true, off_id: 1, ward_id: 1 },
      { id: 102, category: 'water_leak', desc: 'Main water supply distribution pipe burst on Old Padra Road', phone: '+919825022222', lat: 22.2954, lng: 73.1611, status: 'Assigned', conf: 6, score: 72, is_rec: false, off_id: 5, ward_id: 2 },
      { id: 103, category: 'open_manhole', desc: 'Cover missing on main sewer junction near Karelibaug water tank', phone: '+919825033333', lat: 22.3214, lng: 73.1989, status: 'Pending', conf: 18, score: 98, is_rec: true, off_id: null, ward_id: 4 },
      { id: 104, category: 'garbage_overflow', desc: 'Commercial refuse overflow near Sayajigunj market gate', phone: '+919825044444', lat: 22.3112, lng: 73.1878, status: 'Resolved', conf: 3, score: 45, is_rec: false, off_id: 3, ward_id: 1 },
      { id: 105, category: 'broken_streetlight', desc: 'Series of 4 LED streetlights flickering on Gotri main road', phone: '+919825055555', lat: 22.3150, lng: 73.1480, status: 'Pending', conf: 2, score: 38, is_rec: false, off_id: null, ward_id: 7 },
    ];

    for (const c of complaintsData) {
      await db.query(
        `INSERT INTO complaints (id, category, description, reporter_phone, location, status, confirmation_count, severity_score, is_recurring, assigned_officer_id, ward_id)
         VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET 
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           confirmation_count = EXCLUDED.confirmation_count,
           severity_score = EXCLUDED.severity_score,
           is_recurring = EXCLUDED.is_recurring,
           assigned_officer_id = EXCLUDED.assigned_officer_id,
           ward_id = EXCLUDED.ward_id;`,
        [c.id, c.category, c.desc, c.phone, c.lng, c.lat, c.status, c.conf, c.score, c.is_rec, c.off_id, c.ward_id]
      );
    }

    console.log('✅ CityPulse VMC Database Seeding Completed Successfully!');
    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    if (require.main === module) process.exit(1);
    throw error;
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
