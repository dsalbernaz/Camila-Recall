-- Migration 21: pausa de 2h quando um humano assume a conversa manualmente

ALTER TABLE recall.recall_leads
    ADD COLUMN IF NOT EXISTS human_takeover_at timestamptz NULL,
    ADD COLUMN IF NOT EXISTS human_pause_until timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_recall_leads_human_pause_until
    ON recall.recall_leads (human_pause_until);
