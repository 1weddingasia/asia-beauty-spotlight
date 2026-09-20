import { NextResponse } from 'next/server';
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Call DeepSeek to generate the blog content in HTML
    const systemPrompt = `Bạn là một chuyên gia viết Content Marketing SEO tiếng Việt giỏi nhất.
Nhiệm vụ: Viết một bài blog chuẩn SEO bằng định dạng mã HTML (chỉ trả về mã HTML bọc trong thẻ <div>, không dùng markdown code block, không cần thẻ <html> hay <body>).
Yêu cầu:
- Sử dụng các thẻ <h2>, <h3>, <p>, <ul>, <li>, <strong> một cách hợp lý.
- Mạch văn tự nhiên, hấp dẫn, thuyết phục.
- Chèn khoảng 2-3 thẻ <img src="[IMAGE_PLACEHOLDER]" alt="Mô tả ảnh" class="rounded-xl w-full my-4" /> vào giữa các đoạn văn để làm sinh động bài viết. (Dùng chính xác chuỗi "[IMAGE_PLACEHOLDER]").
- Bắt đầu trực tiếp bằng nội dung, không chào hỏi.
`;

    const aiRes = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Hãy viết bài blog về chủ đề sau: ${prompt}` }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000 // 60s
      }
    );

    let htmlContent = aiRes.data.choices[0].message.content;
    
    // Clean up markdown wrapping if present
    htmlContent = htmlContent.replace(/```html/g, "").replace(/```/g, "").trim();

    // Now let's fetch images from Pexels to replace [IMAGE_PLACEHOLDER]
    // Extract keywords from the prompt to search Pexels
    const keywordRes = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "user", content: `Trích xuất 1 từ khóa tiếng Anh ngắn gọn nhất (chỉ 1 từ) để tìm kiếm hình ảnh minh họa cho chủ đề: "${prompt}". Ví dụ: spa, massage, beauty, clinic, skin, face, makeup. Chỉ trả về 1 từ duy nhất tiếng Anh.` }
        ]
      },
      {
        headers: { "Authorization": `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" }
      }
    );
    
    let keyword = keywordRes.data.choices[0].message.content.trim().toLowerCase();
    // Fallback if AI returns something weird
    if (keyword.split(" ").length > 2) keyword = "spa";

    // Fetch from pexels
    const pexelsRes = await axios.get(`https://api.pexels.com/v1/search?query=${keyword}&per_page=5&orientation=landscape`, {
      headers: { "Authorization": PEXELS_API_KEY }
    });

    const photos = pexelsRes.data.photos;
    
    // Replace placeholders with real images
    let photoIndex = 0;
    while (htmlContent.includes("[IMAGE_PLACEHOLDER]") && photoIndex < photos.length) {
      htmlContent = htmlContent.replace("[IMAGE_PLACEHOLDER]", photos[photoIndex].src.large);
      photoIndex++;
    }
    // Clean remaining placeholders if not enough photos
    htmlContent = htmlContent.replace(/<img src="\[IMAGE_PLACEHOLDER\]"[^>]*>/g, "");

    // Also extract a Title and Excerpt
    const metaRes = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "user", content: `Dựa vào chủ đề: "${prompt}", hãy tạo ra 1 Tiêu đề hấp dẫn (dưới 70 ký tự) và 1 Đoạn trích tóm tắt (dưới 160 ký tự). Trả về đúng định dạng JSON: {"title": "...", "excerpt": "..."}` }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: { "Authorization": `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" }
      }
    );

    const meta = JSON.parse(metaRes.data.choices[0].message.content);
    
    // Suggest a cover image
    const cover_image = photos.length > 0 ? photos[photos.length - 1].src.large : "";

    return NextResponse.json({
      title: meta.title,
      excerpt: meta.excerpt,
      content: htmlContent,
      cover_image
    });

  } catch (error: any) {
    console.error("AI Blog Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Lỗi tạo bài viết bằng AI" }, { status: 500 });
  }
}
