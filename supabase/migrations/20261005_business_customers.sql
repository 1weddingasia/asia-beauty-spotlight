CREATE TABLE IF NOT EXISTS business_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    total_visits INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    last_visit_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, phone)
);

-- RLS for business_customers
ALTER TABLE business_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their business customers"
ON business_customers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_customers.business_id
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update their business customers"
ON business_customers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_customers.business_id
    AND businesses.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_customers.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Also add customer_id to business_leads
ALTER TABLE business_leads ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES business_customers(id) ON DELETE SET NULL;

-- Migrate existing leads into business_customers
INSERT INTO business_customers (business_id, phone, name, total_visits, created_at, last_visit_at)
SELECT 
    business_id, 
    customer_phone, 
    MAX(customer_name) as name, 
    COUNT(*) as total_visits,
    MIN(created_at) as created_at,
    MAX(created_at) as last_visit_at
FROM business_leads
GROUP BY business_id, customer_phone
ON CONFLICT (business_id, phone) DO NOTHING;

-- Link existing leads to customers
UPDATE business_leads bl
SET customer_id = c.id
FROM business_customers c
WHERE bl.business_id = c.business_id AND bl.customer_phone = c.phone;
