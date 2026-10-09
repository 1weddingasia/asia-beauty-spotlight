import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const slug = "vien-tham-my-quoc-te-aa";

  const { data: existingBiz, error: fetchErr } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();

  if (!existingBiz) {
    console.log("Business not found!");
    return;
  }

  const socials = existingBiz.socials || {};
  socials.facebook = "https://www.facebook.com/AACLINIC/";
  socials.website = "https://aaclinic.vn/";

  const page_content = existingBiz.page_content || {};
  page_content.website = "https://aaclinic.vn/";
  
  console.log("Updating AA Clinic with Socials...");
  const { error } = await supabase.from('businesses').update({
    socials: socials,
    page_content: page_content,
    zalo: "0901119111", // from phone number
    email: "contact@aaclinic.vn",
    website: "https://aaclinic.vn/"
  }).eq('id', existingBiz.id);

  if (error) {
    console.error("Update error:", error);
  } else {
    console.log("Success updated AA Clinic Socials!");
  }
}

run();
