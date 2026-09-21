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
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') // Using ANON key
  );

  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data count:", data?.length);
}
test();
