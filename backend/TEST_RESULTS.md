# Automated Test Results

Validated on July 10, 2026 with Node.js 22, PostgreSQL 17, Vitest 4.1.10, and Supertest 7.2.2.

```text
Test files: 2 passed
Tests:      15 passed
Unit:       3 passed
Integration: 12 passed
```

Coverage result:

```text
Statements: 70.88%
Branches:   50.56%
Functions:  76.41%
Lines:      70.76%
```

Configured minimum coverage thresholds:

```text
Statements: 65%
Branches:   45%
Functions:  70%
Lines:      65%
```

The complete integration suite ran against a real PostgreSQL 17 instance. It verified registration, bcrypt storage, login, JWT persistence and revocation, forgot/reset password behavior, hashed single-use reset tokens, role permissions, admin authorization, protected `super_admin`, and transaction rollback.
