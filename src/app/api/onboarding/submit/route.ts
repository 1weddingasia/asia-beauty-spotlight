import { NextRequest, NextResponse } from 'next/server';
import { processOnboardingSubmission, OnboardingInput } from '@/lib/services/ai-onboarding';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OnboardingInput;

    if (!body || !body.type || !body.brandName || !body.email || !body.phone || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Tên thương hiệu, Email, Số điện thoại, Địa chỉ).' },
        { status: 400 }
      );
    }

    if (body.type !== 'deal' && body.type !== 'party') {
      return NextResponse.json(
        { success: false, error: 'Loại hồ sơ không hợp lệ (chỉ chấp nhận "deal" hoặc "party").' },
        { status: 400 }
      );
    }

    if (body.type === 'deal' && !(body as any).mainDeal?.title) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp tiêu đề chương trình ưu đãi chính.' },
        { status: 400 }
      );
    }

    if (body.type === 'party' && !(body as any).partyDealHighlight) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp gói ưu đãi tiệc tâm điểm.' },
        { status: 400 }
      );
    }

    // Helper validate URL an toàn
    const isValidHttpUrl = (urlStr?: string) => {
      if (!urlStr) return true;
      try {
        const parsed = new URL(urlStr);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    if (!isValidHttpUrl(body.website)) {
      return NextResponse.json(
        { success: false, error: 'Link Website không hợp lệ (phải bắt đầu bằng http:// hoặc https://).' },
        { status: 400 }
      );
    }

    if (body.type === 'party' && !isValidHttpUrl((body as any).menuDriveUrl)) {
      return NextResponse.json(
        { success: false, error: 'Link Menu Google Drive / PDF không hợp lệ (phải bắt đầu bằng http:// hoặc https://).' },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải từ 6 ký tự trở lên để tạo tài khoản quản trị.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Địa chỉ Email không hợp lệ.' },
        { status: 400 }
      );
    }

    // Phone validation
    const phoneClean = body.phone.replace(/[\s\-\.]/g, '');
    if (phoneClean.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ.' },
        { status: 400 }
      );
    }

    const result = await processOnboardingSubmission(body);

    return NextResponse.json({
      message: 'Đã gửi thông tin và khởi tạo tài khoản thành công!',
      ...result,
    });
  } catch (error: any) {
    console.error('[Onboarding Submit API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Đã xảy ra lỗi trong quá trình xử lý hồ sơ. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
