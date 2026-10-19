-- Migration: 20261019_party_images.sql
-- Bổ sung trường hình ảnh cho hồ sơ tiệc tất niên (Party Banner & Gallery)

ALTER TABLE public.business_party_profiles 
ADD COLUMN IF NOT EXISTS party_banner_url TEXT;

ALTER TABLE public.business_party_profiles 
ADD COLUMN IF NOT EXISTS party_gallery TEXT[] DEFAULT '{}';
