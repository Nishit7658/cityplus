# CityPulse — Urban Civic Issue Tracking and Municipal Control Room Platform

CityPulse is a civic infrastructure complaint tracking and municipal control room system designed for urban civic bodies such as the Vadodara Municipal Corporation (VMC). The platform provides automated intake through WhatsApp, PostGIS-powered spatial deduplication within an 18-meter threshold, real-time ticket escalation based on civic severity algorithms, and a Next.js control room dashboard for municipal engineers and field officers.

---

## Architecture Overview

CityPulse bridges citizen reporting with municipal field operations through a four-stage lifecycle:

1. **Citizen Reporting via WhatsApp Cloud API**: Citizens submit infrastructure issues (potholes, water pipeline bursts, broken streetlights, open manholes, garbage overflow) with photos and native GPS pins.
2. **Spatial Deduplication and Clustering**: PostGIS queries cluster reports submitted within an 18-meter radius into a single master ticket, incrementing confirmation counts rather than generating duplicate work orders.
3. **Automated Priority Routing and Dispatch**: Tickets are scored using severity weights, confirmation density, and turnaround latency, then assigned to the relevant ward field engineer.
4. **Closed-Loop Citizen Verification**: When a ticket is marked resolved, the system dispatches an automated verification prompt to the citizen's WhatsApp. If the citizen flags the issue as unresolved, the ticket reopens with high priority on the control room radar.

---

## Repository Structure

```
citypulse/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL database client and connection pool
│   │   ├── routes/          # Express REST endpoints (complaints, wards, officers, transparency, webhook)
│   │   ├── services/        # Spatial clustering, WhatsApp messaging, and Socket.IO broadcast services
│   │   └── server.js        # Main Express application entry point
│   ├── seed.js              # Database seed script for wards, officers, and historical complaints
│   ├── package.json         # Backend dependencies and run scripts
│   └── .env.example         # Backend environment variables template
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (Overview, Map, Queue, Hotspots, Officers, Transparency, Settings)
│   │   ├── components/      # UI components (MapView, PillTabNav, TopIdentityStrip, StatCard, TaskQueueTable, Drawer)
│   │   ├── data/            # Vadodara civic demo datasets and mock fallbacks
│   │   ├── styles/          # CSS design tokens and theme definitions
│   │   └── types/           # TypeScript interfaces for civic data models
│   ├── next.config.js       # Next.js configuration and module transpilation
│   ├── tailwind.config.js   # Tailwind CSS configuration mapping design tokens
│   ├── package.json         # Frontend dependencies and run scripts
│   └── .env.example         # Frontend environment variables template
├── database/
│   └── schema.sql           # PostgreSQL DDL with PostGIS spatial indexes and triggers
├── WHATSAPP_SETUP.md        # Meta WhatsApp Cloud API configuration guide
├── README.md                # System documentation, architecture, and setup instructions
└── .gitignore               # Repository ignore rules
```

---

## Core Capabilities

### 1. Spatial Deduplication and Persistent Problem Spots
* **18-Meter Spatial Clustering**: Utilizes `ST_DWithin` on geography coordinates to prevent ticket inflation when multiple citizens report the same failure.
* **Recurring Spot Analytics**: Tracks failure recurrence at identical physical locations across multiple months to identify structural defects requiring capital intervention.

### 2. Live Civic Control Room Dashboard
* **Hero Civic Radar Map**: CARTO Positron light tiles with custom high-contrast civic badge markers, downward anchor beacons, and critical severity sonar pulse animations.
* **Asymmetric Bento Overview**: Real-time signal summary, workload breakdown by category, active recurring alerts, and real-time activity stream.
* **Complaint Task Queue**: Tabular and grid views with sorting by severity score, confirmation density, and timestamp, featuring live arrival highlight animations.
* **Problem Hotspots**: Density heatmap paired with ranked problem spot cards showing composite risk scores and recurrence cycles.
* **Field Officers Management**: Workload radial gauges visualizing active tasks per officer and lifetime resolution metrics across municipal wards.
* **Public Transparency Portal**: Public-facing performance metrics displaying ward-by-ward turnaround times and resolution rates without authentication barriers.

### 3. Dynamic Priority Scoring Algorithm
Complaints are ranked dynamically using a composite formula:
```
Priority Score = (Confirmation Count * 2) + (Days Pending * 0.5) + Category Base Weight
```
Critical categories (such as gas leaks and open manholes) receive base priority floors of 80+ to ensure immediate field dispatch.

---

## Technology Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Leaflet.js, Socket.IO Client.
* **Backend**: Node.js, Express.js, Socket.IO, PostGIS / PostgreSQL (`pg`), Axios.
* **Database**: PostgreSQL 14+ with PostGIS spatial extensions.
* **Messaging**: Meta WhatsApp Cloud API (Webhooks and Interactive Messages).

---

## Installation and Local Setup

### Prerequisites
* Node.js (v18.0.0 or higher)
* PostgreSQL with PostGIS extension (or a free Supabase project)
* Git

---

### Step 1: Database Initialization

1. Create a database named `citypulse` in your PostgreSQL instance:
   ```sql
   CREATE DATABASE citypulse;
   ```
2. Connect to the database and run the schema file:
   ```bash
   psql -U postgres -d citypulse -f database/schema.sql
   ```

---

### Step 2: Backend Configuration

1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
3. Configure your database connection string and WhatsApp credentials in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citypulse
   WHATSAPP_TOKEN=your_meta_access_token
   PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   VERIFY_TOKEN=your_webhook_verify_token
   ```
4. Seed the database with sample VMC data:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### Step 3: Frontend Configuration

1. Navigate to the `frontend` directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your web browser.

---

## API Reference

### Complaints API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/complaints` | Retrieve all complaints with optional query filters (`status`, `category`, `ward_id`). |
| `GET` | `/api/complaints/:id` | Retrieve single complaint details and complete status transition logs. |
| `PATCH` | `/api/complaints/:id` | Update complaint status or assign a field officer. |
| `POST` | `/api/complaints/:id/resolve` | Mark complaint resolved and trigger outbound citizen WhatsApp verification. |

### Officers and Transparency API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/officers` | List field officers with active workload and resolved counts. |
| `GET` | `/api/wards` | List municipal wards and demographic metadata. |
| `GET` | `/api/transparency` | Retrieve public resolution rates, average turnaround hours, and ward stats. |
| `GET` | `/health` | Health check endpoint for container orchestrators. |

### WhatsApp Webhook API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/webhook` | Meta Webhook verification handshake. |
| `POST` | `/webhook` | Inbound WhatsApp event handler for incoming reports and verification replies. |

---

## Production Deployment

### Backend Deployment (Render / Railway)
1. Link your repository and set the root directory to `backend`.
2. Set the build command to `npm install` and the start command to `node src/server.js`.
3. Provide `DATABASE_URL`, `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, and `VERIFY_TOKEN` as environment variables.

### Frontend Deployment (Vercel / Cloudflare Pages)
1. Link your repository and set the root directory to `frontend`.
2. Build command: `npm run build`. Output directory: `.next`.
3. Set environment variables `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to your production backend URL.

---

## License

This project is licensed under the MIT License.
