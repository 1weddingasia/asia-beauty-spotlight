"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, Copy, Link as LinkIcon, Lock, MapPin, CheckSquare, Square, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";

const AMENITY_OPTIONS = [
  "Có chỗ đỗ xe",
  "Thanh toán thẻ",
  "Phòng VIP riêng",
  "Wifi miễn phí",
  "Nước uống miễn phí",
  "Nhạc thư giãn",
  "Khu vực chờ",
  "Máy lạnh",
  "Có phòng tắm",
];

export default function BusinessEditorClient({ 
  business: initialBusiness,
  categories,
  locations 
}: { 
  business: any,
  categories: any[],
  locations: any[] 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(initialBusiness);

  const [formData, setFormData] = useState({
    name: initialBusiness?.name || "",
    address: initialBusiness?.address || "",
  });

  const getInitialPageContent = () => {
    if (!initialBusiness) return {
      description: "", phone: "", email: "", website: "", zalo: "", facebook: "", instagram: "", tiktok: "", youtube: "", logo_url: "", hero_image: "", banners: ["", "", ""], gallery: [], services: [], offers: [], amenities: [], map_embed: "", booking_url: "", price_range: "", working_hours: [{ day: "Thứ 2", hours: "09:00 - 20:00" }, { day: "Thứ 3", hours: "09:00 - 20:00" }, { day: "Thứ 4", hours: "09:00 - 20:00" }, { day: "Thứ 5", hours: "09:00 - 20:00" }, { day: "Thứ 6", hours: "09:00 - 20:00" }, { day: "Thứ 7", hours: "09:00 - 21:00" }, { day: "Chủ nhật", hours: "09:00 - 21:00" }]
    };
    
    if (initialBusiness.page_content) {
      try {
        const parsed = typeof initialBusiness.page_content === 'string' ? JSON.parse(initialBusiness.page_content) : initialBusiness.page_content;
        return {
          ...parsed,
          phone: initialBusiness.phone || parsed.phone || "",
          email: initialBusiness.email || parsed.email || "",
          website: initialBusiness.website || parsed.website || "",
          zalo: initialBusiness.zalo || parsed.zalo || "",
          facebook: initialBusiness.socials?.facebook || parsed.facebook || "",
          instagram: initialBusiness.socials?.instagram || parsed.instagram || "",
          tiktok: initialBusiness.socials?.tiktok || parsed.tiktok || "",
          youtube: initialBusiness.socials?.youtube || parsed.youtube || "",
        };
      } catch (e) { console.error(e); }
    }
    
    return {
      phone: initialBusiness.phone || "",
      email: initialBusiness.email || "",
      website: initialBusiness.website || "",
      zalo: initialBusiness.zalo || "",
      facebook: initialBusiness.socials?.facebook || "",
      instagram: initialBusiness.socials?.instagram || "",
      tiktok: initialBusiness.socials?.tiktok || "",
      youtube: initialBusiness.socials?.youtube || "",
    };
  };

  const [pageContent, setPageContent] = useState<any>(getInitialPageContent());

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePageContentChange = (field: string, value: any) => {
    setPageContent((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = pageContent.amenities || [];
    if (current.includes(amenity)) {
      handlePageContentChange("amenities", current.filter((a: string) => a !== amenity));
    } else {
      handlePageContentChange("amenities", [...current, amenity]);
    }
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
      toast.success("Đã lưu thông tin doanh nghiệp");
    } catch (error: any) {
      toast.error("Lỗi khi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateBanner = (index: number, url: string) => {
    const newBanners = [...(pageContent.banners || ["","",""])];
    newBanners[index] = url;
    handlePageContentChange("banners", newBanners);
  };

  const addService = () => {
    handlePageContentChange("services", [...(pageContent.services || []), { name: "", description: "", price: "", image: "" }]);
  };
  const removeService = (index: number) => {
    handlePageContentChange("services", pageContent.services.filter((_: any, i: number) => i !== index));
  };
  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...pageContent.services];
    newServices[index][field] = value;
    handlePageContentChange("services", newServices);
  };
  const duplicateService = (index: number) => {
    const svc = pageContent.services[index];
    handlePageContentChange("services", [...pageContent.services, { ...svc }]);
  };

  const addOffer = () => {
    handlePageContentChange("offers", [...(pageContent.offers || []), { title: "", code: "", discount: "", description: "", validFrom: "", validUntil: "" }]);
  };
  const removeOffer = (index: number) => {
    handlePageContentChange("offers", pageContent.offers.filter((_: any, i: number) => i !== index));
  };
  const updateOffer = (index: number, field: string, value: any) => {
    const newOffers = [...pageContent.offers];
    newOffers[index][field] = value;
    handlePageContentChange("offers", newOffers);
  };

  if (!business) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy doanh nghiệp.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/businesses"><ChevronLeft className="size-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold font-display text-gold">Chỉnh sửa Doanh nghiệp (Admin)</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Chỉnh sửa toàn diện thông tin hiển thị của {business.name}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 hidden md:flex">
            <Link href={`/doanh-nghiep/${business.slug}`} target="_blank">Xem Trang Khách</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 w-full md:w-auto">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-12 gap-2 bg-muted p-2 rounded-xl mb-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ & Bản đồ</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh</TabsTrigger>
          <TabsTrigger value="services">Bảng giá Dịch vụ</TabsTrigger>
          <TabsTrigger value="offers">Khuyến mãi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
              <h3 className="font-semibold text-xl">Quản lý Gói Thành viên</h3>
              {(() => {
                if (business.plan_tier === 'premium') {
                  return (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckSquare className="size-4" /> Đã kích hoạt Premium
                    </div>
                  );
                }
                
                const createdAt = business.created_at ? new Date(business.created_at) : new Date();
                const trialEndDate = new Date(createdAt);
                trialEndDate.setDate(trialEndDate.getDate() + 30);
                const now = new Date();
                const isExpired = now > trialEndDate;
                const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

                if (isExpired) {
                  return (
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Square className="size-4" /> Hết hạn dùng thử
                      </div>
                      <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-ink">
                        <Link href={`/admin/businesses/${business.id}/upgrade`}>Kích hoạt Premium</Link>
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Square className="size-4" /> Dùng thử ({daysLeft} ngày)
                    </div>
                    <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-ink">
                      <Link href={`/admin/businesses/${business.id}/upgrade`}>Nâng cấp Premium</Link>
                    </Button>
                  </div>
                );
              })()}
            </div>
            
            <h3 className="font-semibold text-xl pt-2">Thông tin Cơ bản</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tên Doanh Nghiệp (Thương hiệu)</Label>
                <Input value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Khoảng giá trung bình</Label>
                <Input value={pageContent.price_range || ""} onChange={(e) => handlePageContentChange("price_range", e.target.value)} placeholder="VD: 150.000đ - 2.000.000đ" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giới thiệu tóm tắt</Label>
              <Textarea 
                value={pageContent.description || ""} 
                onChange={(e) => handlePageContentChange("description", e.target.value)} 
                rows={4}
                placeholder="Mô tả về không gian, phong cách và thế mạnh của doanh nghiệp..."
              />
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Giờ mở cửa (7 ngày trong tuần)</Label>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Tiện ích Không gian</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((opt) => (
                  <div 
                    key={opt} 
                    onClick={() => toggleAmenity(opt)}
                    className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {(pageContent.amenities || []).includes(opt) ? 
                      <CheckSquare className="size-4 text-gold" /> : 
                      <Square className="size-4 text-gray-300" />
                    }
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-semibold text-xl border-b pb-4">Liên hệ & Mạng xã hội</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="Số nhà, Tên đường, Phường, Quận, Thành phố..." />
              </div>
              <div className="space-y-2">
                <Label>Link Đặt lịch (Booking / Zalo OA)</Label>
                <Input value={pageContent.booking_url || ""} onChange={(e) => handlePageContentChange("booking_url", e.target.value)} placeholder="https://booking.com/..." />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Số điện thoại (Hotline)</Label>
                <Input value={pageContent.phone || ""} onChange={(e) => handlePageContentChange("phone", e.target.value)} placeholder="09xxxx..." />
              </div>
              <div className="space-y-2">
                <Label>Zalo</Label>
                <Input value={pageContent.zalo || ""} onChange={(e) => handlePageContentChange("zalo", e.target.value)} placeholder="09xxxx..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={pageContent.email || ""} onChange={(e) => handlePageContentChange("email", e.target.value)} className="pl-9" placeholder="contact@spa.com" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={pageContent.website || ""} onChange={(e) => handlePageContentChange("website", e.target.value)} placeholder="https://" />
              </div>
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
              <Label className="text-base font-semibold flex items-center gap-2">
                <MapPin className="size-5 text-gold" /> Bản đồ Google Maps (Embed)
              </Label>
              <p className="text-sm text-muted-foreground">
                Để lấy mã nhúng, vào Google Maps {">"} Chọn địa điểm {">"} Nút "Chia sẻ" {">"} Chuyển sang "Nhúng bản đồ" {">"} Bấm "Sao chép HTML" và dán vào đây.
              </p>
              <Textarea 
                value={pageContent.map_embed || ""} 
                onChange={(e) => handlePageContentChange("map_embed", e.target.value)} 
                rows={4}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
              />
              {pageContent.map_embed && pageContent.map_embed.includes('<iframe') && (
                <div className="mt-4 rounded-xl overflow-hidden border">
                  <div dangerouslySetInnerHTML={{ __html: pageContent.map_embed }} className="w-full h-[300px] [&>iframe]:w-full [&>iframe]:h-full" />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-semibold text-xl border-b pb-4">Hình ảnh Nhận diện</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="font-bold">Logo Thương hiệu</Label>
                <p className="text-xs text-muted-foreground">Tỷ lệ 1:1, dung lượng nhẹ.</p>
                <div className="w-32 h-32">
                  <ImageUpload 
                    value={pageContent.logo_url} 
                    onChange={(url) => handlePageContentChange("logo_url", url)} 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-bold">Ảnh Cover Phụ (Tùy chọn)</Label>
                <p className="text-xs text-muted-foreground">Dùng để làm hình nền phụ.</p>
                <div className="w-full h-32 max-w-xs">
                  <ImageUpload 
                    value={pageContent.hero_image} 
                    onChange={(url) => handlePageContentChange("hero_image", url)} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-base font-semibold">Slider Trang chủ (Tối đa 3 ảnh Banner lớn)</Label>
              <p className="text-xs text-muted-foreground mb-4">Tỷ lệ 16:9 ngang để đẹp nhất trên desktop & mobile.</p>
              <div className="grid md:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-2">
                    <Label className="text-xs">Banner {idx + 1}</Label>
                    <div className="aspect-[16/9] w-full bg-gray-50 border border-dashed rounded-xl overflow-hidden relative group">
                      <ImageUpload 
                        value={pageContent.banners?.[idx] || ""} 
                        onChange={(url) => updateBanner(idx, url)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t relative">
              <Label className="text-base font-semibold flex items-center gap-2">
                Thư viện ảnh không gian (Gallery)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(pageContent.gallery || []).map((imgUrl: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="Gallery" className="object-cover w-full h-full" />
                    <button 
                      type="button"
                      onClick={() => {
                        const newGallery = pageContent.gallery.filter((_: any, index: number) => index !== i);
                        handlePageContentChange("gallery", newGallery);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                
                <div className="aspect-square">
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
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm relative">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-xl flex items-center gap-2">
                Chương trình Khuyến mãi / Ưu đãi
              </h3>
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
                      <Label className="text-xs">MÃ CODE (Tùy chọn)</Label>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
