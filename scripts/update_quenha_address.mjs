import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  {
    slug: 'am-thuc-que-nha-thanh-thai',
    address: '5 Thành Thái, Phường Diên Hồng, Tp. Hồ Chí Minh',
    phone: '0901 60 60 26'
  },
  {
    slug: 'am-thuc-que-nha-pham-ngoc-thach',
    address: '28 Phạm Ngọc Thạch, Phường Xuân Hòa, Tp. Hồ Chí Minh',
    phone: '0938 22 61 66'
  },
  {
    slug: 'am-thuc-que-nha-nguyen-thai-binh',
    address: '52A Nguyễn Thái Bình, Phường Tân Sơn Nhất, Tp. Hồ Chí Minh',
    phone: '0966 60 60 26'
  }
];

async function updateData() {
  for (const branch of updates) {
    const { data: business } = await supabase.from('businesses').select('*').eq('slug', branch.slug).maybeSingle();
    if (business) {
      business.address = branch.address;
      business.phone = branch.phone;
      business.page_content.banners = [
        '/images/demo/nha-hang/banner_dia_chi.jpg',
        '/images/demo/nha-hang/banner_20_10.jpg'
      ];
      
      const { error } = await supabase.from('businesses').update(business).eq('id', business.id);
      if (error) {
        console.error(`Error updating ${branch.slug}:`, error);
      } else {
        console.log(`Successfully updated ${branch.slug}`);
      }
    }
  }
}

updateData().then(() => console.log('Done')).catch(console.error);
