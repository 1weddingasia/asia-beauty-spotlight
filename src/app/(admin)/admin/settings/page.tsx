"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  const [settings, setSettings] = useState({
    site_name: "1Beauty.Asia",
    contact_email: "admin@1beauty.asia",
    logo_url: "",
  });

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'global').single().then(({ data, error }) => {
      if (data && data.value) {
        setSettings(data.value as any);
      }
      setFetching(false);
    });
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Upsert equivalent
    const { data: existing } = await supabase.from('site_settings').select('id').eq('key', 'global').single();
    
    let error;
    if (existing) {
      const res = await supabase.from('site_settings').update({ value: settings, updated_at: new Date().toISOString() }).eq('key', 'global');
      error = res.error;
    } else {
      const res = await supabase.from('site_settings').insert({ key: 'global', value: settings });
      error = res.error;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đã lưu cấu hình hệ thống thành công!");
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-10">Đang tải cài đặt...</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h3 className="text-lg font-medium">Cài đặt Hệ thống</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý các cấu hình chung của nền tảng {settings.site_name}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nền tảng & Logo</CardTitle>
            <CardDescription>
              Cập nhật Logo ứng dụng, tên website và thông tin liên hệ mặc định. Logo này sẽ hiển thị ở Header và Footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Logo Ứng Dụng</Label>
              <div className="flex gap-4 items-start">
                <ImageUpload 
                  value={settings.logo_url} 
                  onChange={(url) => handleChange("logo_url", url)} 
                  folder="settings"
                />
                <div className="flex-1 space-y-2 mt-4">
                  <p className="text-sm font-medium">Lưu ý khi tải Logo:</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Khuyên dùng định dạng PNG trong suốt (Transparent).</li>
                    <li>Kích thước hiển thị tốt nhất là hình chữ nhật hoặc vuông cân đối.</li>
                    <li>Dung lượng tối đa 5MB.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="site-name">Tên Website (Site Name)</Label>
              <Input id="site-name" value={settings.site_name} onChange={(e) => handleChange("site_name", e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Email Liên hệ (Mặc định)</Label>
              <Input id="contact-email" value={settings.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} />
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
