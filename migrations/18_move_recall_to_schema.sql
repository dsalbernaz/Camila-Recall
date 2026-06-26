-- Migration 18: mover tabelas da Recall para schema dedicado

CREATE SCHEMA IF NOT EXISTS recall;

ALTER TABLE IF EXISTS public.recall_chat_messages SET SCHEMA recall;
ALTER TABLE IF EXISTS public.recall_events SET SCHEMA recall;
ALTER TABLE IF EXISTS public.recall_import_batches SET SCHEMA recall;
ALTER TABLE IF EXISTS public.recall_leads SET SCHEMA recall;
ALTER TABLE IF EXISTS public.recall_settings SET SCHEMA recall;
