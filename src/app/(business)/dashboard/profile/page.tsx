"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Lock, MapPin, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function BusinessProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    page_content: {} as any,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("businesses").select("*").eq("owner_id", user.id).single().then(({ data }) => {
          if (data) {
            setBusiness(data);
            setFormData({
              name: data.name || "",
              location: data.location || "",
              page_content: data.page_content || {},
            });
          }
          setLoading(false);
        });
      }
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      page_content: {
        ...prev.page_content,
        [parent]: {
          ...prev.page_content[parent],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("businesses").update({
        name: formData.name,
        location: formData.location,
        page_content: formData.page_content
      }).eq("id", business.id);

      if (error) throw error;
      toast.success("Đã cập nhật thông tin thành công!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Đang tải...</div>;
  if (!business) return <div className="p-10">Không tìm thấy doanh nghiệp.</div>;

  // Giả sử plan_id null là Free
  const isPremium = business.plan_id != null; 
  
  const heroData = formData.page_content?.hero || {};

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chỉnh sửa Gian hàng</h2>
          <p className="text-muted-foreground mt-2">
            Cập nhật thông tin để khách hàng dễ dàng tìm thấy bạn.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90">
          <Save className="mr-2 size-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
          
          <div className="space-y-2">
            <Label>Tên gian hàng</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin className="size-4"/> Địa chỉ / Khu vực</Label>
            <Input 
              value={formData.location} 
              onChange={(e) => handleChange("location", e.target.value)} 
              placeholder="VD: Quận 1, TP.HCM"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Giờ mở cửa</Label>
            <Input 
              value={heroData.openingHours || ""} 
              onChange={(e) => handleNestedChange("hero", "openingHours", e.target.value)} 
              placeholder="08:00 - 20:00"
            />
          </div>
        </div>

        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm relative overflow-hidden">
          {!isPremium && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl">
              <Lock className="size-8 text-gold mb-3" />
              <h4 className="font-bold text-lg mb-2">Tính năng Cao cấp</h4>
              <p className="text-sm text-muted-foreground mb-4">Nâng cấp gói Standard để kích hoạt nút Gọi điện và Chat Zalo cho khách hàng.</p>
              <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                <Link href="/dashboard/upgrade">Nâng cấp 399k / Năm</Link>
              </Button>
            </div>
          )}

          <h3 className="font-semibold text-lg flex items-center gap-2">Liên hệ & Đặt lịch <Lock className="size-4 text-muted-foreground" /></h3>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="size-4"/> Số điện thoại (Hotline)</Label>
            <Input 
              value={formData.page_content?.phone || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, page_content: { ...prev.page_content, phone: e.target.value } }))}
              placeholder="VD: 0987654321"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MessageCircle className="size-4"/> Số Zalo hoặc Link Zalo</Label>
            <Input 
              value={formData.page_content?.zalo || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, page_content: { ...prev.page_content, zalo: e.target.value } }))}
              placeholder="VD: 0987654321 hoặc https://zalo.me/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
