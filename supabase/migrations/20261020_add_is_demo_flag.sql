-- Migration: 20261020_add_is_demo_flag.sql
-- Thêm cột is_demo để phân biệt dữ liệu mẫu (demo/seed) với dữ liệu nhà hàng thật đã xác minh

-- 1. Bổ sung cột is_demo vào bảng businesses
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Bổ sung cột is_demo vào bảng business_party_profiles
ALTER TABLE public.business_party_profiles
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Tạo index phục vụ truy vấn và lọc dữ liệu nhanh
CREATE INDEX IF NOT EXISTS idx_businesses_is_demo ON public.businesses (is_demo);
CREATE INDEX IF NOT EXISTS idx_bpp_is_demo ON public.business_party_profiles (is_demo);

-- 4. Đánh dấu các địa điểm tiệc và quán demo hiện có thành is_demo = true
UPDATE public.businesses
SET is_demo = TRUE
WHERE slug IN (
  'que-nha-thanh-thai',
  'que-nha-pham-ngoc-thach',
  'que-nha-nguyen-thai-binh',
  'the-golden-plate',
  'am-thuc-que-nha',
  'luxury-spa-demo',
  'san-the-thao',
  'gemma-fashion'
) OR slug LIKE 'test-biz-%';

UPDATE public.business_party_profiles
SET is_demo = TRUE
WHERE business_id IN (
  SELECT id FROM public.businesses WHERE is_demo = TRUE
);
