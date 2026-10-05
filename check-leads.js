require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const { rows } = await client.query(`
        SELECT customer_phone, customer_name, visit_count, created_at, deal_name
        FROM business_leads 
        ORDER BY created_at DESC
        LIMIT 10;
    `);
    
    console.log(JSON.stringify(rows, null, 2));
    await client.end();
}
run();
