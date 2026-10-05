require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const { rows } = await client.query(`
        SELECT tablename, policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'business_leads';
    `);
    
    console.log(JSON.stringify(rows, null, 2));
    await client.end();
}
run();
