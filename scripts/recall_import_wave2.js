require('dns').setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST || 'db.nndduotjbyunggamqnyh.supabase.co'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;
const RECALL_SCHEMA = process.env.RECALL_DB_SCHEMA || 'recall';

function parseArgs(argv) {
  const args = {
    apply: false,
    file: null,
    summaryFile: null,
    batchName: null,
  };

  for (const arg of argv) {
    if (arg === '--apply') {
      args.apply = true;
    } else if (arg.startsWith('--summary=')) {
      args.summaryFile = arg.slice('--summary='.length);
    } else if (arg.startsWith('--batch=')) {
      args.batchName = arg.slice('--batch='.length);
    } else if (!arg.startsWith('--') && !args.file) {
      args.file = arg;
    }
  }

  return args;
}

function parseISODate(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseBRDate(value) {
  if (!value) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value).trim());
  if (!match) return null;
  const date = new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseExcelSerial(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const utcDays = Math.floor(n - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  if (Number.isNaN(dateInfo.getTime())) return null;
  return new Date(Date.UTC(dateInfo.getUTCFullYear(), dateInfo.getUTCMonth(), dateInfo.getUTCDate()));
}

function parseFlexibleDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return parseExcelSerial(value);

  const str = String(value).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return parseISODate(str);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return parseBRDate(str);
  if (/^\d+(\.\d+)?$/.test(str)) return parseExcelSerial(str);
  return null;
}

function sanitizeDate(value) {
  if (!value) return null;
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(current);
  return values;
}

function loadRows(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function loadSummary(summaryFile) {
  if (!summaryFile || !fs.existsSync(summaryFile)) return null;
  return JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
}

function getCoortePrioridade(coorte) {
  switch (coorte) {
    case '6-12m':
      return 1;
    case '1-2a':
      return 2;
    case '2-3a':
      return 3;
    default:
      return 4;
  }
}

async function runImport({ file, summaryFile, batchName, apply }) {
  if (!file) {
    console.error('Uso: node scripts/recall_import_wave2.js <recall_eligible.csv> [--summary=recall_summary.json] [--batch=nome] [--apply]');
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    console.error(`Arquivo nao encontrado: ${file}`);
    process.exit(1);
  }

  const rows = loadRows(file);
  const summary = loadSummary(summaryFile);
  const finalBatchName = batchName || `RECALL_${path.basename(file, path.extname(file)).toUpperCase()}_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}`;

  if (!apply) {
    console.log('Recall Wave 2 import - DRY RUN');
    console.log(`Arquivo: ${file}`);
    console.log(`Linhas elegiveis no CSV: ${rows.length}`);
    if (summary) {
      console.log(`Elegiveis antes da validacao de telefone: ${summary.eligible_before_phone_validation}`);
      console.log(`Elegiveis finais: ${summary.eligible_total}`);
      console.log(`Breakdown: ${JSON.stringify(summary.breakdown)}`);
      console.log(`Coortes: ${JSON.stringify(summary.coortes)}`);
    }
    console.log('Nada foi gravado no banco. Use --apply para persistir.');
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const batchRes = await client.query(
      `INSERT INTO ${RECALL_SCHEMA}.recall_import_batches
        (lote_nome, source_file, as_of_date, total_rows, eligible_before_phone_validation, eligible_total, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id`,
      [
        finalBatchName,
        file,
        summary?.as_of_date || null,
        summary?.total_rows || rows.length,
        summary?.eligible_before_phone_validation || rows.length,
        summary?.eligible_total || rows.length,
        JSON.stringify(summary || {}),
      ]
    );

    const batchId = batchRes.rows[0].id;
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      const pacienteNome = String(row.paciente_nome || '').trim();
      const telefonePrincipal = String(row.telefone_principal || '').trim();
      if (!pacienteNome || !telefonePrincipal) continue;

      const nascimento = sanitizeDate(parseFlexibleDate(row.nascimento));
      const ultimoAtendimento = sanitizeDate(parseFlexibleDate(row.ultimo_atendimento));

      if (!ultimoAtendimento) {
        continue;
      }
      const coortePrioridade = getCoortePrioridade(String(row.coorte || '').trim());

      const existingRes = await client.query(
        `SELECT id, telefone
         FROM ${RECALL_SCHEMA}.recall_leads
         WHERE telefone = $1 OR paciente_nome = $2
         ORDER BY CASE WHEN telefone = $1 THEN 0 ELSE 1 END, created_at ASC
         LIMIT 1`,
        [telefonePrincipal, pacienteNome]
      );

      if (existingRes.rows.length) {
        const leadId = existingRes.rows[0].id;

        await client.query(
          `UPDATE ${RECALL_SCHEMA}.recall_leads
           SET paciente_nome = $2,
               telefone = $3,
               nascimento = COALESCE($4, nascimento),
               ultimo_atendimento = $5,
               dentista_responsavel = $6,
               coorte = $7,
               coorte_prioridade = $8,
               telefone_secundario = NULLIF($9, ''),
               telefones_raw = NULLIF($10, ''),
               situacao_financeira = NULLIF($11, ''),
               agendado_raw = NULLIF($12, ''),
               origem_segmento = $13,
               import_count = COALESCE(import_count, 0) + 1,
               last_imported_at = now(),
               last_import_batch_id = $14,
               observacoes_importacao = $15,
               updated_at = now()
           WHERE id = $1`,
          [
            leadId,
            pacienteNome,
            telefonePrincipal,
            nascimento,
            ultimoAtendimento,
            row.dentista_responsavel,
            row.coorte,
            coortePrioridade,
            row.telefone_secundario,
            row.telefones_raw,
            row.situacao_financeira,
            row.agendado,
            row.origem_segmento,
            batchId,
            `Reimportado via Wave 2 - lote ${finalBatchName}`,
          ]
        );

        await client.query(
          `INSERT INTO ${RECALL_SCHEMA}.recall_events (lead_id, event_type, payload)
           VALUES ($1, 'reimportado', $2::jsonb)`,
          [leadId, JSON.stringify({ batch_id: batchId, row_number: row.row_number, telefone: telefonePrincipal })]
        );

        updated += 1;
      } else {
        const insertRes = await client.query(
          `INSERT INTO ${RECALL_SCHEMA}.recall_leads (
             paciente_nome, telefone, nascimento, ultimo_atendimento, dentista_responsavel,
             coorte, coorte_prioridade, status, meta_error, enviado_em, conexao_enviada,
             stack_apresentado, opt_out, respondeu, reagendou, handoff_resolved,
             telefone_secundario, telefones_raw, situacao_financeira, agendado_raw,
             origem_segmento, first_imported_at, last_imported_at, import_count,
             last_import_batch_id, observacoes_importacao
           ) VALUES (
             $1, $2, $3, $4, $5,
             $6, $7, 'pendente', NULL, NULL, false,
             false, false, false, false, false,
             NULLIF($8, ''), NULLIF($9, ''), NULLIF($10, ''), NULLIF($11, ''),
             $12, now(), now(), 1,
             $13, $14
           )
           RETURNING id`,
          [
            pacienteNome,
            telefonePrincipal,
            nascimento,
            ultimoAtendimento,
            row.dentista_responsavel,
            row.coorte,
            coortePrioridade,
            row.telefone_secundario,
            row.telefones_raw,
            row.situacao_financeira,
            row.agendado,
            row.origem_segmento,
            batchId,
            `Importado via Wave 2 - lote ${finalBatchName}`,
          ]
        );

        await client.query(
          `INSERT INTO ${RECALL_SCHEMA}.recall_events (lead_id, event_type, payload)
           VALUES ($1, 'importado', $2::jsonb)`,
          [insertRes.rows[0].id, JSON.stringify({ batch_id: batchId, row_number: row.row_number, telefone: telefonePrincipal })]
        );

        inserted += 1;
      }
    }

    console.log('Recall Wave 2 import - APPLY');
    console.log(`Batch: ${finalBatchName}`);
    console.log(`Inseridos: ${inserted}`);
    console.log(`Atualizados: ${updated}`);
    console.log(`Total processado: ${inserted + updated}`);
  } finally {
    await client.end();
  }
}

runImport(parseArgs(process.argv.slice(2))).catch((error) => {
  console.error('Falha na importacao Recall Wave 2:', error.message);
  process.exit(1);
});
