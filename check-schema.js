const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses'`);
  console.log(res.rows.map(r => r.column_name));
  await client.end();
}
check();
