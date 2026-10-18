-- Migration: 20261018_official_membership_plans.sql
-- Thêm/Cập nhật 2 gói thành viên chuẩn:
-- 1. Gói Trang Ưu Đãi: 1.500.000 VNĐ/năm
-- 2. Gói Trang Đặt Tiệc: 500.000 VNĐ/năm

DO $$
BEGIN
  -- Upsert Gói Trang Ưu Đãi
  IF EXISTS (SELECT 1 FROM plans WHERE name = 'Gói Trang Ưu Đãi') THEN
    UPDATE plans
    SET description = 'Gian hàng số & trang ưu đãi thương hiệu hiển thị quanh năm theo giao diện chuẩn của nền tảng 1Booking.asia, chạy deal giảm giá, đón khách đặt hẹn.',
        price_monthly = 150000,
        price_yearly = 1500000,
        is_active = true,
        features = '["Trang Gian Hàng Số Chuyên Nghiệp (1booking.asia/slug)", "Giao diện chuẩn sang trọng toàn nền tảng", "Đăng tải không giới hạn ưu đãi & deal giảm giá", "Hệ thống đặt hẹn & thông báo khách hàng tức thì", "Tối ưu SEO Google địa phương & danh bạ dịch vụ", "Hỗ trợ kỹ thuật và chăm sóc gian hàng cả năm"]'::jsonb
    WHERE name = 'Gói Trang Ưu Đãi';
  ELSE
    INSERT INTO plans (name, description, price_monthly, price_yearly, is_active, features)
    VALUES (
      'Gói Trang Ưu Đãi',
      'Gian hàng số & trang ưu đãi thương hiệu hiển thị quanh năm theo giao diện chuẩn của nền tảng 1Booking.asia, chạy deal giảm giá, đón khách đặt hẹn.',
      150000,
      1500000,
      true,
      '["Trang Gian Hàng Số Chuyên Nghiệp (1booking.asia/slug)", "Giao diện chuẩn sang trọng toàn nền tảng", "Đăng tải không giới hạn ưu đãi & deal giảm giá", "Hệ thống đặt hẹn & thông báo khách hàng tức thì", "Tối ưu SEO Google địa phương & danh bạ dịch vụ", "Hỗ trợ kỹ thuật và chăm sóc gian hàng cả năm"]'::jsonb
    );
  END IF;

  -- Upsert Gói Trang Đặt Tiệc
  IF EXISTS (SELECT 1 FROM plans WHERE name = 'Gói Trang Đặt Tiệc') THEN
    UPDATE plans
    SET description = 'Kích hoạt Trang Sảnh Tiệc riêng biệt phong cách xanh dương tối, ghim phát sáng neon trên Bản Đồ Phố Tiệc 2026, nhận khách tiệc công ty tự động qua chuông Telegram.',
        price_monthly = 50000,
        price_yearly = 500000,
        is_active = true,
        features = '["Kích hoạt Trang Sảnh Tiệc Chuyên Biệt phong cách Xanh Dương Tối", "Ghim phát sáng Neon trên Bản Đồ Phố Tiệc Tất Niên 2026", "Đăng tải thực đơn set menu 10 người, sức chứa & phòng VIP", "Nổ chuông Telegram tức thì ngay khi có khách công ty đặt tiệc", "Tích hợp nút Đặt Bàn Tiệc & Giữ Chỗ VIP 1-chạm", "Hỗ trợ chăm sóc gian hàng mùa tiệc 24/7"]'::jsonb
    WHERE name = 'Gói Trang Đặt Tiệc';
  ELSE
    INSERT INTO plans (name, description, price_monthly, price_yearly, is_active, features)
    VALUES (
      'Gói Trang Đặt Tiệc',
      'Kích hoạt Trang Sảnh Tiệc riêng biệt phong cách xanh dương tối, ghim phát sáng neon trên Bản Đồ Phố Tiệc 2026, nhận khách tiệc công ty tự động qua chuông Telegram.',
      50000,
      500000,
      true,
      '["Kích hoạt Trang Sảnh Tiệc Chuyên Biệt phong cách Xanh Dương Tối", "Ghim phát sáng Neon trên Bản Đồ Phố Tiệc Tất Niên 2026", "Đăng tải thực đơn set menu 10 người, sức chứa & phòng VIP", "Nổ chuông Telegram tức thì ngay khi có khách công ty đặt tiệc", "Tích hợp nút Đặt Bàn Tiệc & Giữ Chỗ VIP 1-chạm", "Hỗ trợ chăm sóc gian hàng mùa tiệc 24/7"]'::jsonb
    );
  END IF;
END $$;
