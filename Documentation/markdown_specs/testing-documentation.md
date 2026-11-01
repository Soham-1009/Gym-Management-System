# Testing Strategy & Quality Assurance Verification
## TitanPulse Gym Management System

---

## 1. Testing Strategy Overview

The testing strategy for TitanPulse combines automated integration tests with functional validation across all software layers:

```
                          ▲
                         / \
                        / UAT\          User Acceptance Testing
                       /------\         (Role workflows, responsive layout)
                      /  INT   \        Integration & API Testing
                     /----------\       (Supertest + In-Memory Mongo)
                    /    UNIT    \      Unit Logic Testing
                   /--------------\     (Date math, BMI formula, validators)
```

1. **Unit Testing:** Validates business logic services in isolation:
   - Expiry date arithmetic: $startDate + durationMonths$.
   - Normalized start-of-day attendance timestamp conversions.
   - Body Mass Index (BMI) computation formula and WHO category mapping.
2. **Integration Testing:** End-to-end API testing using Node's native test runner (`node:test`) and `supertest`:
   - Verifies JWT signing, verification, and expiration.
   - Enforces Role-Based Access Control (RBAC) preventing unauthorized access.
   - Enforces MongoDB compound unique index preventing duplicate check-ins on identical calendar days.
   - Verifies transactional integrity across payment recording and automatic membership renewal.
3. **Responsive UI & Cross-Browser Verification:** Validates layout fidelity across mobile, tablet, and widescreen desktop breakpoints.

---

## 2. Automated Test Suite Execution Results

Running the automated test suite in `server/` via `npm test`:

```bash
> gym-management-system-server@1.0.0 test
> node --test tests/api.test.js

GET /api/health 200 9.133 ms - 114
✔ 1. Health Check Endpoint (3311.9532ms)
POST /api/auth/register 201 306.568 ms - 413
POST /api/auth/login 200 95.844 ms - 407
✔ 2. Admin Registration and Login Flow (534.3214ms)
POST /api/auth/login 401 93.803 ms - 49
✔ 3. Rejection of Invalid Login Credentials (117.023ms)
POST /api/memberships 201 34.819 ms - 337
✔ 4. Membership Plan Creation (Admin Only) (60.2765ms)
POST /api/members 201 161.611 ms - 886
POST /api/auth/login 200 104.082 ms - 444
✔ 5. Member Creation with Automatic Expiry Calculation (316.2849ms)
GET /api/users 403 11.006 ms - 104
✔ 6. RBAC Enforcement - Member Cannot Access Admin Endpoint (28.2154ms)
POST /api/auth/register 400 8.024 ms - 73
✔ 7. Duplicate Email Registration Prevention (30.0351ms)
POST /api/attendance/check-in 201 53.112 ms - 901
POST /api/attendance/check-in 400 132.747 ms - 93
✔ 8. Attendance Check-in and Duplicate Prevention (219.3359ms)
POST /api/attendance/check-out 200 72.664 ms - 924
✔ 9. Attendance Check-out (93.423ms)
POST /api/payments 201 71.251 ms - 1248
✔ 10. Payment Processing and Invoice Generation (93.3423ms)
POST /api/progress 201 47.127 ms - 1006
✔ 11. Progress Recording & Automatic BMI Calculation (68.1779ms)
POST /api/workouts 201 68.293 ms - 1093
✔ 12. Workout Plan Creation and Retrieval (85.4978ms)
GET /api/dashboard/admin 200 112.375 ms - 2163
✔ 13. Admin Dashboard Analytics Aggregate Data (153.7819ms)

ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8844.064
```
**Result: 13 / 13 Integration Tests Passed (100% Success Rate).**

---

## 3. Formal Test Cases Linked to Requirements Traceability Matrix (RTM)

The following table documents all formal test cases in accordance with academic software engineering standards:

| Test ID | Req ID | Test Case Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | FR-01 | System Health Check | Server running | Send `GET /api/health` | Status 200, `{ status: 'online' }` | Status 200, online confirmed | **PASS** |
| **TC-02** | FR-01 | Admin Registration & JWT Login | New email | 1. Send `POST /api/auth/register`<br>2. Send `POST /api/auth/login` | Status 200, valid JWT returned with role `admin` | Status 200, token issued | **PASS** |
| **TC-03** | FR-01 | Invalid Credentials Rejection | Existing user | Send `POST /api/auth/login` with incorrect password | Status 401 Unauthorized, `{ success: false }` | Status 401, error message returned | **PASS** |
| **TC-04** | FR-05 | Membership Tier Creation | Admin token | Send `POST /api/memberships` with duration 6m and price 249 | Status 201 Created, plan saved | Status 201, Gold plan saved | **PASS** |
| **TC-05** | FR-03 | Member Onboarding & Auto Expiration | Admin token, Plan exists | Send `POST /api/members` linking Gold plan (6 months) | Status 201 Created, `expiryDate` calculated as $today + 6\text{ months}$ | Status 201, expiry accurately advanced 6 months | **PASS** |
| **TC-06** | FR-14 | RBAC Authorization Guard | Member token | Send `GET /api/users` with Member JWT | Status 403 Forbidden | Status 403, access denied | **PASS** |
| **TC-07** | FR-03 | Duplicate Email Prevention | Registered email | Send `POST /api/auth/register` with identical email | Status 400 Bad Request | Status 400, duplicate detected | **PASS** |
| **TC-08** | FR-06 | Attendance Check-In & Duplicate Prevention | Member active, Admin token | 1. Send `POST /api/attendance/check-in`<br>2. Resend check-in for identical member on same day | Step 1 returns 201;<br>Step 2 returns 400 with duplicate notice | Step 1: 201 Present;<br>Step 2: 400 duplicate rejected | **PASS** |
| **TC-09** | FR-06 | Attendance Check-Out | Active check-in logged | Send `POST /api/attendance/check-out` | Status 200 OK, `checkOutTime` timestamp updated | Status 200, check-out recorded | **PASS** |
| **TC-10** | FR-07 | Payment Settlement & Invoice Generation | Member exists, Admin token | Send `POST /api/payments` with amount 249 and method `card` | Status 201 Created, unique `invoiceNumber` (`INV-...`) generated | Status 201, invoice issued, renewal applied | **PASS** |
| **TC-11** | FR-09 | Biometrics & Automated BMI Calculation | Authenticated user | Send `POST /api/progress` with weight 80kg and height 180cm | Status 201 Created, BMI auto-computed as $\frac{80}{1.8^2} = 24.69$ | Status 201, BMI computed as 24.69 exactly | **PASS** |
| **TC-12** | FR-08 | Workout Plan Regimen Creation | Trainer token | Send `POST /api/workouts` with exercises array | Status 201 Created, plan linked to athlete | Status 201, routine assigned | **PASS** |
| **TC-13** | FR-13 | Executive Dashboard Aggregations | Admin token, Seeded data | Send `GET /api/dashboard/admin` | Status 200 OK, KPIs and Recharts trends returned | Status 200, metrics compiled | **PASS** |
| **TC-14** | FR-01 | One-Click Demo Role Switcher | Browser client | Click "Login as Admin", "Trainer", "Member" buttons | Instant redirect to corresponding role portal | Role-based navigation loaded in <1s | **PASS** |
| **TC-15** | NFR-09 | Responsive Mobile & Desktop Layout | Client bundle | Render app across 375px (mobile) and 1440px (desktop) | Sidebar collapses to slide-over menu; tables scroll horizontally | Fluid responsive grid confirmed | **PASS** |
| **TC-16** | NFR-01 | Production Vite Build Verification | Node runtime | Run `npm run build` in `client/` | Zero compilation or bundle errors | Exit code 0, bundle created in 8.17s | **PASS** |
