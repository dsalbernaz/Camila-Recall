require('dns').setDefaultResultOrder('ipv4first');

const { Client } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST || 'db.nndduotjbyunggamqnyh.supabase.co'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;
const RECALL_SCHEMA = process.env.RECALL_DB_SCHEMA || 'recall';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const columns = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name LIKE 'recall_%'
      ORDER BY table_name, ordinal_position
    `, [RECALL_SCHEMA]);

    const indexes = await client.query(`
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = $1
        AND tablename LIKE 'recall_%'
      ORDER BY tablename, indexname
    `, [RECALL_SCHEMA]);

    console.log('COLUMNS');
    console.log(JSON.stringify(columns.rows, null, 2));
    console.log('INDEXES');
    console.log(JSON.stringify(indexes.rows, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Falha ao inspecionar esquema Recall:', error.message);
  process.exit(1);
});
