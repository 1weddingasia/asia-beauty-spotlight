import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ClaimClient from "./ClaimClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default async function ClaimPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const token = params.token;
  const supabase = await createClient();

  // Validate token
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, address, phone, category_slug, plan_tier, owner_id, page_content")
    .eq("claim_token", token)
    .maybeSingle();

  if (!business) {
    return notFound();
  }

  // If already claimed, redirect or show message
  if (business.owner_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gian Hàng Đã Được Tiếp Quản!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Cơ sở <b>{business.name}</b> đã được kết nối với tài khoản quản trị. 
            Nếu bạn là chủ cơ sở, vui lòng đăng nhập vào bảng điều khiển để quản lý.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="w-full bg-gold text-ink font-bold hover:brightness-105">
              <Link href="/login">
                <span>Đăng nhập vào Bảng điều khiển</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
              <Link href={`/${business.slug}`} target="_blank">
                Xem trang công khai của quán ↗
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ClaimClient business={business} token={token} />;
}
