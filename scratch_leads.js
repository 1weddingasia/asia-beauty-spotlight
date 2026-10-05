const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from("business_leads").select("*");
  console.log("Error:", error);
  console.log("Leads count:", data ? data.length : 0);
  console.log("First lead:", data && data.length > 0 ? data[0] : "none");
}
test();
