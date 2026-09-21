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

  // We want to delete mappings for ha-noi, da-nang, nha-trang
  // First, get the IDs of these locations
  const { data: locs } = await supabase.from('directory_locations').select('id, slug');
  const hcmIds = locs.filter(l => ['ho-chi-minh', 'quan-1-hcm'].includes(l.slug)).map(l => l.id);
  
  // We'll just delete everything from business_locations where location_id is NOT in hcmIds
  const { error } = await supabase
    .from('business_locations')
    .delete()
    .not('location_id', 'in', `(${hcmIds.join(',')})`);
    
  console.log("Deleted extra locations. Error:", error);
}
test();
