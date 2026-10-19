-- Migration: 20261020_party_dynamic_specs.sql
-- Thêm các cột cho phép nhà hàng lưu trữ quy cách sảnh tiệc và chính sách tùy chỉnh động

ALTER TABLE public.business_party_profiles 
ADD COLUMN IF NOT EXISTS party_halls JSONB NOT NULL DEFAULT '[]';

ALTER TABLE public.business_party_profiles 
ADD COLUMN IF NOT EXISTS party_specifications JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.business_party_profiles.party_halls IS 'Danh sách các sảnh tiệc và phòng VIP với tên, sức chứa, trang thiết bị';
COMMENT ON COLUMN public.business_party_profiles.party_specifications IS 'Bảng quy cách và chính sách dịch vụ tùy chỉnh (đặt cọc, mang đồ uống, âm thanh...)';
