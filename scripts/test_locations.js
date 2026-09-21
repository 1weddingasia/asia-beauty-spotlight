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

  let query = supabase
    .from('businesses')
    .select(`
      id, name, slug, location_slug,
      business_locations ( directory_locations (id, name, slug) )
    `);
    
  const { data, error } = await query;
  console.log('Error:', error);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}
test();
