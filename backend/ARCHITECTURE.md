# Backend 3-Layer Architecture

The backend is organized so that HTTP concerns, business rules, and database work do not accumulate in `app.ts`.

```text
src/
├── app.ts                         # Express configuration only
├── server.ts                      # Starts/stops the HTTP server and database pool
├── config/
│   └── env.ts                     # Environment variables
├── database/
│   ├── db.ts                      # PostgreSQL pool + Kysely instance
│   ├── types.ts                   # Typed database schema
│   └── schema/tables.sql
├── routes/                        # Endpoint definitions and routing only
│   ├── index.ts
│   ├── health.routes.ts
│   ├── auth.routes.ts
│   └── vocabulary.routes.ts
├── controllers/                   # Request input and HTTP response handling
│   ├── health.controller.ts
│   ├── auth.controller.ts
│   └── vocabulary.controller.ts
├── services/                      # Business rules and database operations
│   ├── health.service.ts
│   ├── auth.service.ts
│   ├── vocabulary.service.ts
│   └── srs.service.ts
├── middlewares/                   # Cross-cutting request processing
│   ├── async-handler.middleware.ts
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── not-found.middleware.ts
├── utils/
│   ├── api-error.ts
│   └── request-validation.ts
└── types/
    └── express.d.ts
```

## Request flow

```text
Client request
  -> Route
  -> Middleware
  -> Controller
  -> Service
  -> Kysely/PostgreSQL
  -> Controller response
```

## Current endpoints

| Method | Endpoint                       | Authentication | Purpose                                      |
| ------ | ------------------------------ | -------------: | -------------------------------------------- |
| GET    | `/health`                      |             No | Checks API and PostgreSQL connectivity       |
| POST   | `/api/auth/login`              |             No | Returns a JWT access token                   |
| GET    | `/api/vocabularies`            |     Bearer JWT | Lists the current user's vocabulary          |
| GET    | `/api/vocabularies/due`        |     Bearer JWT | Lists vocabulary due for review              |
| POST   | `/api/vocabularies`            |     Bearer JWT | Creates a vocabulary entry                   |
| POST   | `/api/vocabularies/:id/review` |     Bearer JWT | Grades a review and updates the SRS schedule |

## Login body

```json
{
  "identifier": "user@example.com",
  "password": "your-password"
}
```

Passwords stored in the `users.password` column must be bcrypt hashes. The login service never compares or stores plain-text passwords.

## Protected request example

```http
Authorization: Bearer <access-token>
```

## SRS responsibility

The pure scheduling algorithm is kept in `services/srs.service.ts`. The vocabulary service coordinates the transaction that updates `user_vocabularies` and inserts a row into `review_logs`. Controllers do not calculate intervals or scores.

## Adding another module

For a journal module, use the same shape:

```text
routes/journal.routes.ts
controllers/journal.controller.ts
services/journal.service.ts
```

Register its router in `routes/index.ts`. Do not add its business logic to `app.ts`.

## Admin RBAC module

Role management follows the same three-layer flow:

```text
src/routes/admin.routes.ts
  -> src/controllers/admin-role.controller.ts
  -> src/services/admin-role.service.ts
  -> Kysely / PostgreSQL
```

Authorization is handled separately by:

```text
src/middlewares/permission.middleware.ts
  -> src/services/authorization.service.ts
```

Permission names use `<table>.<action>`. See `RBAC_ADMIN_API.md` for setup and endpoint examples.

## Users authentication module

Public account endpoints are mounted at `/api/users`:

- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `POST /reset-password`

The route layer delegates to `UsersController`, while account rules, password hashing, JWT issuance, reset-token generation, and database transactions remain in `AuthService`. Reset tokens are random single-use values; PostgreSQL stores only their SHA-256 hashes.

## Automated tests

The project includes Vitest + Supertest automated testing with a dedicated PostgreSQL database. See `AUTOMATED_TESTING.md` for setup and commands.

```text
npm run test:unit
npm run test:integration
npm test
npm run test:coverage
```
