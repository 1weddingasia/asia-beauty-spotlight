import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const branches = [
  {
    slug: 'am-thuc-que-nha-thanh-thai',
    name: 'Quê Nhà Thành Thái',
    address: '5 Thành Thái, P. 14, Q.10, Tp. Hồ Chí Minh',
    phone: '0901 60 60 26',
    url: 'https://amthucquenha.vn/pages/que-nha-thanh-thai'
  },
  {
    slug: 'am-thuc-que-nha-pham-ngoc-thach',
    name: 'Quê Nhà Phạm Ngọc Thạch',
    address: '28 Phạm Ngọc Thạch, P. Võ Thị Sáu, Q. 3, Tp. Hồ Chí Minh',
    phone: '0938 22 61 66',
    url: 'https://amthucquenha.vn/pages/que-nha-pham-ngoc-thach'
  },
  {
    slug: 'am-thuc-que-nha-nguyen-thai-binh',
    name: 'Quê Nhà Nguyễn Thái Bình',
    address: '52A Nguyễn Thái Bình, P. 4, Q. Tân Bình, Tp. Hồ Chí Minh',
    phone: '0966 60 60 26',
    url: 'https://amthucquenha.vn/pages/que-nha-nguyen-thai-binh'
  }
];

async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(filepath))
        .on('finish', () => resolve(true))
        .on('error', e => reject(e));
    });
  } catch (e) {
    console.error(`Failed to download ${url}`);
    return false;
  }
}

async function scrapeAndSeed() {
  console.log("1. Creating User...");
  const email = 'amthucquenha@gmail.com';
  let userId = null;
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  const existingUser = usersData?.users.find(u => u.email === email);
  
  if (existingUser) {
    console.log("User already exists:", existingUser.id);
    userId = existingUser.id;
    // Update password just in case
    await supabase.auth.admin.updateUserById(userId, { password: '123456' });
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: email,
      password: '123456',
      email_confirm: true
    });
    if (createErr) {
      console.error("Error creating user:", createErr);
      process.exit(1);
    }
    console.log("User created:", newUser.user.id);
    userId = newUser.user.id;
  }

  // Common Logo
  const logoUrl = 'https://theme.hstatic.net/200000407109/1001037921/14/logo.png';
  const logoPath = path.resolve(process.cwd(), 'public/images/demo/nha-hang/logo_quenha.png');
  await downloadImage(logoUrl, logoPath);
  
  console.log("2. Processing branches...");
  for (const branch of branches) {
    console.log(`\nFetching ${branch.name}...`);
    const { data: html } = await axios.get(branch.url);
    const $ = cheerio.load(html);
    
    // Find banner images (e.g., from og:image or slider images)
    let bannerUrl = $('meta[property="og:image"]').attr('content');
    if (bannerUrl && bannerUrl.startsWith('//')) bannerUrl = 'https:' + bannerUrl;
    
    // Try to find a larger image if og:image is just a logo
    const imgTags = [];
    $('img').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('logo')) {
        if (src.startsWith('//')) src = 'https:' + src;
        if (src.startsWith('/')) src = 'https://amthucquenha.vn' + src;
        imgTags.push(src);
      }
    });
    
    const branchBannerUrl = imgTags[0] || bannerUrl;
    const branchBannerPath = path.resolve(process.cwd(), `public/images/demo/nha-hang/banner_${branch.slug}.png`);
    let finalBannerUrl = '/images/demo/nha-hang/banner1.png'; // fallback

    if (branchBannerUrl) {
      console.log(`Downloading banner from ${branchBannerUrl}`);
      const success = await downloadImage(branchBannerUrl, branchBannerPath);
      if (success) {
        finalBannerUrl = `/images/demo/nha-hang/banner_${branch.slug}.png`;
      }
    }

    const business = {
      slug: branch.slug,
      name: branch.name,
      status: 'published',
      category_slug: 'nha-hang',
      owner_id: userId,
      is_featured: true,
      short_description: 'Chốn bình yên, tĩnh lặng giữa nhịp sống náo nhiệt Sài Gòn. Tôn vinh ẩm thực truyền thống Việt Nam.',
      address: branch.address,
      phone: branch.phone,
      description: 'Ẩm Thực Quê Nhà được định vị như một chốn bình yên, tĩnh lặng giữa nhịp sống náo nhiệt của Sài Gòn. Quán sở hữu không gian sân vườn rộng rãi, mang thiết kế bình dị, tinh tế và tôn vinh các giá trị ẩm thực truyền thống Việt Nam.',
      socials: {
        facebook: 'https://www.facebook.com/nhahangquenha',
        tiktok: '',
        zalo: ''
      },
      page_content: {
        tagline: 'Chốn bình yên giữa Sài Gòn - Thêm món thêm bia, Thêm bạn thêm vui!',
        working_hours: '10:00 - 23:00 (Thứ 2 - Chủ Nhật)',
        logo_url: '/images/demo/nha-hang/logo_quenha.png',
        banners: [finalBannerUrl, '/images/demo/nha-hang/banner2.png'],
        services: [
          {
            name: 'Đặt bàn Alacarte / Tụ tập',
            desc: 'Thực đơn gọi món đa dạng, đậm chất truyền thống. Các món nổi bật: Gà H\'Mong tiềm bí đỏ, Chả giò gánh Quê Nhà, Mì hấp tôm sú lá sen, Gỏi xoài khô cá sặc.',
            price: 0,
            original_price: 0,
            duration: 'Giữ chỗ miễn phí',
            image_url: '/images/demo/nha-hang/service1.png'
          },
          {
            name: 'Đặt Tiệc Tại Nhà Hàng',
            desc: 'Tổ chức các buổi tiệc liên hoan, tiệc sinh nhật, tiệc cuối năm trong không gian sân vườn rộng rãi, bình dị và tinh tế. "Thêm món thêm bia - Thêm bạn thêm vui" - hoá đơn càng lớn quà tặng càng hấp dẫn.',
            price: 0,
            original_price: 0,
            duration: 'Liên hệ tư vấn',
            image_url: '/images/demo/nha-hang/service2.png'
          },
          {
            name: 'Dịch vụ Catering Tận Nơi',
            desc: 'Tổ chức và phục vụ tiệc tận nơi theo yêu cầu. Thực đơn thượng hạng với Gà ác hầm bào ngư, Sò mai nướng mỡ hành, Lẩu cá linh bông điên điển.',
            price: 0,
            original_price: 0,
            duration: 'Báo giá theo menu',
            image_url: '/images/demo/nha-hang/service3.png'
          }
        ],
        deals: [
          {
            id: `deal-${branch.slug}-1`,
            title: 'Ưu Đãi Tiệc Catering',
            promo_price: 'Giảm 20%',
            original_price: 'Đồ uống',
            valid_until: 'Theo lịch đặt',
            desc: 'Giảm ngay 20% đồ uống, 5% thức ăn và tặng kèm voucher có giá trị lên đến 3.000.000 VNĐ khi đặt dịch vụ Catering.'
          },
          {
            id: `deal-${branch.slug}-2`,
            title: 'Bia Đồng Giá 15.000đ',
            promo_price: '15.000đ',
            original_price: '',
            valid_until: 'Sắp kết thúc',
            desc: 'Chương trình ưu đãi bia đồng giá 15.000đ dành cho các nhóm bạn tụ tập thưởng thức ẩm thực truyền thống.'
          }
        ],
        gallery: [
          finalBannerUrl,
          '/images/demo/nha-hang/banner2.png',
          '/images/demo/nha-hang/service1.png',
          '/images/demo/nha-hang/service2.png',
          '/images/demo/nha-hang/service3.png'
        ],
        reviews: [
          {
            author: 'Nguyễn Văn A',
            rating: 5,
            comment: 'Không gian sân vườn rất mát mẻ và yên tĩnh, trái ngược hoàn toàn với Sài Gòn ồn ào bên ngoài. Các món ăn truyền thống nêm nếm rất vừa miệng.'
          }
        ]
      }
    };

    const { data: existing } = await supabase.from('businesses').select('id').eq('slug', branch.slug).maybeSingle();
    if (existing) {
      await supabase.from('businesses').update(business).eq('id', existing.id);
      console.log(`Updated ${branch.slug}`);
    } else {
      await supabase.from('businesses').insert(business);
      console.log(`Inserted ${branch.slug}`);
    }
  }
}

scrapeAndSeed().then(() => console.log("Hoàn tất!")).catch(console.error);
