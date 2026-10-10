import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import jwt from 'jsonwebtoken';
import { getSiteConfig } from '@/config/site-config';

function extractPhone(text: string): string | null {
  const cleaned = text.replace(/[\s\.\-]/g, '');
  const match = cleaned.match(/(03|05|07|08|09)\d{8}/);
  return match ? match[0] : null;
}

function sendTelegramAsync(chatId: string, message: string, host: string = '') {
  const isBookingSite = host.toLowerCase().includes('1booking');
  const token = isBookingSite
    ? (process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN)
    : (process.env.TELEGRAM_BOT_TOKEN_1BEAUTY || process.env.TELEGRAM_BOT_TOKEN);
    
  if (!token || !chatId) return Promise.resolve();

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  }).catch(err => console.error("Telegram error:", err));
}

export const maxDuration = 60; // Allow longer execution time for Vercel

const isValidUrl = (url?: string) => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export async function POST(req: Request) {
  try {
    const host = req.headers.get('host') || '';
    const platformConfig = getSiteConfig(host);
    const platformStr = platformConfig.brand.toUpperCase();
    const platformName = platformConfig.brand;

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "Chưa cấu hình API Key" }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: DEEPSEEK_API_KEY,
    });
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const { slug, messages, adminToken } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    
    // Get business context
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Verify admin token securely
    let isAdmin = false;
    if (adminToken && business.chatbot_passcode) {
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET) as { business_id: string; is_admin: boolean };
        if (decoded.business_id === business.id && decoded.is_admin) {
          isAdmin = true;
        }
      } catch (err) {
        console.warn('Admin token verification failed:', err instanceof Error ? err.message : err);
      }
    }

    // Retrieve services and format them for the prompt
    let servicesInfo = 'Tiệm chưa cập nhật danh sách dịch vụ chi tiết.';
    if (business.page_content && Array.isArray(business.page_content.services) && business.page_content.services.length > 0) {
      servicesInfo = business.page_content.services.map((s: any) => 
        `- ${s.name || s.title}: Giá ${s.price || 'Đang cập nhật'}`
      ).join('\n');
    }

    let dealsInfo = 'Tiệm chưa có ưu đãi nào.';
    if (business.page_content && Array.isArray(business.page_content.deals) && business.page_content.deals.length > 0) {
      dealsInfo = business.page_content.deals.map((d: any) => 
        `- ${d.title}: Giá gốc ${d.original_price} - Giá ưu đãi ${d.promo_price || 'Không có'} (Ghi chú: ${d.note || 'Không'})`
      ).join('\n');
    }

    // Build the system prompt
    let systemPrompt = `Bạn là nhân viên chăm sóc khách hàng của cơ sở ${business.name} trên nền tảng ${platformName}. Bạn đang tư vấn trực tiếp cho khách. TUYỆT ĐỐI KHÔNG xưng là "Trợ lý AI" hay "Bot". Hãy xưng hô thân thiện, tự nhiên như một người thật (ví dụ: xưng em/mình và gọi khách là anh/chị/bạn).
Thông tin tiệm: SĐT ${business.phone || 'không có'}, Địa chỉ ${business.address || 'không có'}.
Danh sách dịch vụ của tiệm:
${servicesInfo}
Danh sách ưu đãi (Deals) hiện có:
${dealsInfo}
Hãy dựa vào danh sách trên để tư vấn giá cả và dịch vụ cho khách hàng nếu họ hỏi. Nếu khách muốn đặt lịch hoặc nhận ưu đãi, hãy yêu cầu họ cung cấp Tên và Số điện thoại, cùng thời gian mong muốn.
Khi đã có đủ SĐT và thông tin, hãy chủ động đề nghị khách xác nhận bằng câu: "Bạn vui lòng gõ 'Xác nhận' để hệ thống gửi đơn đặt lịch nhé".
KHI VÀ CHỈ KHI khách đã gõ chữ đồng ý hoặc "xác nhận", bạn mới chèn thêm chuỗi "[CHOT_DON]" vào cuối câu trả lời xác nhận của bạn.
Nếu khách hỏi đã đặt thành công chưa, hãy báo là "hệ thống đã ghi nhận thông tin, nhân viên của tiệm sẽ liên hệ với anh/chị trong thời gian sớm nhất để xác nhận lại lịch đặt". Tuyệt đối không được tự ý khẳng định là "đã đặt lịch thành công".
`;

    if (isAdmin) {
      systemPrompt += `\nQUAN TRỌNG: NGƯỜI DÙNG HIỆN TẠI LÀ QUẢN TRỊ VIÊN (CHỦ TIỆM) ĐÃ XÁC THỰC THÀNH CÔNG.
Bạn CÓ QUYỀN VÀ BẮT BUỘC PHẢI gọi các Tool (update_business_info, update_images, update_services_or_deals, update_passcode) khi họ yêu cầu thêm/sửa/xóa thông tin, đổi mã bảo mật, hình ảnh hoặc giá dịch vụ. KHÔNG ĐƯỢC yêu cầu mật khẩu nữa vì họ đã xác thực rồi.`;
    } else {
      systemPrompt += `\nNếu người dùng là khách: Hỗ trợ thân thiện, ngắn gọn.
Nếu người dùng muốn chỉnh sửa trang/đổi giá: Lịch sự yêu cầu họ cung cấp Mật khẩu/Passcode của tiệm để bật chế độ Quản trị. Đừng gọi hàm sửa nếu chưa có passcode.`;
    }

    // Lọc SĐT và gửi Telegram
    const lastUserMsg = messages[messages.length - 1];
    if (!isAdmin && lastUserMsg && typeof lastUserMsg.content === 'string') {
      const phoneInLastMsg = extractPhone(lastUserMsg.content);
      if (phoneInLastMsg) {
        const voucher_code = `1B-${business.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        await supabase.from('business_leads').insert({
          business_id: business.id,
          customer_name: 'Khách từ Chatbot',
          customer_phone: phoneInLastMsg,
          deal_name: 'Tư vấn trực tiếp',
          voucher_code,
        });

        // Chỉ lưu lead vào database, telegram sẽ gửi khi AI chốt đơn
      }
    }

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "authenticate_owner",
          description: "Kiểm tra passcode để bật chế độ quản trị (admin).",
          parameters: {
            type: "object",
            properties: {
              passcode: { type: "string", description: "Mật khẩu hoặc Claim Token do người dùng cung cấp" }
            },
            required: ["passcode"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_business_info",
          description: "Cập nhật thông tin cơ bản của tiệm (Tên, SĐT, Địa chỉ, Mô tả). Yêu cầu đã xác thực admin.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              address: { type: "string" },
              description: { type: "string" },
              short_description: { type: "string", description: "Mô tả ngắn/slogan của tiệm (thường là 1 câu)" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_images",
          description: "Cập nhật hình ảnh chung của tiệm bằng đường link (URL). Yêu cầu đã xác thực admin.",
          parameters: {
            type: "object",
            properties: {
              logo_url: { type: "string", description: "Link hình ảnh logo" },
              banner_url: { type: "string", description: "Link hình ảnh banner/cover chính của trang" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_services_or_deals",
          description: "Thêm, Sửa hoặc Xóa dịch vụ/ưu đãi. Yêu cầu đã xác thực admin.",
          parameters: {
            type: "object",
            properties: {
              target: { type: "string", enum: ["services", "deals"], description: "Cập nhật dịch vụ hay ưu đãi?" },
              action: { type: "string", enum: ["add", "update", "delete"], description: "Hành động" },
              item_name: { type: "string", description: "Tên dịch vụ/ưu đãi" },
              price: { type: "string", description: "Giá mới (bắt buộc nếu add/update)" },
              original_price: { type: "string", description: "Giá gốc (nếu có)" },
              description: { type: "string", description: "Mô tả ngắn gọn" },
              image_url: { type: "string", description: "Link hình ảnh của dịch vụ/ưu đãi này" }
            },
            required: ["target", "action", "item_name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_admin_links",
          description: "Lấy link kết nối Telegram và trang CRM quản lý khách hàng.",
          parameters: {
            type: "object",
            properties: {}
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_passcode",
          description: "Thay đổi mã bảo mật (Passcode) của tiệm. Yêu cầu đã xác thực admin.",
          parameters: {
            type: "object",
            properties: {
              new_passcode: { type: "string", description: "Mã bảo mật mới" }
            },
            required: ["new_passcode"]
          }
        }
      }
    ];

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: allMessages,
      tools: tools as any,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    let toolResponses = [];
    let newToken = adminToken;
    let isDataUpdated = false;

    if (responseMessage.tool_calls) {
      for (const tCall of responseMessage.tool_calls) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toolCall = tCall as any; 
        const functionName = toolCall.function.name;
        
        let functionArgs;
        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          toolResponses.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: "Lỗi: Không thể phân tích đối số của Tool.",
          });
          continue;
        }

        let result = "";

        if (functionName === "authenticate_owner") {
          // Compare securely, no hardcoded fallbacks
          if (business.chatbot_passcode && functionArgs.passcode === business.chatbot_passcode) {
            newToken = jwt.sign({ business_id: business.id, is_admin: true }, JWT_SECRET, { expiresIn: '2h' });
            isAdmin = true; // Grant admin immediately for subsequent tools in this turn
            result = "Xác thực thành công! Bạn đã vào chế độ Quản Trị. Bạn có thể sử dụng các lệnh sửa đổi ngay bây giờ.";
          } else {
            result = "Sai mật khẩu hoặc Claim Token.";
          }
        } 
        else if (functionName === "update_business_info") {
          if (!isAdmin) {
            result = "Lỗi: Bạn chưa xác thực quyền admin!";
          } else {
            const updates: any = {};
            let pageContent = typeof business.page_content === 'string' ? JSON.parse(business.page_content || '{}') : (business.page_content || {});
            let hasPageContentChanges = false;

            if (functionArgs.name) updates.name = functionArgs.name;
            if (functionArgs.phone) updates.phone = functionArgs.phone;
            if (functionArgs.address) updates.address = functionArgs.address;
            if (functionArgs.short_description) updates.short_description = functionArgs.short_description;
            if (functionArgs.description) {
              updates.description = functionArgs.description;
              pageContent.description = functionArgs.description;
              hasPageContentChanges = true;
            }

            if (hasPageContentChanges) {
              updates.page_content = pageContent;
            }
            
            if (Object.keys(updates).length > 0) {
              await supabase.from('businesses').update(updates).eq('id', business.id);
              isDataUpdated = true;
              result = "Đã cập nhật thông tin cơ bản thành công!";
            } else {
              result = "Không có thông tin nào để cập nhật.";
            }
          }
        }
        else if (functionName === "update_images") {
          if (!isAdmin) {
            result = "Lỗi: Bạn chưa xác thực quyền admin!";
          } else {
            const pageContent = business.page_content || {};
            let changed = false;
            let errorMsg = "";
            
            if (functionArgs.logo_url) {
              if (!isValidUrl(functionArgs.logo_url)) {
                errorMsg += "Link logo không hợp lệ. ";
              } else {
                pageContent.logo_url = functionArgs.logo_url;
                changed = true;
              }
            }
            if (functionArgs.banner_url) {
              if (!isValidUrl(functionArgs.banner_url)) {
                errorMsg += "Link banner không hợp lệ. ";
              } else {
                pageContent.banners = pageContent.banners || ["", "", ""];
                pageContent.banners[0] = functionArgs.banner_url;
                pageContent.hero_image = functionArgs.banner_url;
                changed = true;
              }
            }
            
            if (changed) {
              await supabase.from('businesses').update({ page_content: pageContent }).eq('id', business.id);
              isDataUpdated = true;
              result = `Đã cập nhật hình ảnh thành công! ${errorMsg}`.trim();
            } else {
              result = errorMsg ? `Lỗi: ${errorMsg}` : "Không có hình ảnh nào được cập nhật (url trống).";
            }
          }
        }
        else if (functionName === "update_services_or_deals") {
          if (!isAdmin) {
            result = "Lỗi: Bạn chưa xác thực quyền admin!";
          } else if (functionArgs.target !== "services" && functionArgs.target !== "deals") {
            result = "Lỗi: Target chỉ được phép là 'services' hoặc 'deals'.";
          } else {
            const targetProp = functionArgs.target as "services" | "deals";
            const pageContent = business.page_content || {};
            const targetArray = pageContent[targetProp] || [];
            
            let newArray = [...targetArray];
            let changed = false;
            
            if (functionArgs.image_url && !isValidUrl(functionArgs.image_url)) {
              result = "Lỗi: Link hình ảnh không hợp lệ.";
            } else if (functionArgs.action === 'add') {
              newArray.push({
                name: functionArgs.item_name,
                price: functionArgs.price,
                original_price: functionArgs.original_price,
                description: functionArgs.description,
                image_url: functionArgs.image_url
              });
              changed = true;
              result = `Đã thêm ${functionArgs.item_name} thành công!`;
            } else if (functionArgs.action === 'update') {
              const index = newArray.findIndex((item: any) => item.name?.toLowerCase().includes(functionArgs.item_name.toLowerCase()));
              if (index >= 0) {
                newArray[index] = { 
                  ...newArray[index], 
                  price: functionArgs.price || newArray[index].price, 
                  original_price: functionArgs.original_price || newArray[index].original_price, 
                  description: functionArgs.description || newArray[index].description,
                  image_url: functionArgs.image_url || newArray[index].image_url
                };
                changed = true;
                result = `Đã sửa ${functionArgs.item_name} thành công!`;
              } else {
                result = `Không tìm thấy ${functionArgs.item_name} để sửa.`;
              }
            } else if (functionArgs.action === 'delete') {
              const prevLen = newArray.length;
              newArray = newArray.filter((item: any) => !item.name?.toLowerCase().includes(functionArgs.item_name.toLowerCase()));
              if (newArray.length < prevLen) {
                changed = true;
                result = `Đã xóa ${functionArgs.item_name} thành công!`;
              } else {
                result = `Không tìm thấy ${functionArgs.item_name} để xóa.`;
              }
            } else {
               result = "Lỗi: Hành động không hợp lệ. Chỉ chấp nhận 'add', 'update' hoặc 'delete'.";
            }

            if (changed) {
              pageContent[targetProp] = newArray;
              await supabase.from('businesses').update({ page_content: pageContent }).eq('id', business.id);
              isDataUpdated = true;
            }
          }
        }
        else if (functionName === "get_admin_links") {
           const telegramUrl = process.env.TELEGRAM_BOT_URL || "https://t.me/OneBeautyBot";
           const crmUrl = process.env.CRM_URL || "https://1beauty.asia/dashboard/leads";
           result = `Link Telegram: ${telegramUrl} \nLink CRM: ${crmUrl}`;
        }
        else if (functionName === "update_passcode") {
          if (!isAdmin) {
            result = "Lỗi: Bạn chưa xác thực quyền admin!";
          } else if (typeof functionArgs.new_passcode !== 'string' || functionArgs.new_passcode.length < 4) {
            result = "Lỗi: Mã bảo mật mới phải là văn bản và có ít nhất 4 ký tự.";
          } else {
            const { error } = await supabase
              .from('businesses')
              .update({ chatbot_passcode: functionArgs.new_passcode })
              .eq('id', business.id);

            if (error) {
              result = "Lỗi hệ thống khi cập nhật mã bảo mật.";
            } else {
              // Update local variable immediately so subsequent tools in this turn might use it if they check it
              business.chatbot_passcode = functionArgs.new_passcode;
              result = `Đã đổi mã bảo mật thành công sang: ${functionArgs.new_passcode}. Lần sau vui lòng dùng mã này để truy cập.`;
            }
          }
        }

        toolResponses.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: result,
        });
      }

      // Re-prompt DeepSeek with the tool results
      const finalResponse = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          ...allMessages,
          responseMessage,
          ...toolResponses
        ] as any
      });

      let usage = response.usage;
      if (finalResponse && finalResponse.usage) {
        usage = finalResponse.usage;
      }
      
      if (usage) {
        const { error: usageErr } = await supabase.from('api_usage_logs').insert({
          business_id: business.id,
          model: "deepseek-chat",
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens
        });
        if (usageErr) console.error("Failed to log API usage:", usageErr);
      }

      if (isDataUpdated) {
        revalidatePath('/[slug]', 'page');
      }

      let replyText = finalResponse.choices[0].message.content || '';
      if (replyText.includes('[CHOT_DON]')) {
        replyText = replyText.replace(/\[CHOT_DON\]/g, '').trim();
        const telegramChatId = business.page_content?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        const userMessages = messages.filter((m: any) => m.role === 'user' || m.role === 'assistant');
        const allUserTexts = userMessages.map((m: any) => m.content).join(' ');
        const userPhoneFound = extractPhone(allUserTexts);
        if (telegramChatId && userPhoneFound) {
          const msg = `🔥 [${platformStr} AI - CHỐT ĐƠN/ĐẶT LỊCH] 🔥\n\nTiệm: ${business.name}\nSĐT Khách: ${userPhoneFound}\nNội dung khách vừa nhắn: "${messages[messages.length - 1]?.content || ''}"\nAI đã phản hồi: "${replyText}"\n👉 Anh/Chị gọi điện xác nhận cho khách ngay nhé!`;
          await sendTelegramAsync(telegramChatId, msg, host);
        }
      }

      return NextResponse.json({
        reply: replyText,
        adminToken: newToken,
        dataUpdated: isDataUpdated
      });

    } else {
      if (response.usage) {
        const { error: usageErr } = await supabase.from('api_usage_logs').insert({
          business_id: business.id,
          model: "deepseek-chat",
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        });
        if (usageErr) console.error("Failed to log API usage:", usageErr);
      }

      let replyText = responseMessage.content || '';
      if (replyText.includes('[CHOT_DON]')) {
        replyText = replyText.replace(/\[CHOT_DON\]/g, '').trim();
        const telegramChatId = business.page_content?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        const userMessages = messages.filter((m: any) => m.role === 'user' || m.role === 'assistant');
        const allUserTexts = userMessages.map((m: any) => m.content).join(' ');
        const userPhoneFound = extractPhone(allUserTexts);
        if (telegramChatId && userPhoneFound) {
          const msg = `🔥 [${platformStr} AI - CHỐT ĐƠN/ĐẶT LỊCH] 🔥\n\nTiệm: ${business.name}\nSĐT Khách: ${userPhoneFound}\nNội dung khách vừa nhắn: "${messages[messages.length - 1]?.content || ''}"\nAI đã phản hồi: "${replyText}"\n👉 Anh/Chị gọi điện xác nhận cho khách ngay nhé!`;
          await sendTelegramAsync(telegramChatId, msg, host);
        }
      }

      return NextResponse.json({
        reply: replyText,
        adminToken: newToken,
        dataUpdated: false
      });
    }

  } catch (error: any) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
