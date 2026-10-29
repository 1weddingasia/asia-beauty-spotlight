-- ══════════════════════════════════════════════════════════════
-- 1BOOKING EXPO PASS MIGRATION
-- Thêm gói cước Expo Pass (300k sự kiện / 600k cả năm)
-- Bảng hồ sơ gian hàng (business_expo_profiles)
-- Bảng lưu trữ Lead triển lãm (business_expo_leads)
-- ══════════════════════════════════════════════════════════════

-- 1. Bổ sung gói cước mới vào bảng plans
INSERT INTO public.plans (code, name, plan_type, tier, price_yearly, features, is_active)
VALUES 
  ('expo_pass_event', '1Booking Expo Pass (Sự Kiện 30 Ngày)', 'expo', 'standard', 300000, 
   '{"duration_days": 30, "max_leads": "unlimited", "languages": ["vi","en","ko","zh"], "export_excel": true, "realtime_crm": true}', true),
  ('expo_pass_yearly', '1Booking Expo Pass (Toàn Niên 365 Ngày)', 'expo', 'vip', 600000, 
   '{"duration_days": 365, "max_leads": "unlimited", "languages": ["vi","en","ko","zh"], "export_excel": true, "realtime_crm": true}', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Hồ sơ gian hàng triển lãm (business_expo_profiles)
CREATE TABLE IF NOT EXISTS public.business_expo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL DEFAULT 'Triển Lãm Quốc Tế',
  booth_number VARCHAR(50) DEFAULT 'A1',
  access_pin VARCHAR(10) NOT NULL DEFAULT '123456',
  languages_enabled JSONB DEFAULT '["vi", "en", "ko", "zh"]'::jsonb,
  default_language VARCHAR(5) DEFAULT 'vi',
  lead_gift_title JSONB DEFAULT '{"vi":"Nhận Catalogue & Ưu Đãi Gian Hàng","en":"Get Catalogue & Booth Offers","ko":"카탈로그 및 부스 혜택 받기","zh":"获取产品目录与展位优惠"}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_expo_business UNIQUE (business_id)
);

-- 3. Bảng lưu trữ Lead triển lãm (business_expo_leads)
CREATE TABLE IF NOT EXISTS public.business_expo_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(25) NOT NULL,
  customer_email VARCHAR(150),
  company_name VARCHAR(150),
  interests TEXT,
  notes TEXT,
  preferred_lang VARCHAR(10) DEFAULT 'vi',
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index tăng tốc truy vấn Realtime CRM và bảo mật
CREATE INDEX IF NOT EXISTS idx_expo_leads_biz_date ON public.business_expo_leads (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expo_profile_biz ON public.business_expo_profiles (business_id);

-- RLS Policies
ALTER TABLE public.business_expo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expo_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Profiles: Cho phép đọc công khai (để khách xem thông tin gian hàng)
  DROP POLICY IF EXISTS "Public can view active expo profiles" ON public.business_expo_profiles;
  CREATE POLICY "Public can view active expo profiles" ON public.business_expo_profiles
    FOR SELECT USING (is_active = true);

  -- Leads: Cho phép public insert (khách điền form ngoài quầy)
  DROP POLICY IF EXISTS "Public can insert expo leads" ON public.business_expo_leads;
  CREATE POLICY "Public can insert expo leads" ON public.business_expo_leads
    FOR INSERT WITH CHECK (true);

  -- Service role có toàn quyền
  DROP POLICY IF EXISTS "Service role full access expo profiles" ON public.business_expo_profiles;
  CREATE POLICY "Service role full access expo profiles" ON public.business_expo_profiles
    FOR ALL USING (true);

  DROP POLICY IF EXISTS "Service role full access expo leads" ON public.business_expo_leads;
  CREATE POLICY "Service role full access expo leads" ON public.business_expo_leads
    FOR ALL USING (true);
END $$;

-- Bật Realtime trên business_expo_leads để kích hoạt chuông Ting-Ting
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.business_expo_leads;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
