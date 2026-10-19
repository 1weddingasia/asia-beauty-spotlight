-- Migration: 20261019_30day_trial_membership_flow.sql
-- Hoàn thiện luồng thành viên, set mặc định 30 ngày dùng thử miễn phí cho mọi doanh nghiệp

-- 1. Cập nhật CHECK constraint trên bảng memberships
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_status_check 
  CHECK (status = ANY (ARRAY['trial'::text, 'active'::text, 'expired'::text, 'cancelled'::text, 'suspended'::text]));

-- 2. Thêm Foreign Key từ memberships.plan_id -> plans(id) để hỗ trợ PostgREST join
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'memberships_plan_id_fkey'
  ) THEN
    ALTER TABLE memberships 
    ADD CONSTRAINT memberships_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Tạo mã claim_token cho tất cả doanh nghiệp chưa có chủ sở hữu
UPDATE businesses
SET claim_token = gen_random_uuid()
WHERE claim_token IS NULL AND owner_id IS NULL;

-- 4. Cập nhật plan_id mặc định cho các doanh nghiệp
UPDATE businesses b
SET 
  plan_tier = COALESCE(b.plan_tier, 'trial'),
  plan_id = COALESCE(
    b.plan_id,
    CASE 
      WHEN b.category_slug IN ('nha-hang-am-thuc', 'tiec-cuoi', 'quan-an', 'karaoke', 'bar-pub', 'cafe') 
        THEN (SELECT id FROM plans WHERE name ILIKE '%Tiệc%' AND is_active = true LIMIT 1)
      ELSE (SELECT id FROM plans WHERE name ILIKE '%Ưu Đãi%' AND is_active = true LIMIT 1)
    END,
    (SELECT id FROM plans WHERE is_active = true LIMIT 1)
  )
WHERE b.plan_id IS NULL OR b.plan_tier IS NULL;

-- 5. Backfill tặng 30 ngày dùng thử miễn phí cho tất cả doanh nghiệp hiện có
INSERT INTO memberships (business_id, plan_id, status, starts_at, expires_at)
SELECT 
  b.id,
  COALESCE(
    b.plan_id,
    CASE 
      WHEN b.category_slug IN ('nha-hang-am-thuc', 'tiec-cuoi', 'quan-an', 'karaoke', 'bar-pub', 'cafe') 
        THEN (SELECT id FROM plans WHERE name ILIKE '%Tiệc%' AND is_active = true LIMIT 1)
      ELSE (SELECT id FROM plans WHERE name ILIKE '%Ưu Đãi%' AND is_active = true LIMIT 1)
    END,
    (SELECT id FROM plans WHERE is_active = true LIMIT 1)
  ),
  'trial',
  NOW(),
  NOW() + INTERVAL '30 days'
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM memberships m WHERE m.business_id = b.id
);

-- 6. Trigger tự động cấp 30 ngày dùng thử khi tạo doanh nghiệp mới
CREATE OR REPLACE FUNCTION handle_new_business_membership()
RETURNS TRIGGER AS $$
DECLARE
  default_plan_id uuid;
BEGIN
  -- Tự sinh claim_token nếu chưa có và chưa có chủ sở hữu
  IF NEW.owner_id IS NULL AND NEW.claim_token IS NULL THEN
    NEW.claim_token := gen_random_uuid();
  END IF;

  -- Xác định gói mặc định
  IF NEW.plan_id IS NULL THEN
    IF NEW.category_slug IN ('nha-hang-am-thuc', 'tiec-cuoi', 'quan-an', 'karaoke', 'bar-pub', 'cafe') THEN
      SELECT id INTO default_plan_id FROM plans WHERE name ILIKE '%Tiệc%' AND is_active = true LIMIT 1;
    ELSE
      SELECT id INTO default_plan_id FROM plans WHERE name ILIKE '%Ưu Đãi%' AND is_active = true LIMIT 1;
    END IF;

    IF default_plan_id IS NULL THEN
      SELECT id INTO default_plan_id FROM plans WHERE is_active = true LIMIT 1;
    END IF;

    NEW.plan_id := default_plan_id;
  END IF;

  IF NEW.plan_tier IS NULL THEN
    NEW.plan_tier := 'trial';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_new_business_defaults ON businesses;
CREATE TRIGGER trg_new_business_defaults
BEFORE INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION handle_new_business_membership();

-- 7. Trigger tạo membership 30 ngày dùng thử sau khi insert business
CREATE OR REPLACE FUNCTION handle_after_new_business_membership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM memberships WHERE business_id = NEW.id) THEN
    INSERT INTO memberships (business_id, plan_id, status, starts_at, expires_at)
    VALUES (
      NEW.id,
      NEW.plan_id,
      'trial',
      NOW(),
      NOW() + INTERVAL '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_new_business_membership ON businesses;
CREATE TRIGGER trg_after_new_business_membership
AFTER INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION handle_after_new_business_membership();
