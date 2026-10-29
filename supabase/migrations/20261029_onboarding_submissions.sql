-- Migration: 20261029_onboarding_submissions.sql
-- Bảng lưu trữ lịch sử các biểu mẫu gửi thông tin tự động tạo trang từ khách hàng (Ưu đãi & Tiệc)

CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('deal', 'party')),
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_enhanced_payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_type ON public.onboarding_submissions(type);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding_submissions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_phone ON public.onboarding_submissions(contact_phone);

-- Kích hoạt RLS
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Cho phép Admin và Server Role đọc và ghi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_submissions' AND policyname = 'Enable all for service_role'
  ) THEN
    CREATE POLICY "Enable all for service_role"
      ON public.onboarding_submissions FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_onboarding_business ON public.onboarding_submissions(business_id);
