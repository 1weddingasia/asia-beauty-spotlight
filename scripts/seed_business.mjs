import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedApprovedBusinesses() {
  const approvedDir = path.resolve(process.cwd(), 'data/onboarding/queue');
  
  if (!fs.existsSync(approvedDir)) {
    console.log("No approved directory found.");
    return;
  }

  const files = fs.readdirSync(approvedDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log("No approved business files found to seed.");
    return;
  }

  console.log(`Found ${files.length} approved businesses to seed...`);

  for (const file of files) {
    const filePath = path.join(approvedDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Create auth user first
      const email = data.email || (data.slug ? `${data.slug}@1booking.asia` : null);
      if (!email) {
        console.error(`Skipping ${file} - no email and no slug to generate one.`);
        continue;
      }
      
      let ownerId = data.owner_id;

      if (!ownerId) {
        // Find existing user by email using the direct API instead of listUsers
        // Since we can't reliably get user by email without a paginated search or admin.getUserById, 
        // a simpler approach is trying to create, and if it fails with duplicate, we search for it.
        // Actually, Supabase admin API doesn't have a direct getUserByEmail, but listUsers has pagination.
        
        let user = null;
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
            page: page,
            perPage: 100
          });
          
          if (listError) break;
          
          const found = usersData.users.find(u => u.email === email);
          if (found) {
            user = found;
            break;
          }
          
          if (usersData.users.length < 100) hasMore = false;
          page++;
        }

        if (!user) {
          console.log(`Creating auth user for ${email}...`);
          const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: '123456', // Updated to match user request
            email_confirm: true,
          });
          if (authError) {
            console.error(`Error creating user ${email}:`, authError.message);
            continue;
          }
          user = newUser.user;
        }
        ownerId = user.id;
        data.owner_id = ownerId;
      }

      // Automatically set as draft for user review, unless explicitly marked otherwise
      data.status = data.status || 'draft';

      const { error } = await supabase.from('businesses').upsert(data, { onConflict: 'slug' });
      
      if (error) {
        console.error(`Error inserting ${file}:`, error.message);
      } else {
        console.log(`✅ Successfully seeded: ${data.name || file} (Account: ${email})`);
      }
    } catch (e) {
      console.error(`Failed to parse or seed ${file}:`, e);
    }
  }
}

seedApprovedBusinesses().catch(e => {
  console.error("Global seed error:", e);
  process.exit(1);
});
