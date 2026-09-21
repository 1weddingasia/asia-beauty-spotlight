const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

async function test() {
  const envContent = fs.readFileSync('.env.local', 'utf16le');
  
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}="?([^"\\r\\n]+)"?`));
    return match ? match[1] : null;
  };
  
  const client = new Client({
    connectionString: getEnv('DIRECT_URL'),
  });

  try {
    await client.connect();
    
    // Check tables
    let res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Tables:", res.rows.map(r => r.table_name));

    // Check foreign keys of businesses
    let res2 = await client.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='businesses';
    `);
    console.log("Businesses FKs:", res2.rows);

  } finally {
    await client.end();
  }
}
test();
