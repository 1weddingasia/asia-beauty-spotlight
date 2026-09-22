"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Trash2, Copy, Link as LinkIcon, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";

export default function BusinessProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const [pageContent, setPageContent] = useState<any>({
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    logo_url: "",
    banners: ["", "", ""],
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("businesses").select("*").eq("owner_id", user.id).single().then(({ data }) => {
          if (data) {
            setBusiness(data);
            setFormData({
              name: data.name || "",
              address: data.address || "",
            });
            if (data.page_content) {
              try {
                const parsed = typeof data.page_content === 'string' ? JSON.parse(data.page_content) : data.page_content;
                setPageContent((prev: any) => ({ 
                  ...prev, 
                  ...parsed,
                  phone: data.phone || parsed.phone || "",
                  email: data.email || parsed.email || "",
                  website: data.website || parsed.website || "",
                  facebook: data.socials?.facebook || parsed.facebook || "",
                  instagram: data.socials?.instagram || parsed.instagram || "",
                  tiktok: data.socials?.tiktok || parsed.tiktok || "",
                  youtube: data.socials?.youtube || parsed.youtube || "",
                }));
              } catch(e) {}
            } else {
              setPageContent((prev: any) => ({
                ...prev,
                phone: data.phone || "",
                email: data.email || "",
                website: data.website || "",
                facebook: data.socials?.facebook || "",
                instagram: data.socials?.instagram || "",
                tiktok: data.socials?.tiktok || "",
                youtube: data.socials?.youtube || "",
              }));
            }
          }
          setLoading(false);
        });
      }
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePageContentChange = (field: string, value: any) => {
    setPageContent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("businesses").update({
        name: formData.name,
        address: formData.address,
        phone: pageContent.phone || null,
        email: pageContent.email || null,
        website: pageContent.website || null,
        zalo: pageContent.zalo || null,
        socials: { 
          facebook: pageContent.facebook, 
          instagram: pageContent.instagram, 
          tiktok: pageContent.tiktok,
          youtube: pageContent.youtube
        },
        page_content: pageContent
      }).eq("id", business.id);

      if (error) throw error;
      toast.success("Đã lưu thành công");
      router.refresh();
    } catch (err: any) {
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

  if (loading) return <div className="p-10">Đang tải...</div>;
  if (!business) return <div className="p-10">Không tìm thấy doanh nghiệp.</div>;

  const isPremium = business.plan_id != null; 

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Chỉnh sửa Gian hàng
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Trình kiến tạo trang doanh nghiệp trực quan</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 shadow-md">
          <Save className="mr-2 size-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="space-y-8">
        
        {/* 1. Basic Info Section */}
        <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <h3 className="font-semibold text-xl border-b pb-4">Thông tin cơ bản</h3>
          
          <div className="space-y-2">
            <Label>Tên doanh nghiệp / Spa</Label>
            <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Vd: Seoul Spa" />
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
              <Label>Địa chỉ chi tiết</Label>
              <Input value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="Số nhà, Tên đường..." />
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

          <div className="space-y-2 pt-6 border-t relative">
            {!isPremium && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl mt-4">
                <Lock className="size-8 text-gold mb-3" />
                <h4 className="font-bold text-lg mb-2">Tính năng Premium</h4>
                <p className="text-sm text-muted-foreground mb-4">Nâng cấp gói Premium để đăng tải thư viện ảnh không giới hạn.</p>
                <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                  <Link href="/dashboard/upgrade">Nâng cấp 399k / Năm</Link>
                </Button>
              </div>
            )}
            
            <Label className="text-base flex items-center gap-2">
              Thư viện ảnh không gian (Gallery) {!isPremium && <Lock className="size-4 text-muted-foreground" />}
            </Label>
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
        <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm relative">
          {!isPremium && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl">
              <Lock className="size-8 text-gold mb-3" />
              <h4 className="font-bold text-lg mb-2">Tính năng Premium</h4>
              <p className="text-sm text-muted-foreground mb-4">Nâng cấp gói Premium để đăng tải Ưu đãi và Khuyến mãi lên trang chủ.</p>
              <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                <Link href="/dashboard/upgrade">Nâng cấp 399k / Năm</Link>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-semibold text-xl flex items-center gap-2">
              Chương trình Khuyến mãi / Ưu đãi {!isPremium && <Lock className="size-4 text-muted-foreground" />}
            </h3>
            <Button onClick={addOffer} disabled={!isPremium} size="sm" variant="outline" className="text-gold border-gold hover:bg-gold/10">
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
    </div>
  );
}
