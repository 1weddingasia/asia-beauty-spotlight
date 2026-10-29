import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, pin } = body;

    if (!slug || !pin) {
      return NextResponse.json({ error: 'Thiếu thông tin slug hoặc mã PIN' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Tìm doanh nghiệp theo slug
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, slug, phone, email, page_content, is_demo')
      .eq('slug', slug)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'Không tìm thấy gian hàng này' }, { status: 404 });
    }

    const normalizedBusiness = {
      ...business,
      logo_url: business.page_content?.logo_url || business.page_content?.logo || null,
    };

    // 2. Kiểm tra hồ sơ expo & PIN
    const { data: profile } = await supabase
      .from('business_expo_profiles')
      .select('*')
      .eq('business_id', business.id)
      .maybeSingle();

    // Nếu chưa có profile expo, tự động khởi tạo mặc định với PIN = 123456
    let expoProfile = profile;
    if (!expoProfile) {
      const { data: newProfile, error: createErr } = await supabase
        .from('business_expo_profiles')
        .insert({
          business_id: business.id,
          event_name: 'Hội Chợ Triển Lãm Quốc Tế',
          booth_number: 'B01',
          access_pin: '123456',
        })
        .select('*')
        .single();

      if (createErr || !newProfile) {
        return NextResponse.json({ error: 'Không thể khởi tạo hồ sơ triển lãm' }, { status: 500 });
      }
      expoProfile = newProfile;
    }

    // So sánh PIN (hỗ trợ PIN mặc định '123456' hoặc PIN từ CSDL)
    if (expoProfile.access_pin !== pin.trim()) {
      return NextResponse.json({ error: 'Mã PIN không đúng. Vui lòng thử lại!' }, { status: 401 });
    }

    // 3. Lấy danh sách leads
    const { data: leads, error: leadsErr } = await supabase
      .from('business_expo_leads')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (leadsErr) {
      return NextResponse.json({ error: 'Lỗi tải danh sách khách hàng' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      business: normalizedBusiness,
      expoProfile,
      leads: leads || [],
    });
  } catch (err: any) {
    console.error('[Expo CRM Route Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { slug, pin } = body;

    if (!slug || !pin) {
      return NextResponse.json({ error: 'Thiếu thông tin slug hoặc mã PIN' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: business } = await supabase
      .from('businesses')
      .select('id, slug, is_demo')
      .eq('slug', slug)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'Không tìm thấy gian hàng' }, { status: 404 });
    }

    // Bảo vệ an toàn: chỉ cho phép xóa các gian hàng demo mẫu để tránh xóa nhầm dữ liệu khách hàng thật
    if (!business.is_demo && slug !== 'deoproce-korea') {
      return NextResponse.json({ error: 'Chỉ cho phép xóa các gian hàng mẫu thử nghiệm (demo).' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('business_expo_profiles')
      .select('access_pin')
      .eq('business_id', business.id)
      .maybeSingle();

    if (profile?.access_pin !== pin.trim()) {
      return NextResponse.json({ error: 'Mã PIN không đúng' }, { status: 401 });
    }

    // Xóa leads, profile, và business
    await supabase.from('business_expo_leads').delete().eq('business_id', business.id);
    await supabase.from('business_expo_profiles').delete().eq('business_id', business.id);
    await supabase.from('businesses').delete().eq('id', business.id);

    return NextResponse.json({ success: true, message: 'Đã xóa gian hàng thành công' });
  } catch (err: any) {
    console.error('[Delete Expo Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xóa gian hàng' }, { status: 500 });
  }
}

const ChangePinSchema = z.object({
  slug: z.string().trim().min(1, 'Thiếu thông tin gian hàng').max(200),
  oldPin: z.string().trim().min(1, 'Vui lòng nhập mã PIN hiện tại (pass cũ)').max(10),
  newPin: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,10}$/, 'Mã PIN mới phải từ 4 đến 10 ký tự chữ hoặc số'),
});

// Rate limiting theo IP và slug (tối đa 5 lần thử/phút để chống brute-force)
const PIN_RATE_LIMIT_MAX_ENTRIES = 300;
const pinAttemptCounts = new Map<string, { count: number; resetAt: number }>();

function cleanupPinRateLimits(now: number): void {
  // 1. Dọn dẹp tất cả các key đã hết hạn
  for (const [k, v] of pinAttemptCounts.entries()) {
    if (v.resetAt < now) pinAttemptCounts.delete(k);
  }
  // 2. Nếu vẫn chạm hoặc vượt quá dung lượng tối đa, loại bỏ key cũ nhất theo FIFO
  while (pinAttemptCounts.size >= PIN_RATE_LIMIT_MAX_ENTRIES) {
    const oldestKey = pinAttemptCounts.keys().next().value;
    if (!oldestKey) break;
    pinAttemptCounts.delete(oldestKey);
  }
}

function checkPinRateLimit(key: string): boolean {
  const now = Date.now();
  if (pinAttemptCounts.size >= PIN_RATE_LIMIT_MAX_ENTRIES) {
    cleanupPinRateLimits(now);
  }

  const record = pinAttemptCounts.get(key);
  if (!record || record.resetAt < now) {
    pinAttemptCounts.set(key, { count: 1, resetAt: now + 60 * 1000 });
    return false;
  }
  if (record.count >= 5) {
    return true;
  }
  record.count += 1;
  return false;
}

export async function PATCH(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const body = await req.json();

    const parsed = ChangePinSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { slug, oldPin: trimmedOld, newPin: trimmedNew } = parsed.data;

    // Chặn brute-force PIN
    const rateLimitKey = `${ip}:${slug}`;
    if (checkPinRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Bạn đã thử đổi mã PIN quá nhiều lần. Vui lòng đợi 1 phút.' },
        { status: 429 }
      );
    }

    if (trimmedOld === trimmedNew) {
      return NextResponse.json(
        { error: 'Mã PIN mới phải khác mã PIN cũ hiện tại' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // 1. Tìm gian hàng theo slug
    const { data: business, error: businessErr } = await supabase
      .from('businesses')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (businessErr) {
      console.error('[Change PIN Lookup Business Error]:', businessErr);
      return NextResponse.json({ error: 'Lỗi tra cứu gian hàng' }, { status: 500 });
    }

    if (!business) {
      return NextResponse.json({ error: 'Không tìm thấy gian hàng này' }, { status: 404 });
    }

    // 2. Tìm hồ sơ expo & kiểm tra PIN cũ
    const { data: profile, error: profileErr } = await supabase
      .from('business_expo_profiles')
      .select('id, access_pin')
      .eq('business_id', business.id)
      .maybeSingle();

    if (profileErr) {
      console.error('[Change PIN Load Profile Error]:', profileErr);
      return NextResponse.json({ error: 'Lỗi tải hồ sơ gian hàng' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ gian hàng' }, { status: 404 });
    }

    if (profile.access_pin !== trimmedOld) {
      return NextResponse.json(
        { error: 'Mã PIN cũ không chính xác. Vui lòng kiểm tra lại!' },
        { status: 401 }
      );
    }

    // 3. Cập nhật mã PIN mới vào CSDL
    const { error: updateErr } = await supabase
      .from('business_expo_profiles')
      .update({
        access_pin: trimmedNew,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateErr) {
      console.error('[Update Expo PIN Error]:', updateErr);
      return NextResponse.json({ error: 'Lỗi cập nhật mã PIN vào hệ thống' }, { status: 500 });
    }

    // Xóa bộ đếm rate limit sau khi đổi PIN thành công
    pinAttemptCounts.delete(rateLimitKey);

    return NextResponse.json({
      success: true,
      message: 'Đổi mã PIN quản trị CRM thành công!',
    });
  } catch (err: unknown) {
    console.error('[Change PIN API Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi đổi mã PIN' }, { status: 500 });
  }
}
