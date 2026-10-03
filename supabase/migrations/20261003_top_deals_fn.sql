-- Migration: create function to aggregate top deals server-side
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE OR REPLACE FUNCTION get_top_deals_for_business(p_business_id uuid, p_limit int DEFAULT 3)
RETURNS TABLE(deal_name text, lead_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kiểm tra quyền sở hữu, raise exception rõ ràng thay vì trả về tập rỗng
  IF NOT EXISTS (
    SELECT 1 FROM businesses
    WHERE id = p_business_id
      AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_owner' USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(NULLIF(bl.deal_name, ''), 'Khác') AS deal_name,
    COUNT(*) AS lead_count
  FROM business_leads bl
  WHERE bl.business_id = p_business_id
  GROUP BY 1
  ORDER BY lead_count DESC, deal_name ASC
  LIMIT p_limit;
END;
$$;

