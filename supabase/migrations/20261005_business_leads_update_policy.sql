-- Migration to add UPDATE policy for business_leads
CREATE POLICY "Owners can update their business leads"
ON business_leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM businesses
    WHERE businesses.id = business_leads.business_id
    AND businesses.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM businesses
    WHERE businesses.id = business_leads.business_id
    AND businesses.owner_id = auth.uid()
  )
);
