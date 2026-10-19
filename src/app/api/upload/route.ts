import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Supabase client với Service Role để đảm bảo quyền upload an toàn từ mọi thiết bị (Mobile/Desktop)
function getAdminStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createSupabaseJsClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB cho ảnh sảnh tiệc & menu chất lượng cao

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'media';
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn tập tin hình ảnh.' },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WEBP.' },
        { status: 400 }
      );
    }

    // Kiểm tra dung lượng
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh vượt quá giới hạn 10MB.' },
        { status: 400 }
      );
    }

    const supabase = getAdminStorageClient();

    // Đọc buffer file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Tạo tên tệp độc nhất
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `${folder}/${cleanName}`;

    // Upload vào Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '31536000', // 1 năm cache
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload API] Supabase storage error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Lỗi tải ảnh lên hệ thống: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Lấy Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanName,
    });
  } catch (error: any) {
    console.error('[Upload API] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý tệp ảnh.' },
      { status: 500 }
    );
  }
}
