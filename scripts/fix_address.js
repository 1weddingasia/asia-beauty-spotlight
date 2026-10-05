const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: existing } = await supabase.from('businesses').select('page_content').eq('slug', 'luxury-spa-demo').single();
  if (!existing) return;
  const content = existing.page_content;
  
  content.address = 'Số 1, Phố Sang Trọng, Quận 1, TP. HCM';
  
  const payload = {
    address: 'Số 1, Phố Sang Trọng, Quận 1, TP. HCM',
    page_content: content
  };
  await supabase.from('businesses').update(payload).eq('slug', 'luxury-spa-demo');
  console.log('Fixed address encoding successfully!');
}
run();
