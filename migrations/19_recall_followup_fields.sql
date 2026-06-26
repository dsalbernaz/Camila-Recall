-- Migration 19: campos minimos de acompanhamento operacional do Recall

ALTER TABLE recall.recall_leads
    ADD COLUMN IF NOT EXISTS ultima_tentativa_em timestamptz NULL,
    ADD COLUMN IF NOT EXISTS ultima_tentativa_resultado text NULL,
    ADD COLUMN IF NOT EXISTS tentativa_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS proxima_acao_tipo text NULL,
    ADD COLUMN IF NOT EXISTS proxima_acao_em timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_recall_leads_proxima_acao_em
    ON recall.recall_leads (proxima_acao_em);
