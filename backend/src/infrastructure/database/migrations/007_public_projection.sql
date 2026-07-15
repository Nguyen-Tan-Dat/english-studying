CREATE TABLE IF NOT EXISTS public_node_index (
  publication_id uuid NOT NULL REFERENCES publications(id), source_node_id uuid NOT NULL, parent_source_node_id uuid,
  depth_relative integer NOT NULL, path text NOT NULL, position integer NOT NULL, display_data jsonb NOT NULL, counts jsonb NOT NULL,
  published_revision integer NOT NULL, PRIMARY KEY(publication_id,source_node_id)
);
