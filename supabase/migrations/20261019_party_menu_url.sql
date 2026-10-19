-- Migration: 20261019_party_menu_url.sql
-- Thêm cột party_menu_url để nhà hàng dán link Google Drive thực đơn tiệc chi tiết

ALTER TABLE public.business_party_profiles
ADD COLUMN IF NOT EXISTS party_menu_url TEXT;
