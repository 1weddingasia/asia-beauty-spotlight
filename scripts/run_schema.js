const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  const sql = fs.readFileSync('C:/Users/Dell/.gemini/antigravity/brain/d15fe3a5-5fb6-47b2-a8a6-a33b6536a9eb/scratch/schema_final.sql', 'utf8');
  await client.query(sql);
  await client.end();
  console.log('Schema executed successfully!');
}
run().catch(console.error);
