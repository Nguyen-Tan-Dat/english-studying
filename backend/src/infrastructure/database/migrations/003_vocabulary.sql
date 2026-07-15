CREATE TABLE IF NOT EXISTS concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), concept_key text UNIQUE NOT NULL, english varchar(100) NOT NULL,
  vietnamese varchar(250) NOT NULL, pronunciation varchar(120), part_of_speech text, example varchar(500), image_url text, audio_url text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vocabulary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), topic_node_id uuid NOT NULL REFERENCES topic_nodes(id), concept_id uuid NOT NULL REFERENCES concepts(id),
  version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE(topic_node_id, concept_id)
);
CREATE INDEX IF NOT EXISTS ix_concepts_search ON concepts USING gin (to_tsvector('simple', unaccent(english || ' ' || vietnamese)));
