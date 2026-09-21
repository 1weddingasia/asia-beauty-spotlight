const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const envContent = fs.readFileSync('.env.local', 'utf16le');
  
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}="?([^"\\r\\n]+)"?`));
    return match ? match[1] : null;
  };
  
  const supabase = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { data: cats } = await supabase.from('directory_categories').select('id, slug');
  const allowedCatSlugs = ['spa-thu-gian', 'clinic-tham-my'];
  const allowedCatIds = cats.filter(c => allowedCatSlugs.includes(c.slug)).map(c => c.id);
  
  // Keep nha-khoa for testing? No, just keep the two for Seoul Center/Shynh House.
  // Actually, wait, maybe another business is a nail salon.
  // The Prive Spa can be 'nails-mi' and 'spa-thu-gian'.
  // Let's just manually delete specific ones.
  
  const { data: bizz } = await supabase.from('businesses').select('id, name, slug');
  const seoul = bizz.find(b => b.slug === 'tham-my-vien-seoul-center');
  const shynh = bizz.find(b => b.slug === 'shynh-house');
  const prive = bizz.find(b => b.slug === 'the-prive-spa-ben-thanh');

  const nailId = cats.find(c => c.slug === 'nails-mi').id;
  const nhaKhoaId = cats.find(c => c.slug === 'nha-khoa').id;
  const hairId = cats.find(c => c.slug === 'salon-toc').id;

  // Delete nail, nhakhoa, hair from Seoul & Shynh
  await supabase.from('business_categories').delete().in('category_id', [nailId, nhaKhoaId, hairId]).in('business_id', [seoul.id, shynh.id]);
  
  console.log("Categories cleaned!");
}
test();
