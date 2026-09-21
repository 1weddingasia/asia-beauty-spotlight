"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Plus, Trash2, Copy, Link as LinkIcon, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";

export default function BusinessEditorClient({ business, categories, locations }: { business?: any, categories: any[], locations: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: business?.name || "",
    slug: business?.slug || "",
    status: business?.status || "draft",
    is_featured: business?.is_featured || false,
  });

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedLocs, setSelectedLocs] = useState<string[]>([]);
  
  // Base visual structure parsed from JSON
  const [pageContent, setPageContent] = useState<any>({
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    logo_url: "",
    hero_image: "",
    banners: ["", "", ""], // 3 slides
    gallery: [],
    services: [],
    offers: [],
    working_hours: [
      { day: "Thứ 2", hours: "09:00 - 20:00" },
      { day: "Thứ 3", hours: "09:00 - 20:00" },
      { day: "Thứ 4", hours: "09:00 - 20:00" },
      { day: "Thứ 5", hours: "09:00 - 20:00" },
      { day: "Thứ 6", hours: "09:00 - 20:00" },
      { day: "Thứ 7", hours: "09:00 - 21:00" },
      { day: "Chủ nhật", hours: "09:00 - 21:00" }
    ]
  });

  useEffect(() => {
    if (business) {
      if (business.categories_list) setSelectedCats(business.categories_list.map((c: any) => c.id));
      if (business.locations_list) setSelectedLocs(business.locations_list.map((l: any) => l.id));
      
      if (business.page_content) {
        try {
          const parsed = typeof business.page_content === 'string' ? JSON.parse(business.page_content) : business.page_content;
          setPageContent((prev: any) => ({ ...prev, ...parsed }));
        } catch(e) {
          console.error("Failed to parse page_content", e);
        }
      }
    }
  }, [business]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePageContentChange = (field: string, value: any) => {
    setPageContent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build final payload
      const payload = {
        ...formData,
        page_content: pageContent
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
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  // --- Dynamic List Handlers ---
  const addService = () => {
    setPageContent((prev: any) => ({
      ...prev,
      services: [...(prev.services || []), { name: "", price: "", description: "", image: "" }]
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...pageContent.services];
    updated[index] = { ...updated[index], [field]: value };
    handlePageContentChange("services", updated);
  };

  const removeService = (index: number) => {
    const updated = [...pageContent.services];
    updated.splice(index, 1);
    handlePageContentChange("services", updated);
  };

  const duplicateService = (index: number) => {
    const updated = [...pageContent.services];
    updated.splice(index + 1, 0, { ...updated[index] });
    handlePageContentChange("services", updated);
  };

  const addOffer = () => {
    setPageContent((prev: any) => ({
      ...prev,
      offers: [...(prev.offers || []), { 
        title: "", 
        discount: "", 
        code: "", 
        validFrom: new Date().toISOString().split('T')[0], 
        validUntil: "", 
        description: "",
        created_at: new Date().toISOString()
      }]
    }));
  };

  const updateOffer = (index: number, field: string, value: string) => {
    const updated = [...pageContent.offers];
    updated[index] = { ...updated[index], [field]: value };
    handlePageContentChange("offers", updated);
  };

  const removeOffer = (index: number) => {
    const updated = [...pageContent.offers];
    updated.splice(index, 1);
    handlePageContentChange("offers", updated);
  };

  const updateBanner = (index: number, url: string) => {
    const updated = [...(pageContent.banners || ["", "", ""])];
    updated[index] = url;
    handlePageContentChange("banners", updated);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-20 mx-auto">
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 border-b">
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
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 hidden md:flex">
              <Link href={`/admin/businesses/${business.id}/upgrade`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Nâng cấp Gói
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 shadow-md">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* LEFT COLUMN: Main Visual Editor */}
        <div className="space-y-8">
          
          {/* 1. Basic Info Section */}
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            <h3 className="font-semibold text-xl border-b pb-4">Thông tin cơ bản</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tên doanh nghiệp / Spa</Label>
                <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Vd: Seoul Spa" />
              </div>
              <div className="space-y-2">
                <Label>Đường dẫn (Slug)</Label>
                <Input value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} placeholder="seoul-spa" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả giới thiệu (Giới thiệu ngắn)</Label>
              <Textarea 
                value={pageContent.description || ""} 
                onChange={(e) => handlePageContentChange("description", e.target.value)} 
                placeholder="Giới thiệu về dịch vụ, không gian, kinh nghiệm..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input value={pageContent.address || ""} onChange={(e) => handlePageContentChange("address", e.target.value)} placeholder="Số nhà, Tên đường..." />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại (Hotline)</Label>
                <Input value={pageContent.phone || ""} onChange={(e) => handlePageContentChange("phone", e.target.value)} placeholder="09xxxx..." />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={pageContent.email || ""} onChange={(e) => handlePageContentChange("email", e.target.value)} className="pl-9" placeholder="contact@spa.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={pageContent.website || ""} onChange={(e) => handlePageContentChange("website", e.target.value)} className="pl-9" placeholder="https://" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={pageContent.facebook || ""} onChange={(e) => handlePageContentChange("facebook", e.target.value)} placeholder="Link Fanpage" />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={pageContent.instagram || ""} onChange={(e) => handlePageContentChange("instagram", e.target.value)} placeholder="Link IG" />
              </div>
              <div className="space-y-2">
                <Label>TikTok</Label>
                <Input value={pageContent.tiktok || ""} onChange={(e) => handlePageContentChange("tiktok", e.target.value)} placeholder="Link TikTok" />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Giờ mở cửa (7 ngày trong tuần)</Label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(pageContent.working_hours || []).map((wh: any, i: number) => (
                  <div key={i} className="flex flex-col space-y-1 bg-gray-50 p-3 rounded-lg border">
                    <Label className="text-xs font-bold text-gold">{wh.day}</Label>
                    <Input 
                      value={wh.hours} 
                      onChange={(e) => {
                        const newWh = [...pageContent.working_hours];
                        newWh[i].hours = e.target.value;
                        handlePageContentChange("working_hours", newWh);
                      }} 
                      placeholder="09:00 - 20:00" 
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Visual Media Section */}
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            <h3 className="font-semibold text-xl border-b pb-4">Hình ảnh & Slider</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-1 border rounded-xl p-4 bg-gray-50/50">
                <Label className="text-base">Logo Thương hiệu</Label>
                <p className="text-xs text-muted-foreground mb-4">Tỷ lệ 1:1, dung lượng nhẹ.</p>
                <ImageUpload 
                  value={pageContent.logo_url} 
                  onChange={(url) => handlePageContentChange('logo_url', url)} 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2 border rounded-xl p-4 bg-gray-50/50">
                <Label className="text-base">Slider Trang chủ (Tối đa 3 ảnh ngang)</Label>
                <p className="text-xs text-muted-foreground mb-4">Upload trực tiếp để tự chạy slide trên trang của doanh nghiệp.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Label className="text-xs">Slide {i + 1}</Label>
                      <ImageUpload 
                        value={pageContent.banners?.[i] || ""} 
                        onChange={(url) => updateBanner(i, url)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t">
              <Label className="text-base">Thư viện ảnh không gian (Gallery)</Label>
              <p className="text-xs text-muted-foreground mb-4">Tải lên các hình ảnh cơ sở vật chất, hoạt động thực tế.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(pageContent.gallery || []).map((url: string, i: number) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-32 object-cover" />
                    <button 
                      onClick={() => {
                        const newGallery = [...pageContent.gallery];
                        newGallery.splice(i, 1);
                        handlePageContentChange("gallery", newGallery);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                
                {/* Upload new image to gallery button disguised as ImageUpload component wrapper */}
                <div className="h-32">
                  <ImageUpload 
                    value="" 
                    onChange={(url) => {
                      if(url) {
                        handlePageContentChange("gallery", [...(pageContent.gallery || []), url]);
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Services / Menu Section */}
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-xl">Bảng giá Dịch vụ</h3>
              <Button onClick={addService} size="sm" variant="outline" className="text-gold border-gold hover:bg-gold/10">
                <Plus className="size-4 mr-2" /> Thêm Dịch vụ
              </Button>
            </div>
            
            <div className="space-y-4">
              {(!pageContent.services || pageContent.services.length === 0) && (
                <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                  Chưa có dịch vụ nào. Bấm "Thêm Dịch vụ" để tạo.
                </div>
              )}
              {(pageContent.services || []).map((svc: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl bg-background relative group">
                  <div className="w-full md:w-32 shrink-0">
                    <ImageUpload 
                      value={svc.image} 
                      onChange={(url) => updateService(i, "image", url)} 
                    />
                  </div>
                  <div className="flex-grow space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Tên dịch vụ</Label>
                        <Input value={svc.name || ""} onChange={e => updateService(i, "name", e.target.value)} placeholder="Gội đầu dưỡng sinh..." />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Giá tiền</Label>
                        <Input value={svc.price || ""} onChange={e => updateService(i, "price", e.target.value)} placeholder="Từ 150.000đ" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mô tả chi tiết</Label>
                      <Input value={svc.description || ""} onChange={e => updateService(i, "description", e.target.value)} placeholder="Quy trình 60 phút bao gồm..." />
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 justify-start md:justify-center mt-2 md:mt-0">
                    <Button variant="outline" size="icon" onClick={() => duplicateService(i)} title="Nhân bản">
                      <Copy className="size-4 text-blue-500" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => removeService(i)} title="Xóa">
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Offers Section */}
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-xl">Chương trình Khuyến mãi / Ưu đãi</h3>
              <Button onClick={addOffer} size="sm" variant="outline" className="text-gold border-gold hover:bg-gold/10">
                <Plus className="size-4 mr-2" /> Thêm Ưu đãi
              </Button>
            </div>
            
            <div className="space-y-4">
              {(!pageContent.offers || pageContent.offers.length === 0) && (
                <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                  Chưa có khuyến mãi nào.
                </div>
              )}
              {(pageContent.offers || []).map((offer: any, i: number) => (
                <div key={i} className="p-4 border rounded-xl bg-champagne/20 relative group">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Tiêu đề Ưu đãi</Label>
                      <Input value={offer.title || ""} onChange={e => updateOffer(i, "title", e.target.value)} placeholder="Giảm 20% Lần Đầu" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mã CODE (Tùy chọn)</Label>
                      <Input value={offer.code || ""} onChange={e => updateOffer(i, "code", e.target.value)} placeholder="NEW20" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Nhãn Nổi Bật (VD: -20%)</Label>
                      <Input value={offer.discount || ""} onChange={e => updateOffer(i, "discount", e.target.value)} placeholder="-20%" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ngày Bắt đầu</Label>
                      <Input type="date" value={offer.validFrom || ""} onChange={e => updateOffer(i, "validFrom", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ngày Kết thúc</Label>
                      <Input type="date" value={offer.validUntil || ""} onChange={e => updateOffer(i, "validUntil", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    <Label className="text-xs">Mô tả Ưu đãi</Label>
                    <Textarea value={offer.description || ""} onChange={e => updateOffer(i, "description", e.target.value)} placeholder="Áp dụng cho khách hàng mới..." rows={2} />
                  </div>
                  
                  <Button variant="destructive" size="sm" onClick={() => removeOffer(i)} className="absolute top-4 right-4 h-8 px-2">
                    <Trash2 className="size-4 mr-1" /> Xóa
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Settings & Metadata */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-lg border-b pb-4 mb-4">Phân loại & Hiển thị</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
                    <SelectItem value="published">Đã đăng (Published)</SelectItem>
                    <SelectItem value="archived">Lưu trữ (Archived)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-champagne/30 border border-gold/20 rounded-lg">
                <input 
                  type="checkbox" 
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange("is_featured", e.target.checked)}
                  className="rounded border-gray-300 text-gold focus:ring-gold size-4"
                />
                <Label htmlFor="is_featured" className="font-bold text-gold cursor-pointer">Doanh nghiệp Nổi bật</Label>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Danh mục (Có thể chọn nhiều)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50/50">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedCats.includes(c.id)} 
                        onChange={() => handleCheckboxChange(c.id, selectedCats, setSelectedCats)}
                        className="rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                  {categories.length === 0 && <span className="text-xs text-muted-foreground">Chưa có danh mục.</span>}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Khu vực (Có thể chọn nhiều)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50/50">
                  {locations.map(l => (
                    <label key={l.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedLocs.includes(l.id)} 
                        onChange={() => handleCheckboxChange(l.id, selectedLocs, setSelectedLocs)}
                        className="rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span>{l.name}</span>
                    </label>
                  ))}
                  {locations.length === 0 && <span className="text-xs text-muted-foreground">Chưa có địa điểm.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
