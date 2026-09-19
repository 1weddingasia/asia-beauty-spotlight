"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BusinessEditorClient({ business }: { business: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  
  // Flatten out fields for simple editing
  const [formData, setFormData] = useState({
    name: business?.name || "",
    slug: business?.slug || "",
    status: business?.status || "draft",
    category: business?.category || "",
    location: business?.location || "",
    is_featured: business?.is_featured || false,
    page_content: JSON.stringify(business?.page_content || {}, null, 2),
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // parse JSON just to ensure validity before saving
      const parsedContent = JSON.parse(formData.page_content);
      
      const payload = {
        name: formData.name,
        slug: formData.slug,
        status: formData.status,
        category: formData.category,
        location: formData.location,
        is_featured: formData.is_featured,
        page_content: parsedContent,
      };

      let error;
      if (business?.id) {
        const res = await supabase.from("businesses").update(payload).eq("id", business.id);
        error = res.error;
      } else {
        const res = await supabase.from("businesses").insert(payload);
        error = res.error;
      }

      if (error) throw error;
      toast.success("Đã lưu thành công");
      router.push("/admin/businesses");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Có lỗi xảy ra, vui lòng kiểm tra JSON");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/businesses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            {business ? "Chỉnh sửa doanh nghiệp" : "Thêm doanh nghiệp mới"}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90">
          <Save className="mr-2 size-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Thông tin cơ bản (Cơ sở dữ liệu)</h3>
          
          <div className="space-y-2">
            <Label>Tên doanh nghiệp</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder="Ví dụ: L'Occitane Spa"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Đường dẫn (Slug)</Label>
            <Input 
              value={formData.slug} 
              onChange={(e) => handleChange("slug", e.target.value)} 
              placeholder="vi-du-loccitane-spa"
            />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
                <SelectItem value="published">Đã đăng (Published)</SelectItem>
                <SelectItem value="archived">Lưu trữ (Archived)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Input 
                value={formData.category} 
                onChange={(e) => handleChange("category", e.target.value)} 
                placeholder="spa"
              />
            </div>
            <div className="space-y-2">
              <Label>Địa điểm</Label>
              <Input 
                value={formData.location} 
                onChange={(e) => handleChange("location", e.target.value)} 
                placeholder="hcm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => handleChange("is_featured", e.target.checked)}
              className="rounded border-gray-300 text-gold focus:ring-gold"
            />
            <Label htmlFor="is_featured">Doanh nghiệp nổi bật (Featured)</Label>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Nội dung trang (JSON)</h3>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">Advanced</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Chỉnh sửa toàn bộ cấu trúc dữ liệu Landing Page của doanh nghiệp ở định dạng JSON. Tính năng Visual Editor sẽ ra mắt ở Phase 7.
          </p>
          <Textarea
            value={formData.page_content}
            onChange={(e) => handleChange("page_content", e.target.value)}
            className="font-mono text-xs h-[400px]"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
