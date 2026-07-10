# Users Authentication API

Base URL: `/api/users`

## 1. Register

`POST /api/users/register`

```json
{
  "email": "dat@example.com",
  "userName": "nguyentandat",
  "password": "StrongPass123",
  "pin": "1234"
}
```

Rules:

- `email`: valid email, maximum 100 characters.
- `userName`: 3-50 characters; lowercase letters, numbers, dots, and underscores.
- `password`: 8-72 characters with at least one lowercase letter, uppercase letter, and number.
- `pin`: 4-12 digits. The PIN is stored as a bcrypt hash, not plain text.

A new account is automatically assigned the `user` role.

## 2. Login

`POST /api/users/login`

```json
{
  "identifier": "dat@example.com",
  "password": "StrongPass123"
}
```

`identifier` accepts either email or username. A successful response contains a JWT access token.

## 3. Forgot password

`POST /api/users/forgot-password`

```json
{
  "email": "dat@example.com"
}
```

The API always returns the same generic message so attackers cannot discover registered emails.

In development, when `RETURN_PASSWORD_RESET_TOKEN=true`, the response also includes `development.resetToken` and `development.resetUrl` for testing. In production, set it to `false` and send the reset URL through your email provider.

Only the SHA-256 hash of the reset token is saved in PostgreSQL. A newly requested token invalidates older reset tokens for the same user.

## 4. Reset password

`POST /api/users/reset-password`

```json
{
  "token": "raw-token-received-from-the-reset-link",
  "newPassword": "NewStrongPass456"
}
```

The token is single-use and expires according to `PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES`. After a successful reset, all access tokens and reset tokens belonging to the user are deleted, forcing login again on every device.

## Environment variables

```env
BCRYPT_SALT_ROUNDS=12
PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES=15
PASSWORD_RESET_URL=http://localhost:5173/reset-password
RETURN_PASSWORD_RESET_TOKEN=true
```

Use `RETURN_PASSWORD_RESET_TOKEN=false` in production.

## Existing database migration

For a database that was created before this API was added, run:

```powershell
psql -U postgres -d english_learning -f "src/database/migrations/001_users_auth_indexes.sql"
```

This adds case-insensitive unique indexes for email and username, plus an index for password-reset token lookup. If the database already contains duplicate email addresses or usernames that differ only by letter case, clean those duplicates before running the migration.
