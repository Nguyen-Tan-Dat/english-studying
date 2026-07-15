CREATE TABLE IF NOT EXISTS async_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), type text NOT NULL, status text NOT NULL,
  progress_percent integer NOT NULL DEFAULT 0, result jsonb, error jsonb, attempts integer NOT NULL DEFAULT 0, trace_id text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz, completed_at timestamptz
);
CREATE TABLE IF NOT EXISTS idempotency_records (
  id bigserial PRIMARY KEY, principal_id text NOT NULL, route text NOT NULL, key text NOT NULL, request_hash text NOT NULL,
  status text NOT NULL, response_status integer, response_body jsonb, location text, expires_at timestamptz NOT NULL,
  UNIQUE(principal_id,route,key)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY, actor_id uuid REFERENCES users(id), action text NOT NULL, resource_type text NOT NULL, resource_id uuid,
  before jsonb, after jsonb, audit_note varchar(300), request_id text, ip_context text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, event_type text NOT NULL,
  payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz, attempts integer NOT NULL DEFAULT 0
);
