-- ========================================================
-- Migration: Enhance directory_categories & directory_locations
-- Add description, hero_image, icon for public listing pages
-- Also ensure junction tables exist with proper constraints
-- Date: 2026-10-13
-- ========================================================

-- 1. Add columns to directory_categories if missing
ALTER TABLE public.directory_categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS hero_image TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Add columns to directory_locations if missing
ALTER TABLE public.directory_locations
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS hero_image TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 3. Ensure junction table business_categories exists
CREATE TABLE IF NOT EXISTS public.business_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.directory_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, category_id)
);

-- 4. Ensure junction table business_locations exists
CREATE TABLE IF NOT EXISTS public.business_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.directory_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, location_id)
);

-- 5. Enable RLS on junction tables
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;

-- 6. Public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_categories' AND policyname = 'Public read business_categories'
  ) THEN
    CREATE POLICY "Public read business_categories" ON public.business_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_locations' AND policyname = 'Public read business_locations'
  ) THEN
    CREATE POLICY "Public read business_locations" ON public.business_locations FOR SELECT USING (true);
  END IF;
END $$;

-- 7. Enable RLS on directory tables (idempotent)
ALTER TABLE public.directory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'directory_categories' AND policyname = 'Public read directory_categories'
  ) THEN
    CREATE POLICY "Public read directory_categories" ON public.directory_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'directory_locations' AND policyname = 'Public read directory_locations'
  ) THEN
    CREATE POLICY "Public read directory_locations" ON public.directory_locations FOR SELECT USING (true);
  END IF;
END $$;

-- 8. Performance indexes
CREATE INDEX IF NOT EXISTS idx_business_categories_category_id ON public.business_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_business_categories_business_id ON public.business_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_location_id ON public.business_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON public.business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
