# 100% Free PostgreSQL + PostGIS Setup Guide
### Vadodara Municipal Corporation (VMC) / CityPulse

You can run the production database **completely free of cost** using either **Option A (Self-Hosted Docker)** or **Option B (Free Cloud Managed Database)**.

---

## 🐳 Option A: 100% Free Self-Hosted Docker (Recommended)

Run the entire system (PostgreSQL 16 + PostGIS 3.4 + Backend API + Frontend) on your computer or any free Linux VPS using Docker Compose.

### Step 1: Start the Containers
In the root directory of the project, run:
```bash
docker compose up -d
```

This will automatically:
1. Download the official open-source `postgis/postgis:16-3.4-alpine` image.
2. Initialize the database and run `database/schema.sql`.
3. Start the Backend API on `http://localhost:5000`.
4. Start the Frontend Web Portal on `http://localhost:3000`.

### Step 2: Seed the Baseline Data
Once the database is running, seed the 10 VMC Wards, staff credentials, and baseline tickets:
```bash
cd backend
node seed.js
```

---

## ☁️ Option B: 100% Free Cloud Managed PostGIS (Supabase / Neon)

If you prefer a free cloud-hosted database accessible from anywhere without running Docker locally:

### Using Supabase (Free Tier — 500MB Storage, PostGIS Included)
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Create a new project named **`citypulse-vmc`**.
3. In the left sidebar, click **SQL Editor** -> **New Query**.
4. Copy the entire contents of [`database/schema.sql`](file:///d:/curlyfish/mecia%20%28vmc%20%29/database/schema.sql) and click **Run**.
5. In **Project Settings** -> **Database**, copy your **URI Connection String**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. In `backend/.env`, set:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
7. Run the seeder to populate the 10 wards and staff:
   ```bash
   cd backend
   node seed.js
   ```

---

## 🔑 Default Staff Credentials Seeded

| Role | Email | Password | Department |
|---|---|---|---|
| **Super Admin** | `admin@vmc.gov.in` | `VmcGov2026!` | Executive Governance |
| **Dispatcher** | `dispatcher@vmc.gov.in` | `VmcGov2026!` | Zonal Triage & Dispatch |
| **Executive Engineer** | `officer.patel@vmc.gov.in` | `VmcGov2026!` | Road & Building Dept |
