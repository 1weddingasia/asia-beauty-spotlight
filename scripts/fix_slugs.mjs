import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  { old: 'am-thuc-que-nha-thanh-thai', new: 'que-nha-thanh-thai' },
  { old: 'am-thuc-que-nha-pham-ngoc-thach', new: 'que-nha-pham-ngoc-thach' },
  { old: 'am-thuc-que-nha-nguyen-thai-binh', new: 'que-nha-nguyen-thai-binh' }
];

async function updateSlugs() {
  for (const { old, new: newSlug } of updates) {
    const { error } = await supabase
      .from('businesses')
      .update({ slug: newSlug })
      .eq('slug', old);
    
    if (error) {
      console.error(`Failed to update ${old} to ${newSlug}:`, error);
    } else {
      console.log(`Updated ${old} to ${newSlug}`);
    }
  }
}

updateSlugs().then(() => console.log('Done'));
