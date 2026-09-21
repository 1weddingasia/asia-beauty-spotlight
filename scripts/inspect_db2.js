const fs = require('fs');
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
    
    // Check businesses columns
    let res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'businesses';
    `);
    console.log("Businesses columns:", res.rows);

    // Check directory_categories columns
    let res2 = await client.query(`SELECT * FROM directory_categories LIMIT 1;`);
    console.log("Directory_Categories row:", res2.rows);

    let res3 = await client.query(`SELECT * FROM categories LIMIT 1;`);
    console.log("Categories row:", res3.rows);

  } finally {
    await client.end();
  }
}
test();
