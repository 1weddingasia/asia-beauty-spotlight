-- HƯỚNG DẪN: 
-- Hãy copy toàn bộ đoạn mã SQL này và dán vào phần "SQL Editor" trên bảng điều khiển Supabase của bạn, sau đó nhấn RUN.

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Thêm cột category_id vào bảng blogs để liên kết với danh mục
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL;

-- (Tùy chọn) Bật RLS nếu muốn chặn truy cập tự do, nhưng tạm thời bỏ qua để admin quản lý dễ dàng
-- ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
