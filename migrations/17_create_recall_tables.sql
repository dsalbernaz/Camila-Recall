-- Migration 17: compatibilizacao do schema da Recall para o MVP em ondas

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS recall;

CREATE TABLE IF NOT EXISTS recall.recall_import_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_nome text NOT NULL,
    source_file text,
    as_of_date date,
    total_rows integer NOT NULL DEFAULT 0,
    eligible_before_phone_validation integer NOT NULL DEFAULT 0,
    eligible_total integer NOT NULL DEFAULT 0,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recall.recall_leads
    ADD COLUMN IF NOT EXISTS telefone_secundario text NULL,
    ADD COLUMN IF NOT EXISTS telefones_raw text NULL,
    ADD COLUMN IF NOT EXISTS situacao_financeira text NULL,
    ADD COLUMN IF NOT EXISTS agendado_raw text NULL,
    ADD COLUMN IF NOT EXISTS origem_segmento text NULL,
    ADD COLUMN IF NOT EXISTS first_imported_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS last_imported_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS import_count integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_import_batch_id uuid NULL REFERENCES recall.recall_import_batches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS observacoes_importacao text NULL;

CREATE INDEX IF NOT EXISTS idx_recall_leads_last_import_batch
    ON recall.recall_leads (last_import_batch_id);

CREATE INDEX IF NOT EXISTS idx_recall_import_batches_created_at
    ON recall.recall_import_batches (created_at DESC);
