const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.rpc("query_logs", { query: "SELECT * FROM pg_policies WHERE tablename = 'business_leads';" });
  if (error) {
     console.error(error);
  } else {
     console.log(data);
  }
}
test();
