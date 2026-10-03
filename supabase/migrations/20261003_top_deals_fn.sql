-- Migration: create function to aggregate top deals server-side
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
CREATE OR REPLACE FUNCTION get_top_deals_for_business(p_business_id uuid, p_limit int DEFAULT 3)
RETURNS TABLE(deal_name text, lead_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(deal_name, 'Khac') AS deal_name,
    COUNT(*) AS lead_count
  FROM business_leads
  WHERE business_id = p_business_id
  GROUP BY 1
  ORDER BY lead_count DESC
  LIMIT p_limit;
$$;
