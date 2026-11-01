# RESTful API Documentation & Contracts
## TitanPulse Gym Management System (Express REST API)

---

## 1. Global API Conventions

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Response Format Envelope:**
  ```json
  {
    "success": true,
    "message": "Human readable status message",
    "data": { ... },
    "meta": { "total": 100, "page": 1, "pages": 5 }
  }
  ```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile (`/api/auth`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account (admin/trainer/member). |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & return JWT. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and linked records. |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, phone, bio, or emergency contacts. |
| `PUT` | `/api/auth/updatepassword` | Authenticated | Change account password. |

#### Example: `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@gym.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "6740f9b3e1a8a2001e3b8a10",
        "name": "System Administrator",
        "email": "admin@gym.com",
        "role": "admin"
      }
    }
  }
  ```

---

### 2.2 Member Management (`/api/members`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Admin / Trainer | List members with search, status filters, pagination. |
| `POST` | `/api/members` | Admin | Enroll new member with automated expiry calculation. |
| `GET` | `/api/members/:id` | Authenticated | Get detailed profile with attendance & billing logs. |
| `PUT` | `/api/members/:id` | Admin | Update member details, plan, or assigned trainer. |
| `DELETE` | `/api/members/:id` | Admin | Toggle member active/inactive status. |
| `POST` | `/api/members/:id/assign-membership` | Admin | Assign or renew plan with calculated expiry date. |
| `GET` | `/api/members/:id/attendance` | Authenticated | Get attendance history for member. |
| `GET` | `/api/members/:id/payments` | Admin | Get billing transaction history for member. |

---

### 2.3 Trainer Management (`/api/trainers`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trainers` | Authenticated | List all certified trainers and specializations. |
| `POST` | `/api/trainers` | Admin | Onboard new trainer with coaching bio & availability. |
| `GET` | `/api/trainers/:id` | Authenticated | Get trainer profile and assigned athletes. |
| `PUT` | `/api/trainers/:id` | Admin / Trainer | Update specialization, bio, or shift schedule. |
| `DELETE` | `/api/trainers/:id` | Admin | Toggle trainer active status. |
| `GET` | `/api/trainers/:id/members` | Admin / Trainer | List members assigned to this trainer. |

---

### 2.4 Membership Plans (`/api/memberships`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/memberships` | Public | List all active subscription tiers. |
| `GET` | `/api/memberships/:id` | Public | Get specific plan details. |
| `POST` | `/api/memberships` | Admin | Create new membership tier with duration in months. |
| `PUT` | `/api/memberships/:id` | Admin | Update tier price, duration, or features. |
| `DELETE` | `/api/memberships/:id` | Admin | Toggle plan active/inactive status. |

---

### 2.5 Attendance & Turnstile (`/api/attendance`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | Authenticated | Log turnstile check-in with duplicate date guard. |
| `POST` | `/api/attendance/check-out` | Authenticated | Log session check-out timestamp. |
| `GET` | `/api/attendance` | Admin / Trainer | Query daily attendance list with date filters. |
| `GET` | `/api/attendance/my` | Member | Get self attendance history and 30d consistency. |
| `DELETE` | `/api/attendance/:id` | Admin | Delete erroneous attendance record. |

---

### 2.6 Payments & Invoicing (`/api/payments`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | Admin | Query payment ledger with method and date filters. |
| `POST` | `/api/payments` | Admin | Record transaction & auto-renew membership. |
| `GET` | `/api/payments/:id` | Authenticated | Get printable receipt / invoice details. |
| `GET` | `/api/payments/my` | Member | Get member's self billing transactions. |

---

### 2.7 Workouts & Movement Catalog (`/api/workouts`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workouts/exercises` | Authenticated | Query exercise catalog by muscle & category. |
| `POST` | `/api/workouts/exercises` | Admin / Trainer | Add new exercise to encyclopedia. |
| `GET` | `/api/workouts` | Authenticated | Query workout plans by member, trainer, or level. |
| `POST` | `/api/workouts` | Admin / Trainer | Prescribe customized workout routine to member. |
| `GET` | `/api/workouts/:id` | Authenticated | Get full routine with sets, reps, and rest periods. |
| `PUT` | `/api/workouts/:id` | Admin / Trainer | Update exercises or instructions in routine. |
| `DELETE` | `/api/workouts/:id` | Admin / Trainer | Delete workout routine. |
| `GET` | `/api/workouts/my` | Member | Get member's active prescribed routine. |

---

### 2.8 Biometrics & Progress (`/api/progress`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/progress` | Authenticated | Log biometric scan with auto-calculated BMI. |
| `GET` | `/api/progress/member/:id` | Authenticated | Get historical progression data for athlete. |
| `GET` | `/api/progress/my` | Member | Get member's self transformation records. |
| `DELETE` | `/api/progress/:id` | Admin / Trainer | Remove erroneous biometric entry. |

---

### 2.9 Strategic Reporting & Analytics (`/api/reports`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/analytics` | Admin | Aggregated monthly revenue, trends, and expiry alerts. |
| `GET` | `/api/reports/export` | Admin | Detailed printable reports with date filters. |

---

### 2.10 Executive Dashboards (`/api/dashboard`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | Admin | Executive KPIs, revenue chart, attendance trends. |
| `GET` | `/api/dashboard/trainer` | Trainer / Admin | Assigned athlete count, today trained, active plans. |
| `GET` | `/api/dashboard/member` | Member | Subscription countdown, attendance %, active routine. |

---

### 2.11 Notifications & Broadcasts (`/api/notifications`)

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Get notifications feed with unread count. |
| `POST` | `/api/notifications` | Admin | Dispatch system-wide broadcast announcement. |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark single notification as read. |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read. |
