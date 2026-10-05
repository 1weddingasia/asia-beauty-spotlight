require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const { rows } = await client.query(`
        SELECT customer_phone, count(*) as c 
        FROM business_leads 
        GROUP BY customer_phone 
        ORDER BY count(*) DESC;
    `);
    
    console.log(JSON.stringify(rows, null, 2));
    await client.end();
}
run();
