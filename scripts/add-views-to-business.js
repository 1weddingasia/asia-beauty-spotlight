const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function addViews() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS random_views INTEGER DEFAULT 0;
    `);
    
    // Seed existing businesses with random views between 5 and 50 if they have 0
    await client.query(`
      UPDATE businesses 
      SET random_views = floor(random() * 45 + 5)
      WHERE random_views = 0;
    `);

    console.log('Successfully added page_views and random_views to businesses table');

    // Update schema.sql as well
    const fs = require('fs');
    const schemaPath = 'schema.sql';
    let schema = fs.readFileSync(schemaPath, 'utf8');
    if (!schema.includes('page_views INTEGER')) {
      schema = schema.replace(
        /page_content JSONB DEFAULT '\{\}'::jsonb,/,
        "page_content JSONB DEFAULT '{}'::jsonb,\n    page_views INTEGER DEFAULT 0,\n    random_views INTEGER DEFAULT 0,"
      );
      fs.writeFileSync(schemaPath, schema);
      console.log('Updated schema.sql');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

addViews();
