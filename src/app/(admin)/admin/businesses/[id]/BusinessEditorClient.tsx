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
import { ImageUpload } from "@/components/ui/image-upload";

export default function BusinessEditorClient({ business, categories, locations }: { business: any, categories: any[], locations: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  
  // Extract initial selections from junction tables
  const initialCatIds = business?.business_categories?.map((bc: any) => bc.category_id) || [];
  const initialLocIds = business?.business_locations?.map((bl: any) => bl.location_id) || [];

  const [formData, setFormData] = useState({
    name: business?.name || "",
    slug: business?.slug || "",
    status: business?.status || "draft",
    is_featured: business?.is_featured || false,
    page_content: JSON.stringify(business?.page_content || {}, null, 2),
  });

  const [logoUrl, setLogoUrl] = useState<string>(business?.page_content?.logo_url || "");
  const [heroImage, setHeroImage] = useState<string>(business?.page_content?.hero_image || "");

  // Update page_content JSON when images change
  const updatePageContentImage = (key: string, url: string) => {
    try {
      const parsed = JSON.parse(formData.page_content || "{}");
      parsed[key] = url;
      setFormData(prev => ({ ...prev, page_content: JSON.stringify(parsed, null, 2) }));
    } catch(e) {
      console.error(e);
    }
  };

  const [selectedCats, setSelectedCats] = useState<string[]>(initialCatIds);
  const [selectedLocs, setSelectedLocs] = useState<string[]>(initialLocIds);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (id: string, list: string[], setList: any) => {
    if (list.includes(id)) {
      setList(list.filter(x => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedContent = JSON.parse(formData.page_content);
      
      const payload = {
        name: formData.name,
        slug: formData.slug,
        status: formData.status,
        is_featured: formData.is_featured,
        page_content: parsedContent,
      };

      let businessId = business?.id;
      
      if (businessId) {
        const { error } = await supabase.from("businesses").update(payload).eq("id", businessId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("businesses").insert(payload).select().single();
        if (error) throw error;
        businessId = data.id;
      }

      // Update junction tables by deleting old and inserting new
      await supabase.from("business_categories").delete().eq("business_id", businessId);
      if (selectedCats.length > 0) {
        await supabase.from("business_categories").insert(selectedCats.map(cat_id => ({ business_id: businessId, category_id: cat_id })));
      }

      await supabase.from("business_locations").delete().eq("business_id", businessId);
      if (selectedLocs.length > 0) {
        await supabase.from("business_locations").insert(selectedLocs.map(loc_id => ({ business_id: businessId, location_id: loc_id })));
      }

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
        <div className="flex gap-2">
          {business?.id && (
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Link href={`/admin/businesses/${business.id}/upgrade`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Nâng cấp Gói
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
          
          <div className="space-y-2">
            <Label>Tên doanh nghiệp</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Đường dẫn (Slug)</Label>
            <Input 
              value={formData.slug} 
              onChange={(e) => handleChange("slug", e.target.value)} 
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

          <div className="space-y-2 border-t pt-4">
            <Label>Danh mục (Chọn nhiều)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categories.map(c => (
                <label key={c.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedCats.includes(c.id)} 
                    onChange={() => handleCheckboxChange(c.id, selectedCats, setSelectedCats)}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            {categories.length === 0 && <span className="text-xs text-muted-foreground">Chưa có danh mục nào. Hãy tạo trong Quản lý Danh mục.</span>}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Khu vực / Địa điểm (Chọn nhiều)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {locations.map(l => (
                <label key={l.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedLocs.includes(l.id)} 
                    onChange={() => handleCheckboxChange(l.id, selectedLocs, setSelectedLocs)}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span>{l.name}</span>
                </label>
              ))}
            </div>
            {locations.length === 0 && <span className="text-xs text-muted-foreground">Chưa có địa điểm nào. Hãy tạo trong Quản lý Địa điểm.</span>}
          </div>
          
          <div className="flex items-center gap-2 border-t pt-4">
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

        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg border-b pb-2">Hình ảnh hiển thị</h3>
          
          <div className="space-y-4">
            <Label>Logo Doanh Nghiệp</Label>
            <ImageUpload 
              value={logoUrl} 
              onChange={(url) => { setLogoUrl(url); updatePageContentImage('logo_url', url); }} 
            />
            <p className="text-xs text-muted-foreground">Khuyên dùng ảnh vuông 1:1, dung lượng nhỏ gọn.</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label>Hình Ảnh Hero / Bìa</Label>
            <ImageUpload 
              value={heroImage} 
              onChange={(url) => { setHeroImage(url); updatePageContentImage('hero_image', url); }} 
            />
            <p className="text-xs text-muted-foreground">Khuyên dùng ảnh ngang (tỷ lệ 16:9) để hiển thị đẹp nhất.</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Nội dung trang (JSON)</h3>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">Advanced</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Chỉnh sửa toàn bộ cấu trúc dữ liệu Landing Page của doanh nghiệp ở định dạng JSON.
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
