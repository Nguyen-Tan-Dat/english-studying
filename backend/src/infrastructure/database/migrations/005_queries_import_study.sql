CREATE TABLE IF NOT EXISTS saved_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), display_name varchar(120) NOT NULL,
  mode text NOT NULL, visibility text NOT NULL DEFAULT 'PRIVATE', expression text NOT NULL, normalized_expression text NOT NULL,
  ast jsonb NOT NULL, universe text NOT NULL, aliases jsonb NOT NULL, snapshot_concept_ids uuid[], result_count integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), topic_node_id uuid NOT NULL REFERENCES topic_nodes(id),
  status text NOT NULL, summary jsonb NOT NULL DEFAULT '{}', expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS import_rows (job_id uuid NOT NULL REFERENCES import_jobs(id), row_number integer NOT NULL, status text NOT NULL, raw jsonb NOT NULL, normalized jsonb, errors jsonb NOT NULL DEFAULT '[]', PRIMARY KEY(job_id,row_number));
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), mode text NOT NULL, source jsonb NOT NULL,
  status text NOT NULL, state jsonb NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
