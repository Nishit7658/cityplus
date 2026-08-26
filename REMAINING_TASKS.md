# 📋 VMC CityPulse — Complete Remaining Implementation Checklist

An exhaustive, itemized breakdown of every remaining feature, button, function, bug fix, security enhancement, and performance optimization required to achieve **10 / 10 production maturity**.

---

## 📑 Summary Matrix

| # | Task / Module | Component | Priority | Status |
|---|---|---|:---:|:---:|
| **1** | Fix `photoUrl` destructuring bug in GIS engine | `backend/src/services/gisService.js` | 🔴 P0 | **Pending** |
| **2** | Implement `POST /api/complaints` Web Intake REST API | `backend/src/routes/complaints.js` | 🔴 P0 | **Pending** |
| **3** | In-Memory fallback support for Web Intake | `backend/src/config/inMemoryStore.js` | 🟡 P1 | **Pending** |
| **4** | Build Interactive Public Citizen Grievance Modal | `frontend/src/components/CitizenReportModal.tsx` | 🔴 P0 | **Pending** |
| **5** | Add "📢 Report Issue" Button in Top Header | `frontend/src/components/TopIdentityStrip.tsx` | 🔴 P0 | **Pending** |
| **6** | Add 1-Click CSV Work Order Export in Queue | `frontend/src/components/TaskQueueTable.tsx` | 🟡 P1 | **Pending** |
| **7** | Add Real-time Keyword Search in Queue | `frontend/src/components/TaskQueueTable.tsx` | 🟡 P1 | **Pending** |
| **8** | Add Officer Assigned Orders Drilldown | `frontend/src/app/officers/page.tsx` | 🟡 P1 | **Pending** |
| **9** | Migrate Layout to `next/font/google` (Zero Warnings) | `frontend/src/app/layout.tsx` | 🟢 P2 | **Pending** |
| **10**| Fix React Hook Dependencies in Admin Drawer | `frontend/src/components/ComplaintDetailDrawer.tsx` | 🟢 P2 | **Pending** |
| **11**| Add Automated Test Suite for Web Intake | `backend/tests/web_complaint.test.js` | 🔴 P0 | **Pending** |
| **12**| Complete Zero-Warning Production Build & Deploy | Full Stack | 🔴 P0 | **Pending** |

---

## 🛠️ Detailed Breakdown by Component

### 1. Backend Core & API Layer (`backend/`)

#### A. Fix `photoUrl` Parameter in GIS Ingestion ([`gisService.js`](file:///d:/curlyfish/mecia%20%28vmc%20%29/backend/src/services/gisService.js))
* **Current Issue**: `processIncomingReport({ latitude, longitude, category, reporterPhone, description })` does not destructure `photoUrl`, causing photo URLs attached during WhatsApp, Telegram, or Web submissions to be dropped.
* **Implementation Required**: Add `photoUrl` to function parameters and ensure it is saved in the `INSERT INTO complaints` query.

#### B. Direct Citizen Submission Endpoint ([`complaints.js`](file:///d:/curlyfish/mecia%20%28vmc%20%29/backend/src/routes/complaints.js))
* **Current Issue**: `complaints.js` has `GET /`, `GET /:id`, `PATCH /:id`, `POST /:id/resolve`, but lacks `POST /api/complaints`.
* **Implementation Required**:
  * Implement `POST /api/complaints` protected by `validateCreateComplaint`.
  * Call `gisService.processIncomingReport(...)` with automatic 18m PostGIS clustering.
  * Emit `complaint:created` or `complaint:updated` via Socket.IO.
  * Return HTTP 201 with created complaint object.

#### C. In-Memory Store Support ([`inMemoryStore.js`](file:///d:/curlyfish/mecia%20%28vmc%20%29/backend/src/config/inMemoryStore.js))
* **Implementation Required**: Support raw complaint insertion with `photo_url` in the in-memory fallback database.

---

### 2. Frontend Citizen Portal & User Interface (`frontend/`)

#### A. Public Citizen Grievance Modal ([`CitizenReportModal.tsx`](file:///d:/curlyfish/mecia%20%28vmc%20%29/frontend/src/components/CitizenReportModal.tsx))
* **Implementation Required**:
  * Build a clean modal with backdrop blur.
  * Category Selector: Pothole, Water Leak, Broken Streetlight, Garbage Overflow, Open Manhole, Exposed Wiring, Gas Leak, Drainage, Traffic Signal.
  * Geographic Ward Picker (1 to 10 VMC Wards) + Address input.
  * Drag-and-drop / Click-to-upload photo evidence with live thumbnail preview.
  * Citizen Phone Number & Description inputs.
  * Form validation & submission state handling (`POST /api/complaints`).
  * Trilingual translations for English, ગુજરાતી, and हिन्दी.

#### B. Header Call-to-Action Button ([`TopIdentityStrip.tsx`](file:///d:/curlyfish/mecia%20%28vmc%20%29/frontend/src/components/TopIdentityStrip.tsx))
* **Implementation Required**:
  * Add a primary **"📢 Report Issue / ફરિયાદ નોંધાવો / शिकायत दर्ज करें"** button next to the language selector.
  * Clicking button opens the `CitizenReportModal`.

#### C. Task Queue Productivity & CSV Export ([`TaskQueueTable.tsx`](file:///d:/curlyfish/mecia%20%28vmc%20%29/frontend/src/components/TaskQueueTable.tsx))
* **Implementation Required**:
  * Add **"📥 Export CSV"** button that generates and downloads a sanitized work order CSV file (`id`, `category`, `description`, `ward`, `status`, `severity_score`, `confirmations`, `created_at`).
  * Add real-time text search filter box (searches across category, description, and ID).

#### D. Personnel Directory Assigned Orders Drilldown ([`officers/page.tsx`](file:///d:/curlyfish/mecia%20%28vmc%20%29/frontend/src/app/officers/page.tsx))
* **Implementation Required**:
  * Add **"📋 Assigned Orders"** button on officer cards.
  * Navigates to `/queue?officer_id=:id` to show work orders assigned specifically to that officer.

---

### 3. Code Cleanliness, Performance & Warning Elimination

#### A. Google Fonts Migration ([`layout.tsx`](file:///d:/curlyfish/mecia%20%28vmc%20%29/frontend/src/app/layout.tsx))
* **Current Issue**: `<link rel="stylesheet">` triggers `@next/next/no-page-custom-font` warning during build.
* **Implementation Required**: Migrate to `next/font/google` (`Plus_Jakarta_Sans` and `IBM_Plex_Mono`) for zero-layout-shift and 0 build warnings.

#### B. React Hook Dependency Cleanup ([`ComplaintDetailDrawer.tsx`](file:///d:/curlyfish/mecia%20%28vmc%20%29/frontend/src/components/ComplaintDetailDrawer.tsx))
* **Implementation Required**: Fix `useEffect` dependencies so Next.js build produces 0 ESLint warnings.

---

### 4. Automated Testing & Verification Suite

#### A. Automated Backend Test Suite ([`backend/tests/web_complaint.test.js`](file:///d:/curlyfish/mecia%20%28vmc%20%29/backend/tests/web_complaint.test.js))
* **Implementation Required**:
  * Test 1: `POST /api/complaints` creates a valid complaint with photo attachment and assigned ward.
  * Test 2: Validation rejection on invalid category or out-of-bounds coordinates.
  * Test 3: 18m spatial deduplication increments `confirmation_count` for same-location reports.

---

## 🎯 Definition of Done for 10 / 10 Score
1. ✅ **All 8 Backend Test Suites Pass (100% Green)**.
2. ✅ **Next.js Production Build compiles with 0 Errors and 0 Warnings**.
3. ✅ **Every single button and interactive element across all 7 pages has functional logic and feedback**.
4. ✅ **Public citizens can report issues via Web, WhatsApp, and Telegram with photo evidence**.
5. ✅ **Dispatchers can resolve, verify, assign officers, and export CSV work orders**.
