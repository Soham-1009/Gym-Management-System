# Contributing Guidelines

Thank you for contributing to the **TitanPulse Gym Management System**.

## Development Setup

1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd gym-management-system
   ```

2. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

4. **Seed Sample Data**:
   ```bash
   cd ../server
   npm run seed
   ```

5. **Run the Automated Test Suite**:
   ```bash
   npm test
   ```

6. **Start Dev Servers**:
   - Backend: `npm run dev` (running on `http://localhost:5000`)
   - Frontend: `npm run dev` in `client/` (running on `http://localhost:5173`)

## Branching & Commit Conventions

- Use standard feature branch naming:
  - `feat/feature-name`
  - `fix/bug-fix-name`
  - `docs/doc-updates`
- Write clear commit messages adhering to Conventional Commits:
  - `feat: add duplicate attendance prevention guard`
  - `test: add integration test for BMI calculation`
  - `docs: update requirements traceability matrix`

## Code Standards
- Use modular controllers, services, and middleware.
- Ensure all business logic changes are reflected in test cases and the RTM in `docs/P3-Use-Cases-User-Stories-RTM.md`.
- Validate builds with `npm run build` in the `client` directory prior to submitting PRs.
