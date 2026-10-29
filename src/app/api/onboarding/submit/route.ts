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

    if (body.type === 'deal') {
      const hasMainDeal = typeof (body as any).mainDeal?.title === 'string' && (body as any).mainDeal.title.trim().length > 0;
      const hasDealsArray = Array.isArray((body as any).deals) && (body as any).deals.some((d: any) => typeof d?.title === 'string' && d.title.trim().length > 0);
      if (!hasMainDeal && !hasDealsArray) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng cung cấp ít nhất một tiêu đề chương trình ưu đãi.' },
          { status: 400 }
        );
      }
    }

    if (body.type === 'party') {
      const hasPartyHighlight = typeof (body as any).partyDealHighlight === 'string' && (body as any).partyDealHighlight.trim().length > 0;
      const hasPartyDealsArray = Array.isArray((body as any).partyDeals) && (body as any).partyDeals.some((d: any) => typeof d?.title === 'string' && d.title.trim().length > 0);
      if (!hasPartyHighlight && !hasPartyDealsArray) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng cung cấp ít nhất một gói ưu đãi tiệc.' },
          { status: 400 }
        );
      }
    }

    // Helper whitelist và giới hạn độ dài chuỗi để bảo vệ an toàn CSDL
    const sanitizeDealList = (list: unknown) =>
      Array.isArray(list)
        ? list.slice(0, 10).map((d: any) => ({
            id: typeof d?.id === 'string' ? d.id.slice(0, 100) : undefined,
            title: typeof d?.title === 'string' ? d.title.trim().slice(0, 255) : '',
            promoPrice: typeof d?.promoPrice === 'string' ? d.promoPrice.trim().slice(0, 100) : undefined,
            originalPrice: typeof d?.originalPrice === 'string' ? d.originalPrice.trim().slice(0, 100) : undefined,
            note: typeof d?.note === 'string' ? d.note.trim().slice(0, 500) : undefined,
            badge: typeof d?.badge === 'string' ? d.badge.trim().slice(0, 50) : undefined,
          }))
        : undefined;

    if (Array.isArray((body as any).deals)) {
      (body as any).deals = sanitizeDealList((body as any).deals);
    }

    if (Array.isArray((body as any).partyDeals)) {
      (body as any).partyDeals = sanitizeDealList((body as any).partyDeals);
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
