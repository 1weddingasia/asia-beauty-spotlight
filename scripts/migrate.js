require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    // Determine the DB connection string
    // Try process.env.DATABASE_URL first, fallback to the hardcoded one if not found
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ejlltaigohemjagfzxxh:MYW_.Guf3YkQ4qi@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
    
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('🔗 Connected to Database');

        // 1. Ensure migrations tracking table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS _schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 2. Read all migration files
        const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.log('📁 No migrations folder found at', migrationsDir);
            return;
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // sort alphabetically/chronologically

        if (files.length === 0) {
            console.log('✨ No migration files found.');
            return;
        }

        // 3. Get already applied migrations
        const { rows } = await client.query('SELECT version FROM _schema_migrations');
        const applied = new Set(rows.map(r => r.version));

        // 4. Run pending migrations
        let ranAny = false;
        for (const file of files) {
            if (!applied.has(file)) {
                console.log(`\n⏳ Running migration: ${file}...`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                
                try {
                    await client.query('BEGIN'); // Start transaction
                    await client.query(sql);
                    await client.query('INSERT INTO _schema_migrations (version) VALUES ($1)', [file]);
                    await client.query('COMMIT'); // Commit transaction
                    console.log(`✅ Successfully applied: ${file}`);
                    ranAny = true;
                } catch (err) {
                    await client.query('ROLLBACK'); // Rollback on error
                    console.error(`❌ Failed to apply migration: ${file}`);
                    console.error(err);
                    throw err; // Stop executing further migrations
                }
            }
        }

        if (!ranAny) {
            console.log('\n🌟 Database is already up to date! No new migrations to run.');
        } else {
            console.log('\n🎉 All pending migrations applied successfully!');
        }

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await client.end();
        console.log('🔌 Connection closed.');
    }
}

runMigrations();
