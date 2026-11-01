# Changelog

All notable changes to the **TitanPulse Gym Management System** are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-01

### Fixed & Enhanced
- **Role-Based Access Control (RBAC) & View Dynamic Adaptation**:
  - Resolved 403 Forbidden errors when Trainers navigated to `/trainer/members`: Hid "Enroll New Member", "Edit", and "Deactivate" action buttons for coaches while preserving profile view capabilities.
  - Added "Show Only My Athletes" quick filter toggle for Coaches in Member Directory.
  - Replaced financial billing tabs in member detail modal with athletic progress biometrics when accessed by coaches to preserve financial privacy.
- **Null Safety & Error Handling**:
  - Fixed potential `TypeError: Cannot read properties of null (reading '_id')` in `AttendancePage.jsx` when handling deleted or unpopulated member attendance records.
  - Updated `handleCheckOut` and backend `attendanceController.js` to support checkout by either `attendanceId` or `memberId`.
- **Ownership & IDOR Protection**:
  - Implemented IDOR protection across `getMemberById`, `getMemberAttendance`, and `getMemberProgressHistory` preventing members from inspecting other users' private profiles or fitness data.
  - Restricted coach routines and biometric records: Trainers can now only modify or delete plans and progress records they authored.
  - Protected coach profiles against unauthorized modification by peers and locked status toggle permissions to administrative roles.
- **Client Routing & Single-Page Application (SPA) Integrity**:
  - Replaced raw `<a href>` navigation links in `AdminDashboard.jsx` and `TrainerDashboard.jsx` with React Router's `<Link>` component to eliminate full page reloads and state resets.
  - Enhanced `ProfilePage.jsx` to persist renewed JWT tokens on password updates.
- **Receipt & Invoice Print Architecture**:
  - Implemented `@media print` CSS stylesheet in `index.css` to hide dark overlays, sidebars, and navigation controls, printing clean high-contrast receipts.
  - Populated member user information in `getMyPayments` for complete receipt generation in Member Portal.

## [1.0.0] - 2026-10-01

### Added
- **Full-Stack MERN Architecture**:
  - Express.js REST API server with modular config, controllers, middleware, models, routes, services, and validators.
  - React + Vite SPA with Tailwind CSS, Lucide React icons, and Recharts analytics.
- **Authentication & Role-Based Access Control (RBAC)**:
  - Secure bcrypt password hashing with salt rounds.
  - JWT token generation, verification, and protected route guards.
  - Role hierarchy supporting **Admin**, **Trainer**, and **Member** portals.
  - Quick-switch one-click login buttons for academic defense and evaluation.
- **Member Management**:
  - Full CRUD operations with search, status filters, and detail modals.
  - Automatic subscription expiration date calculation based on membership plan duration.
  - Trainer assignment and attendance/payment audit trails.
- **Trainer Management**:
  - Trainer directory, specialization mapping, experience records, and athlete rosters.
- **Attendance Engine**:
  - Turnstile check-in and check-out tracking.
  - Database-enforced compound index preventing duplicate attendance on the same calendar day.
  - 30-day consistency score calculation.
- **Billing & Invoicing**:
  - Support for Cash, UPI, Card, and Bank Transfer payment methods.
  - Automatic invoice number and transaction ID generation.
  - Dedicated printable invoice/receipt viewer.
- **Workout & Exercise Catalog**:
  - Movement database with target muscle groups and instructions.
  - Workout routine builder with sets, repetitions, duration, and rest interval prescription.
- **Biometrics & Progress Tracking**:
  - Bodyweight and circumference tracking (waist, chest, hips, arms, thighs).
  - Automated BMI calculation and categorization.
  - Interactive Recharts visual trend graphs.
- **Analytics & Reporting**:
  - Executive KPI dashboards with live revenue, active memberships, and check-in counts.
  - Date-filtered revenue and member acquisition charts.
  - 7-day membership expiry warning alerts.
- **Academic Software Engineering Documentation**:
  - `P1-SDLC-Model.md` (Agile-Scrum justification, sprint cycles, testing & maintenance).
  - `P2-SRS.md` (IEEE-830 specification covering FR-01 through FR-14, NFRs, constraints).
  - `P3-Use-Cases-User-Stories-RTM.md` (UML Use Case diagram, User Stories with acceptance criteria, full RTM).
  - `P4-Module-Design-Cohesion-Coupling.md` (Cohesion/coupling matrix, architecture & component diagrams).
  - `P5-UI-UX-Design.md` (Design system tokens, wireframes for 15 views, UI change history).
  - Architecture, database schema, API, testing, and diagram source files.
- **Automated Testing & Seed Data**:
  - 13 comprehensive integration tests validating auth, RBAC, CRUD, duplicate prevention, and BMI logic.
  - Comprehensive seed script with pre-populated admin, trainers, members, plans, and attendance logs.
