import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

// A simple in-memory session or just use the claim_token as the adminToken for simplicity.
// For production, a real JWT or session should be used.
export async function POST(req: Request) {
  try {
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

    const isAdmin = (adminToken === business.claim_token && business.claim_token != null) || (adminToken === '123456');

    // Build the system prompt
    let systemPrompt = `Bạn là Trợ lý AI thông minh của nền tảng 1Booking / 1Beauty. Bạn đang hỗ trợ cho cơ sở ${business.name}.
Thông tin tiệm: SĐT ${business.phone || 'không có'}, Địa chỉ ${business.address || 'không có'}.
`;

    if (isAdmin) {
      systemPrompt += `\nQUAN TRỌNG: NGƯỜI DÙNG HIỆN TẠI LÀ QUẢN TRỊ VIÊN (CHỦ TIỆM) ĐÃ XÁC THỰC THÀNH CÔNG.
Bạn CÓ QUYỀN VÀ BẮT BUỘC PHẢI gọi các Tool (update_business_info, update_services_or_deals) khi họ yêu cầu thêm/sửa/xóa thông tin hoặc giá dịch vụ. KHÔNG ĐƯỢC yêu cầu mật khẩu nữa vì họ đã xác thực rồi.`;
    } else {
      systemPrompt += `\nNếu người dùng là khách: Hỗ trợ thân thiện, ngắn gọn.
Nếu người dùng muốn chỉnh sửa trang/đổi giá: Lịch sự yêu cầu họ cung cấp Mật khẩu/Passcode (hoặc Claim Token) của tiệm để bật chế độ Quản trị. Đừng gọi hàm sửa nếu chưa có passcode.`;
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
              description: { type: "string" }
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
              description: { type: "string", description: "Mô tả ngắn gọn" }
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
        const toolCall: any = tCall;
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let result = "";

        if (functionName === "authenticate_owner") {
          if (functionArgs.passcode === business.claim_token || functionArgs.passcode === '123456') { // Fallback pass for demo
            newToken = business.claim_token || '123456';
            result = "Xác thực thành công! Bạn đã vào chế độ Quản Trị. Bạn có thể sử dụng các lệnh sửa đổi ngay bây giờ.";
          } else {
            result = "Sai mật khẩu hoặc Claim Token.";
          }
        } 
        else if (functionName === "update_business_info") {
          if (!isAdmin && newToken !== (business.claim_token || '123456')) {
            result = "Lỗi: Bạn chưa xác thực quyền admin!";
          } else {
            const updates: any = {};
            if (functionArgs.name) updates.name = functionArgs.name;
            if (functionArgs.phone) updates.phone = functionArgs.phone;
            if (functionArgs.address) updates.address = functionArgs.address;
            if (functionArgs.description) updates.description = functionArgs.description;
            
            await supabase.from('businesses').update(updates).eq('id', business.id);
            isDataUpdated = true;
            result = "Đã cập nhật thông tin cơ bản thành công!";
          }
        }
        else if (functionName === "update_services_or_deals") {
          if (!isAdmin && newToken !== (business.claim_token || '123456')) {
            result = "Lỗi: Bạn chưa xác thực quyền admin!";
          } else {
            const pageContent = business.page_content || {};
            const targetArray = pageContent[functionArgs.target] || [];
            
            let newArray = [...targetArray];
            
            if (functionArgs.action === 'add') {
              newArray.push({
                name: functionArgs.item_name,
                price: functionArgs.price,
                original_price: functionArgs.original_price,
                description: functionArgs.description
              });
              result = `Đã thêm ${functionArgs.item_name} thành công!`;
            } else if (functionArgs.action === 'update') {
              const index = newArray.findIndex((item: any) => item.name?.toLowerCase().includes(functionArgs.item_name.toLowerCase()));
              if (index >= 0) {
                newArray[index] = { ...newArray[index], price: functionArgs.price || newArray[index].price, original_price: functionArgs.original_price || newArray[index].original_price, description: functionArgs.description || newArray[index].description };
                result = `Đã sửa ${functionArgs.item_name} thành công!`;
              } else {
                result = `Không tìm thấy ${functionArgs.item_name} để sửa.`;
              }
            } else if (functionArgs.action === 'delete') {
              newArray = newArray.filter((item: any) => !item.name?.toLowerCase().includes(functionArgs.item_name.toLowerCase()));
              result = `Đã xóa ${functionArgs.item_name} thành công!`;
            }

            pageContent[functionArgs.target] = newArray;
            await supabase.from('businesses').update({ page_content: pageContent }).eq('id', business.id);
            isDataUpdated = true;
          }
        }
        else if (functionName === "get_admin_links") {
           result = "Link Telegram: https://t.me/OneBeautyBot \nLink CRM: https://1beauty.asia/dashboard/leads";
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

      if (isDataUpdated) {
        revalidatePath(`/uu-dai/[slug]`);
      }

      return NextResponse.json({
        reply: finalResponse.choices[0].message.content,
        adminToken: newToken,
        dataUpdated: isDataUpdated
      });

    } else {
      return NextResponse.json({
        reply: responseMessage.content,
        adminToken: newToken,
        dataUpdated: false
      });
    }

  } catch (error: any) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
