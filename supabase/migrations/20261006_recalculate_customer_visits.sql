-- Reset all customer visits to 0
UPDATE business_customers
SET total_visits = 0, last_visit_at = NULL;

-- Recalculate based on served/closed leads
UPDATE business_customers AS bc
SET 
  total_visits = cs.actual_visits,
  last_visit_at = cs.last_visit
FROM (
  SELECT 
    customer_id,
    COUNT(*) as actual_visits,
    MAX(created_at) as last_visit
  FROM business_leads
  WHERE status IN ('served', 'closed')
  GROUP BY customer_id
) cs
WHERE cs.customer_id = bc.id;
