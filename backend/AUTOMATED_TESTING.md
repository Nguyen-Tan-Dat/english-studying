# Automated API Testing

This backend uses:

- **Vitest** as the test runner.
- **Supertest** to call the Express application without starting a real HTTP port.
- A dedicated **PostgreSQL test database** for integration tests.
- **GitHub Actions** to run the complete test suite on every push and pull request.

## Test structure

```text
tests/
├── helpers/
│   ├── database.ts
│   └── users.ts
├── integration/
│   └── api.integration.test.ts
├── scripts/
│   └── reset-test-database.ts
├── setup/
│   └── environment.ts
└── unit/
    └── srs.service.test.ts
```

## Safety rule

The automatic database reset script executes:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

For that reason, it refuses to run unless the database name ends with:

```text
_test
```

Example accepted name:

```text
english_learning_test
```

Never point `TEST_DATABASE_URL` to the development or production database.

## First-time setup on Windows

From the backend folder:

```powershell
Copy-Item .env.test.example .env.test
```

Open `.env.test` and update the PostgreSQL password:

```env
TEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/english_learning_test
```

The PostgreSQL account needs permission to create a database. The default local `postgres` account normally has this permission.

You do not have to create `english_learning_test` manually. The test reset script creates it when it does not exist, rebuilds the schema, and then Vitest runs the suite.

## Run all tests

```powershell
npm test
```

This command performs:

```text
1. Validate that the database name ends with _test
2. Create english_learning_test when needed
3. Drop and rebuild the public schema
4. Run unit tests
5. Run API integration tests
6. Reset table data before every integration test
7. Seed user, super_admin, and all 56 CRUD permissions
```

## Available commands

### Unit tests only

Does not require PostgreSQL:

```powershell
npm run test:unit
```

### Integration tests only

Requires `.env.test` and PostgreSQL:

```powershell
npm run test:integration
```

### All tests in watch mode

```powershell
npm run test:watch
```

Vitest stays open and reruns affected tests when source or test files change.

### Test coverage

```powershell
npm run test:coverage
```

The HTML coverage report is generated at:

```text
coverage/index.html
```

### Type-check test source

```powershell
npm run test:typecheck
```

## Current automated scenarios

### SRS unit tests

- First correct answer schedules review for the next day.
- Incorrect answer resets the streak.
- Invalid grades are rejected.

### User authentication integration tests

- Register a valid account.
- Password and PIN are stored as bcrypt hashes.
- New accounts receive the `user` role.
- Duplicate email is rejected without case sensitivity.
- Invalid registration input is rejected.
- Login creates and persists an access token.
- Incorrect password is rejected.
- Forgot-password does not reveal whether an email exists.
- Reset tokens are stored only as SHA-256 hashes.
- Reset tokens are single-use.
- Password reset revokes previous sessions.
- Old passwords stop working and new passwords work.

### Admin RBAC integration tests

- Missing JWT returns `401`.
- A normal user without permissions receives `403`.
- A super administrator can list permissions and CRUD roles.
- Invalid permissions cause transaction rollback.

## GitHub Actions

Workflow file:

```text
.github/workflows/backend-tests.yml
```

GitHub Actions automatically:

1. Starts a PostgreSQL 17 service container.
2. Installs dependencies with `npm ci`.
3. Type-checks the application and tests.
4. Builds the backend.
5. Runs the complete automated suite.

The workflow runs on pushes to `main`, `master`, or `develop`, and on every pull request.

## Recommended development loop

```powershell
npm run test:watch
```

Before committing:

```powershell
npm run test:typecheck
npm test
npm run build
```
