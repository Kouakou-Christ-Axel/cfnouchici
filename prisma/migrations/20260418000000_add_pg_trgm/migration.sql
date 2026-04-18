-- Enable pg_trgm extension for fuzzy/trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for fast trigram search on mot and definition
CREATE INDEX IF NOT EXISTS mot_mot_trgm_idx ON mot USING GIN(mot gin_trgm_ops);
CREATE INDEX IF NOT EXISTS mot_definition_trgm_idx ON mot USING GIN(definition gin_trgm_ops);
