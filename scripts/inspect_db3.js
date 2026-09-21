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
    let res = await client.query(`SELECT count(*) FROM business_categories;`);
    console.log("Business_categories count:", res.rows[0].count);

    let res2 = await client.query(`SELECT count(*) FROM business_locations;`);
    console.log("Business_locations count:", res2.rows[0].count);

  } finally {
    await client.end();
  }
}
test();
