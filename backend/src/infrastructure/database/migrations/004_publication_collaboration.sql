CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_tree_id uuid NOT NULL REFERENCES topic_trees(id), source_node_id uuid REFERENCES topic_nodes(id),
  scope text NOT NULL CHECK(scope IN ('TREE','BRANCH')), display_name varchar(140) NOT NULL, description varchar(500), slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'PUBLISHED', published_revision integer NOT NULL, clone_count integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), unpublished_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_publication ON publications(source_tree_id,coalesce(source_node_id,'00000000-0000-0000-0000-000000000000'::uuid),scope) WHERE status='PUBLISHED';
CREATE TABLE IF NOT EXISTS collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tree_id uuid NOT NULL REFERENCES topic_trees(id), user_id uuid REFERENCES users(id), email citext NOT NULL,
  role text NOT NULL CHECK(role IN ('EDITOR','VIEWER')), status text NOT NULL CHECK(status IN ('PENDING','ACCEPTED','REVOKED','EXPIRED')),
  invitation_token_hash text, version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), accepted_at timestamptz
);
