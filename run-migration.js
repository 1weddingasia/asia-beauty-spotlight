// Cập nhật icon và sort_order cho các categories hiện có
const { Client } = require('pg');
const DIRECT_URL = 'postgresql://postgres.ejlltaigohemjagfzxxh:MYW_.Guf3YkQ4qi@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString: DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const updates = [
    { slug: 'clinic-tham-my', icon: '💉', description: 'Phòng khám thẩm mỹ, tiêm filler, laser', sort_order: 1 },
    { slug: 'nails-mi', icon: '💅', description: 'Tiệm nail, chăm sóc móng, nối mi', sort_order: 2 },
    { slug: 'nha-khoa', icon: '🦷', description: 'Nha khoa, trồng implant, niềng răng', sort_order: 3 },
    { slug: 'salon-toc', icon: '✂️', description: 'Salon tóc, uốn duỗi, nhuộm', sort_order: 4 },
    { slug: 'spa-thu-gian', icon: '🧖', description: 'Spa, massage, body treatment', sort_order: 5 },
  ];

  for (const u of updates) {
    await client.query(
      'UPDATE public.directory_categories SET icon=$1, description=$2, sort_order=$3 WHERE slug=$4',
      [u.icon, u.description, u.sort_order, u.slug]
    );
    console.log('✅ Updated: ' + u.slug + ' ' + u.icon);
  }

  // Cũng cập nhật locations chưa có description
  await client.query(`UPDATE public.directory_locations SET description='Quận 1, TP. Hồ Chí Minh' WHERE slug='quan-1-hcm' AND (description IS NULL OR description = '')`);

  // Final count
  const r1 = await client.query('SELECT COUNT(*) FROM public.directory_categories');
  const r2 = await client.query('SELECT COUNT(*) FROM public.directory_locations');
  const r3 = await client.query('SELECT COUNT(*) FROM public.business_categories');
  const r4 = await client.query('SELECT COUNT(*) FROM public.business_locations');
  
  console.log('\n=== TỔNG KẾT DATABASE ===');
  console.log('  directory_categories:  ' + r1.rows[0].count + ' danh mục');
  console.log('  directory_locations:   ' + r2.rows[0].count + ' địa điểm');
  console.log('  business_categories:   ' + r3.rows[0].count + ' liên kết');
  console.log('  business_locations:    ' + r4.rows[0].count + ' liên kết');

  await client.end();
  console.log('\n🎉 Hoàn tất!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
