"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, User } from "lucide-react";

export default function AccountSettingsPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email || "");
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = {};
      if (password) updates.password = password;
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        toast.success("Cập nhật mật khẩu thành công!");
        setPassword("");
      } else {
        toast.info("Không có thay đổi nào để lưu.");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật tài khoản");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cài đặt Tài khoản</h2>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin đăng nhập và bảo mật tài khoản của bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Đăng nhập</CardTitle>
          <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="size-4" /> Địa chỉ Email
            </Label>
            <Input value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email là cố định. Vui lòng liên hệ Admin nếu muốn đổi.</p>
          </div>

          <div className="space-y-2 pt-4">
            <Label className="flex items-center gap-2">
              <Lock className="size-4" /> Đổi Mật khẩu Mới
            </Label>
            <Input 
              type="password" 
              placeholder="Nhập mật khẩu mới (bỏ trống nếu không đổi)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 mt-4">
            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
