require('dns').setDefaultResultOrder('ipv4first');

const { Client } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST || 'db.nndduotjbyunggamqnyh.supabase.co'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;
const RECALL_SCHEMA = process.env.RECALL_DB_SCHEMA || 'recall';
const TEST_PHONE = String(process.env.RECALL_TEST_DESTINATION_PHONE || '5512991286873').trim();

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN');

    const batch = await client.query(
      `INSERT INTO ${RECALL_SCHEMA}.recall_import_batches (
         lote_nome,
         source_file,
         as_of_date,
         total_rows,
         eligible_before_phone_validation,
         eligible_total,
         payload
       )
       VALUES ($1, $2, current_date, 1, 1, 1, $3::jsonb)
       RETURNING id, lote_nome`,
      [
        `Teste Recall ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
        'seed_recall_test_lead.js',
        JSON.stringify({
          tipo: 'seed_manual',
          telefone_teste: TEST_PHONE,
        }),
      ]
    );

    const batchId = batch.rows[0].id;

    const lead = await client.query(
      `INSERT INTO ${RECALL_SCHEMA}.recall_leads (
         paciente_nome,
         telefone,
         ultimo_atendimento,
         dentista_responsavel,
         coorte,
         coorte_prioridade,
         status,
         meta_error,
         origem_segmento,
         situacao_financeira,
         agendado_raw,
         first_imported_at,
         last_imported_at,
         import_count,
         last_import_batch_id,
         observacoes_importacao,
         telefones_raw
       )
       VALUES (
         $1, $2, current_date - interval '210 days', $3, $4, $5, 'pendente', null, $6, $7, $8, now(), now(), 1, $9, $10, $11
       )
       RETURNING id, paciente_nome, telefone, status`,
      [
        'Douglas Albernaz - TESTE RECALL',
        TEST_PHONE,
        'Nao informado',
        'recall_teste_controlado',
        1,
        'clinica_geral',
        'ADIMPLENTE',
        '',
        batchId,
        'Lead de teste inserido manualmente para validacao do motor Recall.',
        TEST_PHONE,
      ]
    );

    await client.query(
      `INSERT INTO ${RECALL_SCHEMA}.recall_events (lead_id, event_type, payload)
       VALUES ($1, 'seed_teste', $2::jsonb)`,
      [
        lead.rows[0].id,
        JSON.stringify({
          source: 'seed_recall_test_lead.js',
          lote_id: batchId,
          telefone: TEST_PHONE,
        }),
      ]
    );

    await client.query('COMMIT');

    console.log(JSON.stringify({
      ok: true,
      batch: batch.rows[0],
      lead: lead.rows[0],
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Falha ao inserir lead de teste do Recall:', error.message);
  process.exit(1);
});
