const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sanitizeDatabase() {
  console.log('--- 1. Sanitize business_expo_profiles ---');
  const { data: expoProfiles, error: expoErr } = await supabase
    .from('business_expo_profiles')
    .select('id, event_name, event_name_en');

  if (expoErr) {
    console.error('Error fetching expo profiles:', expoErr);
    return;
  }

  let expoCount = 0;
  for (const profile of expoProfiles) {
    let needsUpdate = false;
    let newNameVi = profile.event_name;
    let newNameEn = profile.event_name_en;

    if (newNameVi && newNameVi.includes('SECC')) {
      newNameVi = '1Booking Expo Pass • Triển Lãm Quốc Tế';
      needsUpdate = true;
    }
    if (newNameEn && newNameEn.includes('SECC')) {
      newNameEn = '1Booking Expo Pass • International Expo';
      needsUpdate = true;
    }

    if (needsUpdate) {
      await supabase
        .from('business_expo_profiles')
        .update({
          event_name: newNameVi,
          event_name_en: newNameEn,
        })
        .eq('id', profile.id);
      expoCount++;
    }
  }
  console.log(`Updated ${expoCount} rows in business_expo_profiles`);

  console.log('--- 2. Sanitize businesses (address, description, page_content) ---');
  const { data: businesses, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, address, description, page_content');

  if (bizErr) {
    console.error('Error fetching businesses:', bizErr);
    return;
  }

  let bizCount = 0;
  for (const biz of businesses) {
    let needsUpdate = false;
    let newAddress = biz.address;
    let newDesc = biz.description;
    let newPageContent = { ...(biz.page_content || {}) };

    // Clean address
    if (newAddress && newAddress.includes('SECC')) {
      newAddress = newAddress
        .replace(/SECC\s*-\s*/gi, '')
        .replace(/,\s*SECC/gi, '')
        .replace(/SECC/gi, 'TP.HCM')
        .trim();
      needsUpdate = true;
    }

    // Clean description
    if (newDesc && newDesc.includes('SECC')) {
      newDesc = newDesc.replace(/SECC/gi, 'TP.HCM');
      needsUpdate = true;
    }

    // Clean page_content JSON
    let pageContentStr = JSON.stringify(newPageContent);
    if (pageContentStr.includes('SECC')) {
      if (newPageContent.event_name && newPageContent.event_name.includes('SECC')) {
        newPageContent.event_name = '1Booking Expo Pass • Triển Lãm Quốc Tế';
      }
      if (newPageContent.event_name_en && newPageContent.event_name_en.includes('SECC')) {
        newPageContent.event_name_en = '1Booking Expo Pass • International Expo';
      }
      if (newPageContent.venue && newPageContent.venue.includes('SECC')) {
        newPageContent.venue = 'TP. Hồ Chí Minh';
      }
      if (newPageContent.expo_profile) {
        if (newPageContent.expo_profile.event_name) {
          newPageContent.expo_profile.event_name = '1Booking Expo Pass • Triển Lãm Quốc Tế';
        }
        if (newPageContent.expo_profile.event_name_en) {
          newPageContent.expo_profile.event_name_en = '1Booking Expo Pass • International Expo';
        }
      }

      // Check if description inside page_content has SECC
      ['description', 'description_vi', 'description_en'].forEach((k) => {
        if (newPageContent[k] && typeof newPageContent[k] === 'string' && newPageContent[k].includes('SECC')) {
          newPageContent[k] = newPageContent[k].replace(/SECC/gi, 'TP.HCM');
        }
      });

      needsUpdate = true;
    }

    if (needsUpdate) {
      await supabase
        .from('businesses')
        .update({
          address: newAddress,
          description: newDesc,
          page_content: newPageContent,
        })
        .eq('id', biz.id);
      bizCount++;
    }
  }
  console.log(`Updated ${bizCount} rows in businesses`);
  console.log('Sanitization complete!');
}

sanitizeDatabase().catch(console.error);
