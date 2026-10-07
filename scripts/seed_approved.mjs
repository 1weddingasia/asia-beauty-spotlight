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
  const approvedDir = path.resolve(process.cwd(), 'data/onboarding/approved');
  
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
      const email = data.email || `${data.slug}@1booking.asia`;
      let ownerId = data.owner_id;

      if (!ownerId) {
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        let user = existingUsers.users.find(u => u.email === email);

        if (!user) {
          console.log(`Creating auth user for ${email}...`);
          const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: 'password123456',
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

      const { error } = await supabase.from('businesses').upsert(data, { onConflict: 'slug' });
      
      if (error) {
        console.error(`Error inserting ${file}:`, error.message);
      } else {
        console.log(`✅ Successfully seeded: ${data.name || file} (Account: ${email} / password123456)`);
      }
    } catch (e) {
      console.error(`Failed to parse or seed ${file}:`, e);
    }
  }
}

seedApprovedBusinesses();
