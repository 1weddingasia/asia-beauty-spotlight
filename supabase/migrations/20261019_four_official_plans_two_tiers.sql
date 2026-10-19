-- Migration: 20261019_four_official_plans_two_tiers.sql
-- Cập nhật chuẩn hóa 4 gói thành viên phân theo 2 loại trang độc lập:
-- Dòng 1: Gói Trang Ưu Đãi (Chuẩn 500k/năm & VIP Chìa Khóa Trao Tay 1.5tr/năm)
-- Dòng 2: Gói Trang Đặt Tiệc (Chuẩn 500k/năm & VIP Neon Phát Sáng 700k/năm)

-- 1. Bổ sung các cột phân loại vào bảng plans nếu chưa có
ALTER TABLE plans ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_type TEXT; -- 'deal' | 'party'
ALTER TABLE plans ADD COLUMN IF NOT EXISTS tier TEXT; -- 'standard' | 'vip'

CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_code ON plans (code);

-- 2. Tắt các gói cũ không còn áp dụng
UPDATE plans SET is_active = false WHERE code IS NULL OR code NOT IN ('udai_standard', 'udai_vip', 'tiec_standard', 'tiec_vip');

-- 3. Upsert 4 gói thành viên chính thức
-- 3.1. Gói Trang Ưu Đãi (Chuẩn) - 500.000đ/năm
INSERT INTO plans (code, name, plan_type, tier, description, price_monthly, price_yearly, is_active, features)
VALUES (
  'udai_standard',
  'Gói Trang Ưu Đãi (Chuẩn)',
  'deal',
  'standard',
  'Kích hoạt Trang Gian Hàng Số & Ưu Đãi chính trong vòng 1 năm.',
  50000,
  500000,
  true,
  '["Kích hoạt trang ưu đãi chính (1booking.asia/ten-tiem) 1 năm", "Đăng tải deal ưu đãi & chương trình giảm giá không giới hạn", "Tiếp nhận thông tin đặt hẹn và liên hệ từ khách hàng trực tuyến"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  is_active = true,
  features = EXCLUDED.features;

-- 3.2. Gói Trang Ưu Đãi (VIP - Chìa Khóa Trao Tay) - 1.500.000đ/năm
INSERT INTO plans (code, name, plan_type, tier, description, price_monthly, price_yearly, is_active, features)
VALUES (
  'udai_vip',
  'Gói Trang Ưu Đãi (VIP - Chìa Khóa Trao Tay)',
  'deal',
  'vip',
  'Toàn bộ quyền lợi gói chuẩn + Đội ngũ hỗ trợ setup toàn bộ trang vận hành và chuông Telegram.',
  150000,
  1500000,
  true,
  '["Trọn bộ quyền lợi Gói Trang Ưu Đãi Chuẩn 1 năm", "Đội ngũ chuyên viên hỗ trợ setup toàn bộ trang vận hành từ nội dung đến hình ảnh", "Kích hoạt và kết nối chuông thông báo Telegram nhận khách tự động"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  is_active = true,
  features = EXCLUDED.features;

-- 3.3. Gói Trang Đặt Tiệc (Chuẩn) - 500.000đ/năm
INSERT INTO plans (code, name, plan_type, tier, description, price_monthly, price_yearly, is_active, features)
VALUES (
  'tiec_standard',
  'Gói Trang Đặt Tiệc (Chuẩn)',
  'party',
  'standard',
  'Kích hoạt Trang Sảnh Tiệc riêng biệt trong vòng 1 năm, đón khách đoàn & tiệc tất niên.',
  50000,
  500000,
  true,
  '["Kích hoạt trang sảnh tiệc riêng (1booking.asia/ten-tiem/tiec) 1 năm", "Hiển thị vị trí trên Bản Đồ Phố Tiệc & Danh Sách Địa Điểm", "Tiếp nhận đơn đặt bàn tiệc đoàn và khách công ty trực tiếp"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  is_active = true,
  features = EXCLUDED.features;

-- 3.4. Gói Trang Đặt Tiệc (VIP Neon) - 700.000đ/năm
INSERT INTO plans (code, name, plan_type, tier, description, price_monthly, price_yearly, is_active, features)
VALUES (
  'tiec_vip',
  'Gói Trang Đặt Tiệc (VIP Neon)',
  'party',
  'vip',
  'Kích hoạt Trang Sảnh Tiệc 1 năm + Đèn Neon phát sáng nổi bật trên logo trên bản đồ tiệc.',
  70000,
  700000,
  true,
  '["Trọn bộ quyền lợi Gói Trang Đặt Tiệc Chuẩn 1 năm", "Chức năng đèn Neon phát sáng nổi bật trên logo trên Bản Đồ Phố Tiệc", "Ưu tiên hiển thị vị trí hàng đầu thu hút khách đặt tiệc tất niên"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  is_active = true,
  features = EXCLUDED.features;
