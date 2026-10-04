require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_top_deals_for_business(p_business_id UUID, p_limit INT DEFAULT 3)
      RETURNS TABLE (deal_name TEXT, lead_count BIGINT)
      LANGUAGE sql
      AS $$
        SELECT 
          COALESCE(deal_name, 'Ưu đãi chung') AS deal_name, 
          COUNT(*) AS lead_count
        FROM business_leads
        WHERE business_id = p_business_id
        GROUP BY COALESCE(deal_name, 'Ưu đãi chung')
        ORDER BY lead_count DESC
        LIMIT p_limit;
      $$;
    `);
    console.log('RPC created.');
    
    const { rows } = await pool.query("SELECT id, slug, name, status FROM businesses WHERE name ILIKE '%Luxury%'");
    console.log('Luxury Spa:', rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
