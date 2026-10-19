import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Supabase client với Service Role để đảm bảo quyền upload an toàn từ mọi thiết bị (Mobile/Desktop)
function getAdminStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !serviceKey) {
    throw new Error('Supabase Storage chưa được cấu hình khóa truy cập.');
  }
  return createSupabaseJsClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const ALLOWED_BUCKETS = ['media'];

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB cho ảnh sảnh tiệc & menu chất lượng cao

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawBucket = (formData.get('bucket') as string) || 'media';
    const rawFolder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn tập tin hình ảnh.' },
        { status: 400 }
      );
    }

    // Kiểm tra bucket hợp lệ
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : 'media';

    // Làm sạch đường dẫn thư mục
    const folder = /^[a-zA-Z0-9_\-/]+$/.test(rawFolder) && !rawFolder.includes('..')
      ? rawFolder.replace(/^\/+/, '')
      : 'uploads';

    // Kiểm tra định dạng ảnh an toàn
    const mime = (file.type || '').toLowerCase();
    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      return NextResponse.json(
        { success: false, error: 'Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WEBP, GIF.' },
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

    // Tạo tên tệp độc nhất dựa trên extension chuẩn hoá từ MIME
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `${folder}/${cleanName}`;

    // Upload vào Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mime,
        cacheControl: '31536000', // 1 năm cache
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload API] Supabase storage error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Không thể lưu trữ ảnh trên máy chủ. Vui lòng thử lại sau.' },
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
  } catch (error: unknown) {
    console.error('[Upload API] Exception:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý tệp ảnh. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
