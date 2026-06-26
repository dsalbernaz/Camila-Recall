require('dns').setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const CLINICA_GERAL_RESPONSAVEIS = new Set([
  'Giuliano Ferreira Queiroz',
  'Gustavo Moraes Prado',
  'Tainá Ribeiro De Moraes',
  'Ana Clara Rezeck De Moura',
  'Gustavo Cesar Dias Bevilaqua',
  'Não informado',
]);

function onlyDigits(value) {
  return String(value || '').replace(/\D+/g, '');
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeBrazilMobile(raw, defaultDDD = '12') {
  let digits = onlyDigits(raw);

  if (!digits) return null;

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }

  if (digits.length === 11 && digits[2] === '9') {
    return '55' + digits;
  }

  if (digits.length === 10 && /[6-9]/.test(digits[2])) {
    return '55' + digits.slice(0, 2) + '9' + digits.slice(2);
  }

  if (digits.length === 9 && digits[0] === '9' && defaultDDD) {
    return '55' + defaultDDD + digits;
  }

  if (digits.length === 8 && /[6-9]/.test(digits[0]) && defaultDDD) {
    return '55' + defaultDDD + '9' + digits;
  }

  return null;
}

function extractPhonesFromCell(cellValue, defaultDDD = '12') {
  const raw = String(cellValue || '').trim();
  if (!raw) return [];

  const regex = /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/g;
  const matches = raw.match(regex) || [];
  const candidates = matches.length ? matches : [raw];
  const valid = [];

  for (const candidate of candidates) {
    const normalized = normalizeBrazilMobile(candidate, defaultDDD);
    if (normalized && !valid.includes(normalized)) {
      valid.push(normalized);
    }
  }

  return valid;
}

function parseBRDate(value) {
  if (!value) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value).trim());
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateISO(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getCoorte(cutoffDate, lastAttendDate) {
  const years = (cutoffDate - lastAttendDate) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 1) return '6-12m';
  if (years < 2) return '1-2a';
  if (years < 3) return '2-3a';
  return '3a+';
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

function ensureOutputDir(baseName) {
  const dir = path.join(process.cwd(), 'outputs', 'recall', baseName);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function buildSummary(asOfDate) {
  return {
    generated_at: new Date().toISOString(),
    as_of_date: formatDateISO(asOfDate),
    total_rows: 0,
    eligible_before_phone_validation: 0,
    eligible_total: 0,
    eligible_with_phone: 0,
    excluded_total: 0,
    breakdown: {
      clinica_geral: 0,
      ortodontia_adimplente: 0,
    },
    coortes: {
      '6-12m': 0,
      '1-2a': 0,
      '2-3a': 0,
      '3a+': 0,
    },
    excluded_reasons: {},
  };
}

function addExcluded(summary, reason) {
  summary.excluded_total += 1;
  summary.excluded_reasons[reason] = (summary.excluded_reasons[reason] || 0) + 1;
}

function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith('--'));
  const asOfArg = args.find((arg) => arg.startsWith('--as-of='));

  if (!file) {
    console.error('Uso: node scripts/recall_generate_mvp_import.js <arquivo.xlsx> [--as-of=YYYY-MM-DD]');
    process.exit(1);
  }

  if (!fs.existsSync(file)) {
    console.error(`Arquivo nao encontrado: ${file}`);
    process.exit(1);
  }

  const asOfDate = asOfArg
    ? new Date(`${asOfArg.slice('--as-of='.length)}T00:00:00`)
    : new Date();

  if (Number.isNaN(asOfDate.getTime())) {
    console.error('Data invalida em --as-of. Use o formato YYYY-MM-DD.');
    process.exit(1);
  }

  const cutoffDate = new Date(asOfDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - 6);

  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const outputDir = ensureOutputDir(path.basename(file, path.extname(file)));
  const summary = buildSummary(asOfDate);
  const eligible = [];
  const excluded = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((cell) => String(cell || '').trim() === '')) continue;

    summary.total_rows += 1;

    const paciente = String(row[1] || '').trim();
    const nascimento = String(row[2] || '').trim();
    const telefoneRaw = String(row[9] || '').trim();
    const responsavel = String(row[11] || '').trim();
    const situacaoFinanceira = String(row[12] || '').trim();
    const ultimoAtendimentoRaw = String(row[16] || '').trim();
    const agendado = String(row[17] || '').trim();

    const isClinicaGeral = CLINICA_GERAL_RESPONSAVEIS.has(responsavel);
    const isOrtoAdimplente = !isClinicaGeral && normalizeText(situacaoFinanceira).toUpperCase() === 'ADIMPLENTE';

    if (!isClinicaGeral && !isOrtoAdimplente) {
      excluded.push({
        row_number: i + 1,
        paciente_nome: paciente,
        dentista_responsavel: responsavel,
        situacao_financeira: situacaoFinanceira,
        ultimo_atendimento: ultimoAtendimentoRaw,
        agendado,
        telefone_raw: telefoneRaw,
        exclusion_reason: 'segmento_nao_elegivel',
      });
      addExcluded(summary, 'segmento_nao_elegivel');
      continue;
    }

    const ultimoAtendimento = parseBRDate(ultimoAtendimentoRaw);
    if (!ultimoAtendimento) {
      excluded.push({
        row_number: i + 1,
        paciente_nome: paciente,
        dentista_responsavel: responsavel,
        situacao_financeira: situacaoFinanceira,
        ultimo_atendimento: ultimoAtendimentoRaw,
        agendado,
        telefone_raw: telefoneRaw,
        exclusion_reason: 'ultimo_atendimento_invalido',
      });
      addExcluded(summary, 'ultimo_atendimento_invalido');
      continue;
    }

    if (ultimoAtendimento > cutoffDate) {
      excluded.push({
        row_number: i + 1,
        paciente_nome: paciente,
        dentista_responsavel: responsavel,
        situacao_financeira: situacaoFinanceira,
        ultimo_atendimento: ultimoAtendimentoRaw,
        agendado,
        telefone_raw: telefoneRaw,
        exclusion_reason: 'menos_de_6_meses',
      });
      addExcluded(summary, 'menos_de_6_meses');
      continue;
    }

    if (agendado) {
      excluded.push({
        row_number: i + 1,
        paciente_nome: paciente,
        dentista_responsavel: responsavel,
        situacao_financeira: situacaoFinanceira,
        ultimo_atendimento: ultimoAtendimentoRaw,
        agendado,
        telefone_raw: telefoneRaw,
        exclusion_reason: 'possui_agendamento',
      });
      addExcluded(summary, 'possui_agendamento');
      continue;
    }

    summary.eligible_before_phone_validation += 1;
    const phones = extractPhonesFromCell(telefoneRaw);
    if (!phones.length) {
      excluded.push({
        row_number: i + 1,
        paciente_nome: paciente,
        dentista_responsavel: responsavel,
        situacao_financeira: situacaoFinanceira,
        ultimo_atendimento: ultimoAtendimentoRaw,
        agendado,
        telefone_raw: telefoneRaw,
        exclusion_reason: 'telefone_invalido',
      });
      addExcluded(summary, 'telefone_invalido');
      continue;
    }

    const origemSegmento = isClinicaGeral ? 'clinica_geral' : 'ortodontia_adimplente';
    const coorte = getCoorte(cutoffDate, ultimoAtendimento);

    eligible.push({
      row_number: i + 1,
      paciente_nome: paciente,
      nascimento,
      telefone_principal: phones[0],
      telefone_secundario: phones[1] || '',
      telefones_raw: telefoneRaw,
      dentista_responsavel: responsavel,
      situacao_financeira: situacaoFinanceira,
      ultimo_atendimento: formatDateISO(ultimoAtendimento),
      agendado,
      origem_segmento: origemSegmento,
      coorte,
    });

    summary.eligible_total += 1;
    summary.eligible_with_phone += 1;
    summary.breakdown[origemSegmento] += 1;
    summary.coortes[coorte] += 1;
  }

  const eligibleFile = path.join(outputDir, 'recall_eligible.csv');
  const excludedFile = path.join(outputDir, 'recall_excluded.csv');
  const summaryFile = path.join(outputDir, 'recall_summary.json');

  writeCsv(eligibleFile, eligible, [
    'row_number',
    'paciente_nome',
    'nascimento',
    'telefone_principal',
    'telefone_secundario',
    'telefones_raw',
    'dentista_responsavel',
    'situacao_financeira',
    'ultimo_atendimento',
    'agendado',
    'origem_segmento',
    'coorte',
  ]);

  writeCsv(excludedFile, excluded, [
    'row_number',
    'paciente_nome',
    'dentista_responsavel',
    'situacao_financeira',
    'ultimo_atendimento',
    'agendado',
    'telefone_raw',
    'exclusion_reason',
  ]);

  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\nRecall MVP - Onda 1');
  console.log(`Arquivo analisado: ${file}`);
  console.log(`Data de corte (6 meses): ${formatDateISO(cutoffDate)}`);
  console.log(`Total de linhas avaliadas: ${summary.total_rows}`);
  console.log(`Elegiveis antes da validacao de telefone: ${summary.eligible_before_phone_validation}`);
  console.log(`Elegiveis: ${summary.eligible_total}`);
  console.log(`- Clinica geral: ${summary.breakdown.clinica_geral}`);
  console.log(`- Ortodontia adimplente: ${summary.breakdown.ortodontia_adimplente}`);
  console.log(`Coortes: ${JSON.stringify(summary.coortes)}`);
  console.log(`Excluidos: ${summary.excluded_total}`);
  console.log(`Saidas em: ${outputDir}`);
}

main();
