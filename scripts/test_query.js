const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const envContent = fs.readFileSync('.env.local', 'utf16le');
  
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=([^\\r\\n]+)`));
    return match ? match[1] : null;
  };
  
  const supabase = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const filterCat = true;
  let query = supabase
    .from('businesses')
    .select(`*, categories!inner(id, name, slug)`);
  query = query.eq('categories.slug', 'spa-tri-lieu');

  const { data, error } = await query.limit(1);
  console.log('Error 1:', error);
  console.log('Data 1:', data);

  // Try with aliased 
  let query2 = supabase
    .from('businesses')
    .select(`*, category:categories!inner(id, name, slug)`);
  query2 = query2.eq('category.slug', 'spa-tri-lieu');

  const { data: d2, error: e2 } = await query2.limit(1);
  console.log('Error 2:', e2);
  console.log('Data 2:', d2);
}
test();
