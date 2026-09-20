const puppeteer = require('puppeteer');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabase = createClient(
  'https://ejlltaigohemjagfzxxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbGx0YWlnb2hlbWphZ2Z6eHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgwNzE0NiwiZXhwIjoyMTA1MzgzMTQ2fQ.R_Q4p01oU5gg9GUpn3TL2SPt7L2brq2kqwy6SnR9row'
);

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-xxxxxx';

// Tạo giao diện nhập liệu Terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 150;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // Tốc độ cuộn chậm vừa phải để lazy load kịp
    });
  });
}

async function runIngestion(targetUrl) {
  console.log(`\n======================================================`);
  console.log(`🚀 KHỞI ĐỘNG CỖ MÁY CÀO DỮ LIỆU ĐA LỚP V2.0`);
  console.log(`======================================================`);
  console.log(`[+] Đang mở Trình duyệt ẩn (Headless) truy cập: ${targetUrl}`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 90000 });
    
    console.log(`[1] Đang cuộn toàn bộ trang để kích hoạt Lazy Loading (Vui lòng chờ)...`);
    await autoScroll(page);
    
    // Đợi thêm 3s cho các ảnh nặng cuối cùng load xong
    await new Promise(r => setTimeout(r, 3000));

    console.log(`[2] Đang kích hoạt bộ lọc hình ảnh thông minh (Loại bỏ rác/icon)...`);
    const data = await page.evaluate(() => {
      
      // Hàm kiểm tra ảnh rác
      const isGarbage = (src, width, height) => {
        if (!src) return true;
        const lowSrc = src.toLowerCase();
        // Bỏ định dạng vector, icon, gif
        if (lowSrc.endsWith('.svg') || lowSrc.endsWith('.gif')) return true;
        // Bỏ đường dẫn rác
        if (lowSrc.includes('/icons/') || lowSrc.includes('/plugins/') || lowSrc.includes('footer-bg')) return true;
        // Nếu ảnh quá nhỏ và không phải logo
        if (width < 250 && height < 250 && !lowSrc.includes('logo')) return true;
        return false;
      };

      // 1. Lấy Image Tags
      const imgElements = Array.from(document.querySelectorAll('img'));
      let validImages = [];
      
      imgElements.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src && src.startsWith('http')) {
          if (!isGarbage(src, img.naturalWidth || img.width, img.naturalHeight || img.height)) {
            validImages.push(src);
          }
        }
      });
      
      // 2. Lấy Background Images
      const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage && style.backgroundImage !== 'none';
      });
      
      elementsWithBg.forEach(el => {
        const style = window.getComputedStyle(el);
        const match = style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1].startsWith('http')) {
          const rect = el.getBoundingClientRect();
          if (!isGarbage(match[1], rect.width, rect.height)) {
            validImages.push(match[1]);
          }
        }
      });

      // Lọc trùng lặp
      const uniqueImages = [...new Set(validImages)];
      
      // 3. Lấy Text toàn trang (Bỏ khoảng trắng thừa)
      const textContent = document.body.innerText.replace(/\n\s*\n/g, '\n').substring(0, 30000); // Lấy max 30k ký tự
      
      return { text: textContent, images: uniqueImages };
    });

    await browser.close();

    console.log(`    -> Tìm thấy ${data.images.length} hình ảnh kích thước lớn/chất lượng cao.`);
    
    console.log(`[3] Gửi Dữ liệu đa tầng cho DeepSeek AI xử lý & bóc tách...`);
    
    const systemPrompt = `
You are an expert Data Engineer mapping raw website content into a strictly defined JSON Schema for a luxury Spa/Clinic directory platform.

I will provide:
1. RAW TEXT: The raw text extracted from the website.
2. FILTERED IMAGES: A list of high-quality image URLs found on the site.

Return ONLY a valid JSON object strictly matching this exact structure:
{
  "name": "Official Business Name (e.g., Shynh House, Mailisa)",
  "slug": "url-friendly-slug-no-spaces",
  "short_description": "1-2 sentences summarizing the business",
  "description": "Full detailed description, history, mission. Can be multiple paragraphs.",
  "address": "Full physical address if found",
  "phone": "Phone number if found",
  "website": "${targetUrl}",
  "city": "The city/province (e.g., TP. Hồ Chí Minh, Hà Nội)",
  "categories": [
    { "name": "Thẩm Mỹ Viện", "slug": "tham-my-vien" },
    { "name": "Chăm sóc da", "slug": "cham-soc-da" }
  ],
  "page_content": {
    "tagline": "A catchy tagline or slogan if found",
    "logo_url": "Pick the most likely Logo URL from the IMAGES list. Must contain 'logo' if possible.",
    "banners": ["url1", "url2", "url3"], // MUST pick exactly 3 beautiful, wide URLs for the Hero Carousel. Reject background-patterns.
    "gallery": ["url1", "url2", "url3", "url4"], // Pick up to 6 URLs representing the real space/facility/doctors. Reject text-heavy banners or plain gradients.
    "services_list": [
      {
        "name": "Service Name",
        "description": "Brief Service Description",
        "price_min": null, 
        "price_max": null
      }
    ],
    "working_hours_text": "e.g., 08:00 - 20:00. (If not found in TEXT, strictly default to 'Thứ 2 - Chủ Nhật: 08:00 - 20:00')"
  }
}

CRITICAL RULES:
1. IMAGES RULE: You MUST ONLY select URLs from the provided IMAGES list. DO NOT make up URLs.
2. IMAGE QUALITY: Differentiate between a 'banner' (wide, promotional) and a 'gallery' image (facility, rooms, doctors, results). NEVER select gradient backgrounds or plain patterns.
3. OUTPUT: Your response MUST be valid, pure JSON without any markdown formatting wrappers or extra text.
`;

    const userPrompt = `
RAW TEXT CONTENT:
${data.text}

FILTERED IMAGES FOUND:
${data.images.join('\n')}
`;

    const deepseekRes = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000 // Tăng timeout cho DeepSeek vì dữ liệu lớn
    });

    let jsonStr = deepseekRes.data.choices[0].message.content.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    
    const parsedData = JSON.parse(jsonStr.trim());
    console.log(`    -> AI đã bóc tách xong Cấu trúc Dữ liệu cho: ${parsedData.name}`);

    // Bổ sung dữ liệu mặc định hệ thống
    parsedData.status = 'published';
    parsedData.is_featured = true;

    console.log(`[4] Lưu thông tin vào Database (Supabase)...`);
    const { data: existing } = await supabase.from('businesses').select('id').eq('slug', parsedData.slug).single();
    
    if (existing) {
      const { error } = await supabase.from('businesses').update(parsedData).eq('id', existing.id);
      if (error) throw error;
      console.log(`    -> [THÀNH CÔNG] Đã Ghi Đè (Update) thành công: ${parsedData.slug}`);
    } else {
      const { error } = await supabase.from('businesses').insert([parsedData]);
      if (error) throw error;
      console.log(`    -> [THÀNH CÔNG] Đã Tạo Mới (Insert) thành công: ${parsedData.slug}`);
    }
    
    console.log(`======================================================\n`);

  } catch (err) {
    console.error(`\n[LỖI NGHIÊM TRỌNG]`, err.response ? err.response.data : err.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Chạy Script
const target = process.argv[2];
if (target) {
  runIngestion(target.trim()).then(() => process.exit(0));
} else {
  rl.question('Nhập URL Website Doanh Nghiệp (vd: https://shynhhouse.com): ', (url) => {
    if (url) {
      runIngestion(url.trim()).then(() => rl.close());
    } else {
      console.log("URL không hợp lệ!");
      rl.close();
    }
  });
}
