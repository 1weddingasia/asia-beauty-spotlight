import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
  {
    email: 'quenhathanhthai@gmail.com',
    slug: 'am-thuc-que-nha-thanh-thai'
  },
  {
    email: 'quenhaphamngocthach@gmail.com',
    slug: 'am-thuc-que-nha-pham-ngoc-thach'
  },
  {
    email: 'quenhanguyenthaibinh@gmail.com',
    slug: 'am-thuc-que-nha-nguyen-thai-binh'
  }
];

async function splitAccounts() {
  for (const acc of accounts) {
    console.log(`Processing ${acc.email} for ${acc.slug}...`);
    
    // 1. Create or get user
    let userId = null;
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existingUser = usersData?.users.find(u => u.email === acc.email);
    
    if (existingUser) {
      console.log(`User ${acc.email} already exists: ${existingUser.id}`);
      userId = existingUser.id;
      // Update password just in case
      await supabase.auth.admin.updateUserById(userId, { password: '123456', email_confirm: true });
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: '123456',
        email_confirm: true
      });
      
      if (createErr) {
        console.error(`Error creating user ${acc.email}:`, createErr);
        continue;
      }
      console.log(`User ${acc.email} created: ${newUser.user.id}`);
      userId = newUser.user.id;
    }

    // 2. Assign business to this user
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({ owner_id: userId })
      .eq('slug', acc.slug);
      
    if (updateErr) {
      console.error(`Error updating business ${acc.slug}:`, updateErr);
    } else {
      console.log(`Successfully assigned ${acc.slug} to ${acc.email}`);
    }
  }
}

splitAccounts().then(() => console.log("Done")).catch(console.error);
