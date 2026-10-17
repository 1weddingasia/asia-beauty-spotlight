-- Migration: 20261017_business_party_profiles.sql
-- Bảng lưu trữ hồ sơ nhận tiệc Tất Niên & Year-End Party cho các nhà hàng F&B

CREATE TABLE IF NOT EXISTS public.business_party_profiles (
  -- Liên kết 1-1 với bảng businesses hiện tại
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- === NHÓM 1: Quy mô & Sức chứa (dùng cho lọc số học) ===
  min_guests    INT NOT NULL DEFAULT 10,   -- Sức chứa tối thiểu
  max_guests    INT NOT NULL DEFAULT 200,  -- Sức chứa tối đa
  num_vip_rooms INT NOT NULL DEFAULT 0,    -- Số phòng VIP riêng
  
  -- === NHÓM 2: Ngân sách (VNĐ/người, dùng cho lọc range) ===
  price_min INT NOT NULL,  -- VD: 250000
  price_max INT NOT NULL,  -- VD: 600000
  
  -- === NHÓM 3: Không gian & Tiện ích (mảng tags chuẩn hóa) ===
  -- 'phong_vip' | 'ngoai_troi' | 'rooftop' | 'sanh_lon' | 'san_khau' | 'karaoke' | 'man_chieu_led'
  spaces_and_amenities TEXT[] NOT NULL DEFAULT '{}',
  
  -- === NHÓM 4: Phong cách ẩm thực (mảng tags chuẩn hóa) ===
  -- 'viet_truyen_thong' | 'hai_san' | 'lau_nuong' | 'bia_thu_cong' | 'mon_hoa' | 'mon_au_steak' | 'chay_thanh_dam'
  cuisines TEXT[] NOT NULL DEFAULT '{}',
  
  -- === NHÓM 5: Ưu đãi tiệc (mảng tags chuẩn hóa) ===
  -- 'free_karaoke' | 'free_backdrop' | 'tang_bia' | 'giam_gia_menu' | 'free_gui_xe' | 'cho_mang_ruou_vao'
  party_perks TEXT[] NOT NULL DEFAULT '{}',
  
  -- === NHÓM 6: Mô tả & Set menu ===
  party_description TEXT,   -- Mô tả chi tiết không gian, nổi bật
  party_deal_highlight TEXT, -- Dòng ưu đãi hiển thị trên map pin (VD: "Tặng bia + âm thanh")
  
  -- Set menu dạng JSONB: [{ "name": "Set Lộc Phát", "price": 3200000, "pax": 10 }]
  set_menus JSONB NOT NULL DEFAULT '[]',
  
  -- === Meta ===
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  is_vip      BOOLEAN NOT NULL DEFAULT FALSE,  -- Hiển thị hiệu ứng đặc biệt trên map
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes cho query lọc siêu tốc
CREATE INDEX IF NOT EXISTS idx_bpp_capacity ON public.business_party_profiles (min_guests, max_guests);
CREATE INDEX IF NOT EXISTS idx_bpp_price    ON public.business_party_profiles (price_min, price_max);
CREATE INDEX IF NOT EXISTS idx_bpp_spaces   ON public.business_party_profiles USING GIN (spaces_and_amenities);
CREATE INDEX IF NOT EXISTS idx_bpp_cuisines ON public.business_party_profiles USING GIN (cuisines);
CREATE INDEX IF NOT EXISTS idx_bpp_active   ON public.business_party_profiles (is_active);

-- Enable RLS
ALTER TABLE public.business_party_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Ai cũng đọc được các quán đang kích hoạt tiệc (public landing page)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_party_profiles' AND policyname = 'Public read party profiles'
  ) THEN
    CREATE POLICY "Public read party profiles"
      ON public.business_party_profiles FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- Policy 2: Authenticated users và service_role quản lý hồ sơ tiệc
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_party_profiles' AND policyname = 'Admin manage party profiles'
  ) THEN
    CREATE POLICY "Admin manage party profiles"
      ON public.business_party_profiles FOR ALL
      USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
  END IF;
END $$;
