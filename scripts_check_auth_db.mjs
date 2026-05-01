import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing');
    process.exit(2);
  }

  const connection = await mysql.createConnection(url);
  try {
    const [dbRows] = await connection.query('SELECT DATABASE() AS dbName');
    const [tableRows] = await connection.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'customer_accounts'
    `);
    const [sampleRows] = await connection.query('SELECT COUNT(*) AS count FROM customer_accounts');

    console.log(JSON.stringify({
      db: dbRows[0]?.dbName ?? null,
      customerAccountsTableExists: Number(tableRows[0]?.count ?? 0) > 0,
      customerAccountsCount: Number(sampleRows[0]?.count ?? 0),
    }, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
