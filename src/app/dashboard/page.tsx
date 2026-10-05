import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Find the first business this user owns
  const { data: businesses } = await supabase
    .from("businesses")
    .select("slug")
    .eq("owner_id", user.id)
    .limit(1);

  if (businesses && businesses.length > 0) {
    redirect(`/${businesses[0].slug}/dashboard`);
  }

  // If they don't have a business, we could redirect them to a creation page or error page
  // For now, redirect to homepage or let them know
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="bg-card p-8 rounded-xl shadow-sm text-center max-w-md w-full border border-border">
        <h1 className="text-xl font-bold mb-4">Chưa có gian hàng</h1>
        <p className="text-muted-foreground mb-6">Bạn chưa sở hữu gian hàng nào trên hệ thống. Vui lòng liên hệ admin để được cấp gian hàng.</p>
        <a href="/" className="px-4 py-2 bg-gold text-ink font-medium rounded-lg inline-block">Về trang chủ</a>
      </div>
    </div>
  );
}
