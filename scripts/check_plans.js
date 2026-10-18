require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT * FROM plans ORDER BY created_at ASC');
  console.log('Current plans in DB:');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
