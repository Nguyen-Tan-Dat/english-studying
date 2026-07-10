# PostgreSQL and API setup

## 1. Create the database

Example with PostgreSQL command line:

```powershell
createdb -U postgres english_learning
psql -U postgres -d english_learning -f src/database/schema/tables.sql
```

## 2. Configure `.env`

Copy the example file first:

```powershell
Copy-Item .env.example .env
```

Use a connection URL:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/english_learning
DB_SSL=false
```

Or remove/comment `DATABASE_URL` and use separate values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_learning
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

Configure JWT authentication:

```env
JWT_SECRET=replace-with-a-long-random-secret
JWT_ISSUER=english-learning-api
JWT_AUDIENCE=english-learning-client
JWT_EXPIRES_IN_SECONDS=604800
```

For hosted PostgreSQL services that require TLS, set `DB_SSL=true`.

## 3. Install and verify

```powershell
npm install
npm run build
npm run db:check
npm run dev
```

The server checks PostgreSQL before opening the HTTP port and closes the pool gracefully on `SIGINT` or `SIGTERM`.

## 4. Password storage

`POST /api/auth/login` expects `users.password` to contain a bcrypt hash, never a plain-text password.

Example for creating a hash from the terminal:

```powershell
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('YourPassword', 12).then(console.log)"
```

Insert the generated hash into the `users.password` column when creating a development user.

## 5. Architecture

See `ARCHITECTURE.md` for the route-controller-service request flow, middleware responsibilities, and current endpoints.

## Initialize roles and permissions

After the tables have been created, initialize the RBAC data:

```powershell
npm run db:seed:rbac
```

Grant the protected administrator role to an existing user:

```powershell
npm run db:grant-super-admin -- admin@example.com
```

The account must already exist in the `users` table. See `RBAC_ADMIN_API.md` for API details and request examples.
