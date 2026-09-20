import { createClient } from "@/utils/supabase/server";
import PlansClient from "./PlansClient";

export default async function AdminPlansPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from("plans").select("*").order("created_at", { ascending: false });

  return <PlansClient initialPlans={plans || []} />;
}
