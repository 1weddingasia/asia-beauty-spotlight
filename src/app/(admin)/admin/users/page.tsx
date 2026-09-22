import { createClient } from "@/utils/supabase/server";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
  const { data: businesses } = await supabase.from("businesses").select("id, name, owner_id");

  return <UsersClient initialProfiles={profiles || []} businesses={businesses || []} />;
}
