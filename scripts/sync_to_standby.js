const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function syncToStandby() {
  console.log('--- ĐỒNG BỘ DỮ LIỆU SANG SUPABASE DỰ PHÒNG (STANDBY) ---');

  const primaryEnv = parseEnv(path.join(__dirname, '../.env.local'));
  const standbyEnv = parseEnv(path.join(__dirname, '../.env.backup'));

  const primaryDb = process.env.DATABASE_URL || primaryEnv.DATABASE_URL;
  const standbyDb = process.env.STANDBY_DATABASE_URL || standbyEnv.STANDBY_DATABASE_URL;

  if (!primaryDb || !standbyDb) {
    console.error('❌ Thiếu cấu hình DATABASE_URL (.env.local) hoặc STANDBY_DATABASE_URL (.env.backup)');
    process.exit(1);
  }

  const primaryClient = new Client({ connectionString: primaryDb, ssl: { rejectUnauthorized: false } });
  const standbyClient = new Client({ connectionString: standbyDb, ssl: { rejectUnauthorized: false } });

  await primaryClient.connect();
  await standbyClient.connect();
  console.log('✅ Đã kết nối thành công 2 Database.');

  const tables = [
    'categories',
    'locations',
    'directory_categories',
    'directory_locations',
    'plans',
    'memberships',
    'businesses',
    'business_members',
    'business_categories',
    'business_locations',
    'business_customers',
    'business_leads',
    'business_services',
    'business_hours',
    'business_media',
    'business_events',
    'business_claims',
    'business_revisions',
    'contact_requests',
    'blog_categories',
    'blogs',
    'post_categories',
    'posts',
    'profiles',
    'payments',
    'transactions',
    'site_settings',
    'ai_jobs',
    'ai_sources',
    '_schema_migrations'
  ];

  for (const tableName of tables) {
    try {
      const countRes = await primaryClient.query(`SELECT COUNT(*) FROM public."${tableName}";`);
      const totalRows = parseInt(countRes.rows[0].count, 10);
      if (totalRows === 0) continue;

      const dataRes = await primaryClient.query(`SELECT * FROM public."${tableName}";`);
      const rows = dataRes.rows;
      const columns = Object.keys(rows[0]);
      const colList = columns.map(c => `"${c}"`).join(', ');

      await standbyClient.query(`ALTER TABLE public."${tableName}" DISABLE TRIGGER ALL;`);
      await standbyClient.query(`TRUNCATE TABLE public."${tableName}" CASCADE;`);

      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        for (const row of batch) {
          const values = columns.map(c => row[c]);
          const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
          await standbyClient.query(
            `INSERT INTO public."${tableName}" (${colList}) VALUES (${placeholders});`,
            values
          );
        }
      }

      await standbyClient.query(`ALTER TABLE public."${tableName}" ENABLE TRIGGER ALL;`);
      console.log(` ✅ Đồng bộ: ${tableName} (${totalRows} dòng)`);
    } catch (err) {
      console.log(` ⚠️ Bảng ${tableName}: ${err.message}`);
    }
  }

  await primaryClient.end();
  await standbyClient.end();
  console.log('🎉 Đồng bộ định kỳ hoàn tất thành công!');
}

syncToStandby().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
