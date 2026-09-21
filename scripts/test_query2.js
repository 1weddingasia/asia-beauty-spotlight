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

  const filterCat = true;
  const filterLoc = false;

  let query = supabase
    .from('businesses')
    .select(`
      *,
      business_categories${filterCat ? '!inner' : ''} ( directory_categories${filterCat ? '!inner' : ''} (id, name, slug) ),
      business_locations${filterLoc ? '!inner' : ''} ( directory_locations${filterLoc ? '!inner' : ''} (id, name, slug) )
    `);
    
  if (filterCat) {
    query = query.eq('business_categories.directory_categories.slug', 'spa-tri-lieu');
  }

  const { data, error } = await query.limit(1);
  console.log('Error:', error);
  console.log('Data count:', data ? data.length : 0);
  if (data && data.length) {
    console.log(data[0].business_categories);
  }
}
test();
