import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import ClaimClient from "./ClaimClient";

export default async function ClaimPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const token = params.token;
  const supabase = await createClient();

  // Validate token
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, owner_id")
    .eq("claim_token", token)
    .single();

  if (!business) {
    return notFound();
  }

  // If already claimed, redirect or show message
  if (business.owner_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Đã được đăng ký!</h2>
          <p className="text-muted-foreground">
            Doanh nghiệp <b>{business.name}</b> đã được bàn giao cho một tài khoản khác. 
            Nếu đây là một sự nhầm lẫn, vui lòng liên hệ Admin.
          </p>
        </div>
      </div>
    );
  }

  return <ClaimClient business={business} token={token} />;
}
