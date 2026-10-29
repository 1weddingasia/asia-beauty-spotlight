-- ══════════════════════════════════════════════════════════════
-- Bổ sung hỗ trợ Tên công ty / Gian hàng Đa Ngôn Ngữ:
-- Tiếng Việt khi chọn Tiếng Việt ('vi')
-- Tiếng Anh khi chọn các ngôn ngữ khác ('en', 'ko', 'zh')
-- Đánh dấu gian hàng mẫu deoproce-korea là is_demo = true
-- ══════════════════════════════════════════════════════════════

-- 1. Thêm các cột tên đa ngôn ngữ vào business_expo_profiles
ALTER TABLE public.business_expo_profiles 
  ADD COLUMN IF NOT EXISTS company_name_vi VARCHAR(255),
  ADD COLUMN IF NOT EXISTS company_name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS event_name_en VARCHAR(255);

-- 2. Cập nhật gian hàng mẫu deoproce-korea
UPDATE public.businesses
SET 
  is_demo = true,
  page_content = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(page_content, '{}'::jsonb),
        '{name_vi}',
        '"Mỹ Phẩm Deoproce Korea"'::jsonb
      ),
      '{name_en}',
      '"Deoproce Korea Cosmetics"'::jsonb
    ),
    '{description_en}',
    '"Leading premium Korean cosmetics brand, specializing in nourishing sheet masks, snail repair cream, and stem cell serums."'::jsonb
  )
WHERE slug = 'deoproce-korea';

UPDATE public.business_expo_profiles
SET 
  company_name_vi = 'Mỹ Phẩm Deoproce Korea',
  company_name_en = 'Deoproce Korea Cosmetics',
  event_name = 'Cosmobeauté Vietnam 2026',
  event_name_en = 'Cosmobeauté Vietnam 2026'
WHERE business_id = (SELECT id FROM public.businesses WHERE slug = 'deoproce-korea');
