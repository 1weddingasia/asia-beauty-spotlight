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

function sanitizeDbUrl(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  if (str.includes('=')) {
    const eqIdx = str.indexOf('=');
    const prefix = str.substring(0, eqIdx).trim();
    if (/^[A-Z0-9_]+$/i.test(prefix)) {
      str = str.substring(eqIdx + 1).trim();
    }
  }
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

async function syncToStandby() {
  console.log('--- ĐỒNG BỘ DỮ LIỆU SANG SUPABASE DỰ PHÒNG (STANDBY) ---');

  const primaryEnv = parseEnv(path.join(__dirname, '../.env.local'));
  const standbyEnv = parseEnv(path.join(__dirname, '../.env.backup'));

  const primaryDb = sanitizeDbUrl(process.env.PRIMARY_DATABASE_URL || process.env.DATABASE_URL || primaryEnv.DATABASE_URL);
  const standbyDb = sanitizeDbUrl(process.env.STANDBY_DATABASE_URL || standbyEnv.STANDBY_DATABASE_URL);

  if (!primaryDb || !standbyDb) {
    console.error('❌ Thiếu cấu hình DATABASE_URL (.env.local) hoặc STANDBY_DATABASE_URL (.env.backup)');
    process.exit(1);
  }

  // Safety check: Ensure primary and standby are two DIFFERENT databases!
  if (primaryDb.trim() === standbyDb.trim()) {
    console.error('🚨 CẢNH BÁO NGUY HIỂM: DATABASE_URL và STANDBY_DATABASE_URL trùng nhau! Huỷ đồng bộ ngay lập tức để bảo vệ dữ liệu.');
    process.exit(1);
  }

  const primaryClient = new Client({ connectionString: primaryDb, ssl: { rejectUnauthorized: false } });
  const standbyClient = new Client({ connectionString: standbyDb, ssl: { rejectUnauthorized: false } });

  try {
    await primaryClient.connect();
    await standbyClient.connect();
    console.log('✅ Đã kết nối thành công 2 Database độc lập.');

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

    // Set session_replication_role to replica to allow truncates and bulk inserts without trigger/FK errors
    await standbyClient.query("SET session_replication_role = 'replica';");

    let hasErrors = false;

    for (const tableName of tables) {
      try {
        const countRes = await primaryClient.query(`SELECT COUNT(*) FROM public."${tableName}";`);
        const totalRows = parseInt(countRes.rows[0].count, 10);
        if (totalRows === 0) continue;

        const dataRes = await primaryClient.query(`SELECT * FROM public."${tableName}";`);
        const rows = dataRes.rows;
        const columns = Object.keys(rows[0]);
        const colList = columns.map(c => `"${c}"`).join(', ');

        await standbyClient.query('BEGIN');
        await standbyClient.query(`TRUNCATE TABLE public."${tableName}" CASCADE;`);

        for (const row of rows) {
          const values = columns.map(c => row[c]);
          const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
          await standbyClient.query(
            `INSERT INTO public."${tableName}" (${colList}) VALUES (${placeholders});`,
            values
          );
        }

        await standbyClient.query('COMMIT');
        console.log(` ✅ Đồng bộ: ${tableName} (${totalRows} dòng)`);
      } catch (err) {
        await standbyClient.query('ROLLBACK').catch(() => {});
        console.error(` ❌ Lỗi bảng ${tableName}:`, err.message);
        hasErrors = true;
      }
    }

    // Restore replication role and reload PostgREST schema cache
    await standbyClient.query("SET session_replication_role = 'origin';").catch(() => {});
    await standbyClient.query("NOTIFY pgrst, 'reload schema';").catch(() => {});

    if (hasErrors) {
      console.error('\n⚠️ Một số bảng gặp lỗi trong quá trình đồng bộ!');
      process.exit(1);
    } else {
      console.log('\n🎉 Đồng bộ định kỳ hoàn tất thành công 100%!');
    }
  } finally {
    await standbyClient.query("SET session_replication_role = 'origin';").catch(() => {});
    await primaryClient.end().catch(() => {});
    await standbyClient.end().catch(() => {});
  }
}

syncToStandby().catch(err => {
  console.error('❌ Lỗi ngoại lệ:', err);
  process.exit(1);
});
