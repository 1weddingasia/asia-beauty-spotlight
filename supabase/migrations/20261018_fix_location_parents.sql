-- Fix parent_slug for national and other major cities so HCMC districts query is 100% clean
UPDATE directory_locations
SET parent_slug = 'toan-quoc'
WHERE slug IN ('ha-noi', 'da-nang', 'nha-trang', 'da-lat');

UPDATE directory_locations
SET parent_slug = NULL
WHERE slug = 'toan-quoc';

-- Re-point any legacy references to quan-1-hcm before deleting
UPDATE businesses
SET location_slug = 'quan-1'
WHERE location_slug = 'quan-1-hcm';

UPDATE business_locations
SET location_id = (SELECT id FROM directory_locations WHERE slug = 'quan-1' LIMIT 1)
WHERE location_id IN (SELECT id FROM directory_locations WHERE slug = 'quan-1-hcm')
  AND NOT EXISTS (
    SELECT 1 FROM business_locations bl2 
    WHERE bl2.business_id = business_locations.business_id 
      AND bl2.location_id = (SELECT id FROM directory_locations WHERE slug = 'quan-1' LIMIT 1)
  );

-- Remove legacy duplicate 'quan-1-hcm' if 'quan-1' exists
DELETE FROM directory_locations
WHERE slug = 'quan-1-hcm' AND EXISTS (SELECT 1 FROM directory_locations WHERE slug = 'quan-1');

