require('dns').setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST || 'db.nndduotjbyunggamqnyh.supabase.co'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;

async function main() {
  const migrationPath = path.join(__dirname, '..', 'migrations', '17_create_recall_tables.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const client = new Client({ connectionString });

  await client.connect();
  try {
    await client.query(sql);
    console.log('Migration 17_create_recall_tables.sql aplicada com sucesso.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Falha ao aplicar migration da Recall:', error.message);
  process.exit(1);
});
