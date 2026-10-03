"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, User, Send, CheckCircle2 } from "lucide-react";

export default function AccountSettingsPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [businessSlug, setBusinessSlug] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [pageContent, setPageContent] = useState<any>({});

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setEmail(data.user.email || "");
        
        // Fetch business info for Telegram link
        const { data: biz } = await supabase
          .from('businesses')
          .select('id, slug, page_content')
          .eq('owner_id', data.user.id)
          .single();
          
        if (biz) {
          setBusinessId(biz.id);
          setBusinessSlug(biz.slug);
          setPageContent(biz.page_content || {});
          if (biz.page_content?.telegram_chat_id) {
            setTelegramLinked(true);
            setTelegramChatId(biz.page_content.telegram_chat_id);
          }
        }
      }
    });
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedSomething = false;
      
      if (password) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        updatedSomething = true;
      }
      
      if (businessId && telegramChatId !== (pageContent.telegram_chat_id || "")) {
        const newPageContent = { ...pageContent, telegram_chat_id: telegramChatId };
        const { error: bizError } = await supabase
          .from('businesses')
          .update({ page_content: newPageContent })
          .eq('id', businessId);
          
        if (bizError) throw bizError;
        setPageContent(newPageContent);
        setTelegramLinked(!!telegramChatId);
        updatedSomething = true;
      }

      if (updatedSomething) {
        toast.success("Đã lưu cài đặt thành công!");
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo Đơn hàng qua Telegram</CardTitle>
          <CardDescription>Nhận thông báo ngay lập tức về điện thoại khi có khách chốt đơn hoặc đặt lịch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
              <Send className="size-4" /> Kích hoạt tự động (Rất dễ)
            </h4>
            <p className="text-sm text-blue-700 mb-4">
              Chỉ cần nhấn vào nút bên dưới, ứng dụng Telegram của bạn sẽ mở ra. Nhấn nút <strong>START</strong> (Bắt đầu) trong Telegram là xong!
            </p>
            {telegramLinked ? (
              <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-3 rounded-lg border border-green-200 w-fit">
                <CheckCircle2 className="size-5" />
                Đã kết nối Telegram thành công!
              </div>
            ) : (
              <Button asChild className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold h-12 px-6">
                <a 
                  href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'onebeautyasia_bot'}?start=${businessSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="mr-2 size-5" />
                  Bấm để Kết Nối Telegram
                </a>
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-dashed">
            <h4 className="font-semibold text-ink mb-2">Cấu hình thủ công (Dành cho người rành kỹ thuật)</h4>
            <div className="space-y-2">
              <Label>Telegram Chat ID</Label>
              <Input 
                placeholder="Ví dụ: 123456789" 
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">ID này sẽ được cấp khi bạn nhắn tin với bot. Bạn cũng có thể tự lấy ID từ @userinfobot và nhập tay vào. Lưu ý: Cần nhấn "Lưu Thay Đổi" bên dưới để áp dụng.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 h-12 px-8 font-bold text-lg">
          {saving ? "Đang lưu..." : "Lưu Thay Đổi Cài Đặt"}
        </Button>
      </div>
    </div>
  );
}
