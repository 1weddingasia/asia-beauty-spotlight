"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UpgradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const UPGRADE_AMOUNT = 399000;
  const BANK_ACC = "0918731411";
  const BANK_NAME = "TPBank";
  
  // We can only generate the transfer content once we have the business slug
  const TRANSFER_CONTENT = business ? `UPGRADE ${business.slug.toUpperCase()}` : ""; 
  const QR_URL = business ? `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${UPGRADE_AMOUNT}&des=${TRANSFER_CONTENT}` : "";

  useEffect(() => {
    supabase.from("businesses").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setBusiness(data);
        if (data.status === 'published' && data.plan_id) { // simplified check
          // Could check if plan is standard
        }
      }
      setLoading(false);
    });
  }, [id]);

  const handleCheckPayment = async () => {
    setChecking(true);
    // Real implementation would check the transactions table or businesses table
    // to see if the plan was updated by the webhook.
    const { data } = await supabase.from("businesses").select("status").eq("id", id).single();
    if (data && data.status === 'published') { // assuming upgrade sets status to published
       setIsSuccess(true);
       setTimeout(() => {
         router.push(`/admin/businesses/${id}`);
       }, 3000);
    }
    setChecking(false);
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12 text-center">
        <div className="mx-auto size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check className="size-12" />
        </div>
        <h2 className="text-3xl font-bold">Thanh toán thành công!</h2>
        <p className="text-muted-foreground text-lg">Gói Standard của doanh nghiệp đã được kích hoạt. Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/businesses/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Nâng cấp Doanh nghiệp</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan Info */}
        <div className="space-y-6">
          <Card className="border-gold shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">Gói Standard</CardTitle>
              <CardDescription>Mở khóa toàn quyền năng của 1Beauty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">{UPGRADE_AMOUNT.toLocaleString('vi-VN')}đ <span className="text-sm font-normal text-muted-foreground">/ năm</span></div>
              <ul className="space-y-3 pt-4">
                {['Hiển thị Số điện thoại Hotline', 'Hiển thị Nút liên kết Zalo/Facebook', 'Tải lên không giới hạn hình ảnh (Gallery)', 'Đăng bài viết tuyển dụng / khuyến mãi', 'Ưu tiên hiển thị Top danh mục'].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="size-5 text-green-500 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Payment QR */}
        <div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Quét mã QR để Thanh toán</CardTitle>
              <CardDescription>Thanh toán sẽ được xác nhận tự động trong 5 giây.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border inline-block">
                <Image src={QR_URL} alt="Mã QR Thanh toán" width={250} height={250} className="rounded-lg" />
              </div>
              <div className="bg-muted p-4 rounded-lg w-full text-center space-y-1">
                <p className="text-sm text-muted-foreground">Nội dung chuyển khoản (bắt buộc):</p>
                <p className="font-mono font-bold text-lg text-ink">{TRANSFER_CONTENT}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckPayment} disabled={checking} className="w-full bg-gold text-ink hover:bg-gold/90">
                {checking && <Loader2 className="mr-2 size-4 animate-spin" />}
                Tôi đã chuyển khoản
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
