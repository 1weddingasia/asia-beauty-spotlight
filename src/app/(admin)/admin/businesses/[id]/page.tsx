import BusinessEditorClient from "./BusinessEditorClient";
import { notFound } from "next/navigation";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (id === "new") {
    return <BusinessEditorClient business={null} />;
  }

  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (!business) {
    notFound();
  }

  return <BusinessEditorClient business={business} />;
}
