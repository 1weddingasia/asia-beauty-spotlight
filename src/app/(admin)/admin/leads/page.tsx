import { createClient } from "@/utils/supabase/server";
import LeadsClient from "./LeadsClient";

export const metadata = {
  title: "Quản lý Leads B2B | Admin",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  // Lấy danh sách leads kèm thông tin doanh nghiệp
  const { data: leads, error } = await supabase
    .from("business_leads")
    .select(`
      *,
      businesses ( name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi lấy leads:", error);
  }

  return <LeadsClient initialLeads={leads || []} />;
}
