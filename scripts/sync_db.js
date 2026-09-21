const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const envContent = fs.readFileSync('.env.local', 'utf16le');
  const directUrlMatch = envContent.match(/DIRECT_URL="([^"]+)"/);
  const directUrl = directUrlMatch ? directUrlMatch[1] : null;

  if (!directUrl) {
    console.error("Could not find DIRECT_URL");
    return;
  }

  const client = new Client({
    connectionString: directUrl,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    const query = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS contact_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          contact_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          business_name TEXT,
          message TEXT,
          status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processed')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await client.query(query);
    console.log("Successfully created contact_requests table.");
  } catch (err) {
    console.error("Database sync error:", err);
  } finally {
    await client.end();
  }
}

main();
