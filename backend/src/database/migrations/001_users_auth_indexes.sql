-- Run this once on an existing english_learning database.
-- It enforces case-insensitive uniqueness for public registration and improves
-- password-reset token lookups.

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower
    ON users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_user_name_lower
    ON users (LOWER(user_name));

CREATE INDEX IF NOT EXISTS idx_tokens_user_type_expiry
    ON tokens (user_id, token_type, expires_at);
