CREATE TABLE IF NOT EXISTS topic_trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), display_name varchar(120) NOT NULL, description varchar(500),
  kind text NOT NULL CHECK (kind IN ('DEFAULT','USER')), owner_id uuid NOT NULL REFERENCES users(id),
  draft_revision integer NOT NULL DEFAULT 1, published_revision integer, published_at timestamptz,
  version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE TABLE IF NOT EXISTS topic_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tree_id uuid NOT NULL REFERENCES topic_trees(id), parent_id uuid REFERENCES topic_nodes(id),
  display_name varchar(120) NOT NULL, description varchar(500), node_type text NOT NULL CHECK (node_type IN ('GROUP','VOCABULARY')),
  position integer NOT NULL DEFAULT 0, version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_topic_nodes_parent ON topic_nodes(tree_id,parent_id,position) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS topic_node_closure (
  tree_id uuid NOT NULL REFERENCES topic_trees(id), ancestor_id uuid NOT NULL REFERENCES topic_nodes(id), descendant_id uuid NOT NULL REFERENCES topic_nodes(id), depth integer NOT NULL,
  PRIMARY KEY (ancestor_id, descendant_id)
);
CREATE INDEX IF NOT EXISTS ix_closure_descendant ON topic_node_closure(tree_id,descendant_id,depth);
CREATE INDEX IF NOT EXISTS ix_closure_ancestor ON topic_node_closure(tree_id,ancestor_id,depth);
