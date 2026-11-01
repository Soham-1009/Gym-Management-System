# TitanPulse — Enterprise Gym Management System (MERN Stack)
### Full-Stack Software Engineering & Academic SDLC Project

![TitanPulse Banner](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=300&fit=crop&q=80)

---

## 1. Project Overview

**TitanPulse** is a production-grade, enterprise-ready **Gym Management System (GMS)** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

This deliverable combines a complete, fully functional web application with academic **Software Development Life Cycle (SDLC)** and **Software Engineering (SE)** documentation. It is designed and structured for:
- University & Academic Software Engineering evaluation (SDLC, SRS, UML, RTM, Cohesion/Coupling).
- Live project demonstrations and viva presentations.
- Technical documentation reviews.
- Turnkey deployment and GitHub / ZIP submission.

---

## 2. Technology Stack

### Frontend Architecture
- **Core Framework:** React 18 (SPA)
- **Build Tooling:** Vite (Instant Hot Module Replacement & Rollup bundling)
- **Styling System:** Tailwind CSS (Curated dark palette `#090D16`, glassmorphism, responsive tokens)
- **Routing:** React Router v6 with Role-Based Access Control (RBAC) guards
- **Data Visualization:** Recharts (Area, Bar, Line, Pie visual engines)
- **Iconography:** Lucide React
- **HTTP Client:** Axios (Configured with request/response JWT interceptors)

### Backend Architecture
- **Runtime:** Node.js (Tested on Node.js v18+ and v25 LTS)
- **Web Framework:** Express.js (RESTful API architecture)
- **Authentication & Security:** JSON Web Tokens (JWT), bcrypt password hashing (10 salt rounds)
- **Architecture Pattern:** Decoupled 3-tier modular architecture (Controllers, Services, Models, Middleware, Validators)

### Database Layer
- **Engine:** MongoDB (Native Mongoose ODM schemas)
- **Zero-Config Fallback:** Integrated with `mongodb-memory-server` allowing instant execution out-of-the-box on any machine even if a local MongoDB service is not running.
- **Constraints & Indexes:** Compound unique index `{ member: 1, date: 1 }` to enforce zero duplicate turnstile attendance on identical calendar dates.

---

## 3. Key Features by User Role

### Administrator Portal
- **Executive Command Center:** Real-time KPI counters (Total Members, Active, Expired, Trainers, Today's Attendance, Monthly Revenue, Pending Invoices).
- **Interactive Analytics:** 14-day attendance frequency curve, monthly revenue breakdown, and plan distribution.
- **Member Directory:** Full enrollment, edit, search, filter, and detail modal with attendance/payment history.
- **Automated Expiry Calculation:** Automatically calculates subscription expiration dates based on plan duration in months ($startDate + durationMonths$).
- **Trainer Directory:** Staff records, coaching specializations, experience, and athlete rosters.
- **Turnstile Attendance:** Daily check-ins, check-outs, and database-enforced duplicate prevention.
- **Billing Ledger & Invoicing:** Support for Cash, UPI, Card, and Bank Wire; unique invoice generator (`INV-YYYY-XXXXX`) and printable receipt viewer.
- **Workout Routine Builder:** Custom periodized routine builder with movement encyclopedia.
- **Biometric Assessment:** Athlete weight, height, body circumference tracking, and automated BMI formula calculation.
- **Strategic Reports:** Date-filtered gross collections, acquisition velocity, and 7-day upcoming expiry alerts.
- **System Announcements:** Broadcast alert dispatching to all gym members.

### Trainer / Coach Portal
- **Coach Performance HQ:** Overview of total assigned athletes, today trained counter, and active workout regimens.
- **Athlete Roster:** Directory of athletes under coaching mentorship.
- **Workout Prescription:** Build and assign training regimens with sets, repetitions, duration, and rest intervals.
- **Biometric Evaluation:** Log athlete body measurements with automated WHO BMI classification.
- **Member Attendance Logs:** Review check-in compliance for assigned athletes.

### Member / Athlete Portal
- **Athlete Home:** Real-time active subscription card with exact countdown of days remaining.
- **Turnstile Self Check-In:** Log daily facility check-in and review 30-day consistency score percentage.
- **Prescribed Workout Routine:** View coach-prescribed movements with technical execution guidelines, sets, reps, and rest intervals.
- **Physical Transformation Curve:** Log self-measurements and view interactive weight and BMI trajectory line charts.
- **Subscription Billing:** Review payment history and open printable tax receipts.
- **Profile & Credentials:** Update emergency contacts, phone numbers, and change passwords.

---

## 4. Demo Evaluation Credentials

For seamless evaluation, demonstration, and viva presentations, the login screen includes **One-Click Demo Role Switcher Buttons** that log in immediately without manual typing:

| Role | Email Address | Password | Sample User Persona | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@gym.com` | `admin123` | System Administrator | Full executive control, billing, reports, members, turnstile |
| **Fitness Coach** | `trainer.john@gym.com` | `trainer123` | John Miller (Strength Coach) | Assigned athlete roster, routine builder, biometric evaluations |
| **Fitness Coach** | `trainer.sarah@gym.com` | `trainer123` | Sarah Connor (HIIT Specialist) | Assigned athlete roster, conditioning routines |
| **Gym Member** | `member.mike@gym.com` | `member123` | Mike Tyson (Yearly VIP Member) | Subscription countdown, workout regimen, BMI charts |
| **Gym Member** | `member.emma@gym.com` | `member123` | Emma Watson (Quarterly Pro) | Attendance logs, prescribed cardio routine, receipts |

---

## 5. Software Engineering & SDLC Documentation Directory

All Software Engineering project documentation is located in the `/docs` directory:

```
docs/
├── P1-SDLC-Model.md                  # SDLC Model selection, justification, sprint phases, maintenance
├── P2-SRS.md                         # Complete IEEE-830 specification (FR-01 to FR-14, NFRs, business rules)
├── P3-Use-Cases-User-Stories-RTM.md  # UML Use Case Diagram, User Stories, Acceptance Criteria, full RTM
├── P4-Module-Design-Cohesion-Coupling.md # Cohesion & Coupling analysis, 12 module specifications
├── P5-UI-UX-Design.md                # 15 wireframes, Figma design tokens, UI change history
├── architecture.md                   # 3-tier MERN system architecture and security model
├── database-design.md                # ER diagram, relationship cardinality, full data dictionary
├── api-documentation.md              # REST API catalog with request/response schemas
├── testing-documentation.md          # Test strategy, 13/13 passing automated test log, test cases
├── design-change-history.md          # Version-controlled design evolution log
└── diagrams/                         # Editable source representations (Mermaid & ASCII)
    ├── sdlc-process.mermaid
    ├── use-case-diagram.mermaid
    ├── system-architecture.mermaid
    ├── component-diagram.mermaid
    ├── er-diagram.mermaid
    └── module-hierarchy.mermaid
```

---

## 6. Installation & Execution Guide

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)
- Optional: Local MongoDB Server (If not running, the system automatically uses its embedded in-memory database fallback)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd gym-management-system
```

### Step 2: Install Server Dependencies & Seed Data
```bash
cd server
npm install
npm run seed
```
*The seeder populates sample admin, trainers, members, plans, attendance, workouts, payments, and biometrics.*

### Step 3: Run Server Integration Tests
```bash
npm test
```
*Executes all 13 automated integration tests verifying authentication, RBAC, duplicate turnstile prevention, and auto-calculations.*

### Step 4: Install Client Dependencies & Verify Build
```bash
cd ../client
npm install
npm run build
```

### Step 5: Start the Full-Stack Application
1. **Start Backend (Terminal 1):**
   ```bash
   cd server
   npm start
   ```
   *Server boots on `http://localhost:5000`.*

2. **Start Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```
   *Frontend opens on `http://localhost:5173`.*

3. **Open in Browser:** Navigate to `http://localhost:5173` and click any one-click demo login button!

---

## 7. Automated Test Verification Summary

The backend includes a comprehensive automated test suite in `server/tests/api.test.js`:

```
✔ 1. Health Check Endpoint (3311.9ms)
✔ 2. Admin Registration and Login Flow (534.3ms)
✔ 3. Rejection of Invalid Login Credentials (117.0ms)
✔ 4. Membership Plan Creation (Admin Only) (60.2ms)
✔ 5. Member Creation with Automatic Expiry Calculation (316.2ms)
✔ 6. RBAC Enforcement - Member Cannot Access Admin Endpoint (28.2ms)
✔ 7. Duplicate Email Registration Prevention (30.0ms)
✔ 8. Attendance Check-in and Duplicate Prevention (219.3ms)
✔ 9. Attendance Check-out (93.4ms)
✔ 10. Payment Processing and Invoice Generation (93.3ms)
✔ 11. Progress Recording & Automatic BMI Calculation (68.1ms)
✔ 12. Workout Plan Creation and Retrieval (85.4ms)
✔ 13. Admin Dashboard Analytics Aggregate Data (153.7ms)

Total: 13 Tests | 13 Passed | 0 Failed | Duration: 8.84s
```

---

## 8. Known Limitations & Future Enhancements

- **Payment Gateway:** Currently records payments internally across multiple channels with printable invoices. Integration with real-time Stripe Webhooks or Razorpay can be added as an adaptive enhancement.
- **Biometric Wearables:** Future sprints can integrate Apple HealthKit or Google Fit Web APIs for automated heart-rate and caloric burn synchronization.

---

## 9. Academic Project Certification

This project was developed in accordance with IEEE Software Engineering standards. All documented functional requirements correspond 1:1 with working source code implementations in this repository.
