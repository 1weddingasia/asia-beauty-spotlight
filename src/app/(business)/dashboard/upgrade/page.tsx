"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UpgradePage() {
  const supabase = createClient();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("businesses").select("*").limit(500).eq("owner_id", user.id).single().then(({ data }) => {
          setBusiness(data);
          setLoading(false);
        });
      }
    });
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!business) return <div className="p-10 text-center">Lỗi: Không tìm thấy doanh nghiệp.</div>;

  const UPGRADE_AMOUNT = 399000;
  const BANK_ACC = "0918731411";
  const BANK_NAME = "TPBank";
  const TRANSFER_CONTENT = `UPGRADE ${business.slug.toUpperCase()}`; 
  const QR_URL = `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${UPGRADE_AMOUNT}&des=${TRANSFER_CONTENT}`;

  const handleCheckPayment = async () => {
    setChecking(true);
    try {
      // Polling mock for now. In real life, webhook updates the DB, we check DB here.
      const { data, error } = await supabase.from("businesses").select("plan_tier, status").eq("id", business.id).single();
      if (error) {
        console.error("Lỗi kiểm tra thanh toán:", error);
      } else if (data && data.plan_tier === 'premium') { 
         setIsSuccess(true);
         setTimeout(() => {
           router.push(`/dashboard`);
         }, 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  if (isSuccess || business.plan_tier === 'premium') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12 text-center">
        <div className="mx-auto size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check className="size-12" />
        </div>
        <h2 className="text-3xl font-bold">Thanh toán thành công!</h2>
        <p className="text-muted-foreground text-lg">Gói Premium của gian hàng đã được kích hoạt. Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nâng cấp Gói Premium</h2>
        <p className="text-muted-foreground mt-2">
          Thanh toán tự động bằng cách quét mã QR qua ứng dụng ngân hàng.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-gold shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">Lợi ích Gói Premium</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">{UPGRADE_AMOUNT.toLocaleString('vi-VN')}đ <span className="text-sm font-normal text-muted-foreground">/ năm</span></div>
              <ul className="space-y-3 pt-4">
                {['Hiển thị Số điện thoại (Bấm gọi ngay)', 'Nút liên kết Zalo & Facebook', 'Mở khóa Đăng ảnh không giới hạn', 'Tăng tỷ lệ hiển thị Top danh mục'].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="size-5 text-green-500 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Mã QR Thanh toán</CardTitle>
              <CardDescription>Hệ thống tự động kích hoạt sau 5 giây.</CardDescription>
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
