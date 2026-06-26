-- Migration 20: fila auditavel de disparo do Recall

CREATE TABLE IF NOT EXISTS recall.recall_dispatch_queue_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid NOT NULL REFERENCES recall.recall_leads(id) ON DELETE CASCADE,
    queue_status text NOT NULL DEFAULT 'pendente',
    motivo text NOT NULL,
    snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    reserved_at timestamptz NULL,
    processed_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recall_dispatch_queue_status_created
    ON recall.recall_dispatch_queue_items (queue_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recall_dispatch_queue_lead
    ON recall.recall_dispatch_queue_items (lead_id, created_at DESC);
