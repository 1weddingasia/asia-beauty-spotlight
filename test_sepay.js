const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...vals] = line.split('=');
  const val = vals.join('=');
  if(key && val) acc[key] = val.replace(/"/g, '').replace(/\r/g, '').trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: business } = await supabase.from('businesses').select('id, slug, name, plan_tier, is_featured').limit(1).single();
  console.log("Testing with Business:", business);

  const payload = {
    id: Math.floor(Math.random() * 1000000),
    gateway: "vietcombank",
    transactionDate: new Date().toISOString(),
    accountNumber: "00003554020",
    content: `UPGRADE ${business.slug}`,
    transferType: "in",
    transferAmount: 500000,
    accumulated: 1000000
  };

  const secret = env.SEPAY_WEBHOOK_SECRET;
  
  const res = await fetch("http://localhost:3000/api/webhooks/sepay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secret}`
    },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Webhook Response:", res.status, text);

  // Check updated business
  const { data: updated } = await supabase.from('businesses').select('plan_tier, is_featured').eq('id', business.id).single();
  console.log("Updated Business:", updated);
}

main().catch(console.error);
