"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("1Beauty.Asia");
  const [email, setEmail] = useState("admin@1beauty.asia");

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Đã lưu cấu hình hệ thống thành công!");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium">Cài đặt hệ thống</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý các cấu hình chung của nền tảng {siteName}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nền tảng</CardTitle>
            <CardDescription>
              Tên website, mô tả SEO và thông tin liên hệ mặc định.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Tên Website</Label>
              <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Email Liên hệ (Mặc định)</Label>
              <Input id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu hình Phân quyền (Sắp ra mắt)</CardTitle>
            <CardDescription>
              Tính năng phân quyền "Chủ Doanh Nghiệp" (Business Owner) sẽ được kích hoạt tại đây. 
              Cho phép Admin liên kết tài khoản user với một doanh nghiệp cụ thể.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-4 border border-border">
              <p className="text-sm text-muted-foreground">
                Mô-đun quản lý quyền truy cập và giới hạn chỉnh sửa của khách hàng đang được triển khai.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Hủy bỏ</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-gold text-ink hover:bg-gold/90">
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
