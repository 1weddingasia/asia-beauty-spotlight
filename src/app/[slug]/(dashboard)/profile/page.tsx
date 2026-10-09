"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, Link as LinkIcon, Lock, MapPin, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
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

export default function BusinessProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug;
  const currentTab = searchParams.get('tab') || "overview";
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  // NOTE: Gallery & Offers are unlocked for all businesses during the launch phase (30-day trial).
  // Re-enable plan-tier gating when Free/VIP tiers are introduced.
  const [isPremium] = useState(true);

  const handleTabChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (val === "overview") {
      newParams.delete('tab');
    } else {
      newParams.set('tab', val);
    }
    router.push(`?${newParams.toString()}`);
  };

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
    zalo: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    logo_url: "",
    hero_image: "",
    banners: ["", "", ""],
    gallery: [],
    services: [],
    deals: [],
    amenities: [],
    map_embed: "",
    booking_url: "",
    price_range: "",
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
        supabase.from("businesses").select("*, plans(name)").eq("owner_id", user.id).eq("slug", slug).single().then(({ data }) => {
          if (data) {
            setBusiness(data);
            

            setFormData({
              name: data.name || "",
              address: data.address || "",
            });
            if (data.page_content) {
              try {
                const parsed = (typeof data.page_content === 'string' ? JSON.parse(data.page_content) : data.page_content) || {};
                setPageContent((prev: any) => ({ 
                  ...prev, 
                  ...parsed,
                  phone: data.phone || parsed.phone || "",
                  email: data.email || parsed.email || "",
                  website: data.website || parsed.website || "",
                  zalo: data.zalo || parsed.zalo || "",
                  facebook: data.socials?.facebook || parsed.facebook || "",
                  instagram: data.socials?.instagram || parsed.instagram || "",
                  tiktok: data.socials?.tiktok || parsed.tiktok || "",
                  youtube: data.socials?.youtube || parsed.youtube || "",
                  working_hours: Array.isArray(parsed.working_hours) ? parsed.working_hours : prev.working_hours,
                  gallery: Array.isArray(parsed.gallery) ? parsed.gallery : prev.gallery,
                  services: Array.isArray(parsed.services) ? parsed.services : prev.services,
                  deals: Array.isArray(parsed.deals) ? parsed.deals : prev.deals,
                  amenities: Array.isArray(parsed.amenities) ? parsed.amenities : prev.amenities,
                  banners: Array.isArray(parsed.banners) ? parsed.banners : prev.banners,
                }));
              } catch (e) { console.error(e); }
            } else {
              setPageContent((prev: any) => ({
                ...prev,
                phone: data.phone || "",
                email: data.email || "",
                website: data.website || "",
                zalo: data.zalo || "",
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

  const toggleAmenity = (amenity: string) => {
    const current = pageContent.amenities || [];
    if (current.includes(amenity)) {
      handlePageContentChange("amenities", current.filter((a: string) => a !== amenity));
    } else {
      handlePageContentChange("amenities", [...current, amenity]);
    }
  };

  const handleSave = async () => {
    // Check for base64 images which cause massive slowdowns
    const contentStr = JSON.stringify(pageContent);
    // Find if there's any data:image string longer than 50,000 characters
    const base64Matches = contentStr.match(/data:image\/[^;]+;base64,[^"]+/g);
    if (base64Matches && base64Matches.some(m => m.length > 50000)) {
      toast.error("Lỗi: Không được dán trực tiếp ảnh (Base64) vào ô hình ảnh. Vui lòng sử dụng đường link (URL) ảnh để không làm chậm hệ thống!", { duration: 8000 });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("businesses").update({
        name: formData.name,
        address: formData.address,
        description: pageContent.description || null,
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

  const addDeal = () => {
    handlePageContentChange("deals", [...(pageContent.deals || []), { id: `deal-${Math.random().toString(36).substring(2, 9)}`, title: "", original_price: "", promo_price: "", badge: "", note: "", status: "active" }]);
  };
  const removeDeal = (index: number) => {
    handlePageContentChange("deals", pageContent.deals.filter((_: any, i: number) => i !== index));
  };
  const updateDeal = (index: number, field: string, value: any) => {
    const newDeals = [...(pageContent.deals || [])];
    newDeals[index][field] = value;
    handlePageContentChange("deals", newDeals);
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải thông tin...</div>;
  if (!business) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy doanh nghiệp.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="sticky top-0 z-40 -mx-6 px-6 py-4 md:-mx-10 md:px-10 bg-background/95 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gold">Chỉnh sửa Gian hàng</h1>
          <p className="text-muted-foreground text-sm mt-1">Cập nhật thông tin chi tiết để thu hút khách hàng tốt hơn.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 hidden md:flex">
            <Link href={`/${business.slug}`} target="_blank">Xem Trang Khách</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-ink hover:bg-gold/90 w-full md:w-auto shadow-md">
            <Save className="mr-2 size-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-12 gap-2 bg-muted p-2 rounded-xl mb-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ & Bản đồ</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh</TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-1">Ưu đãi {!isPremium && <Lock className="size-3" />}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-semibold text-xl border-b pb-4">Thông tin Cơ bản</h3>
            
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
                  <Input value={pageContent.email || ""} onChange={(e) => handlePageContentChange("email", e.target.value)} className="pl-9" placeholder="contact@example.com" />
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
              {!isPremium && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl">
                  <Lock className="size-8 text-gold mb-3" />
                  <h4 className="font-bold text-lg mb-2">Tính năng Premium</h4>
                  <p className="text-sm text-muted-foreground mb-4">Nâng cấp để tải lên không giới hạn Thư viện Ảnh (Gallery) thực tế của cửa hàng.</p>
                  <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                    <Link href={`/${business.slug}/upgrade`}>Nâng cấp 399k / Năm</Link>
                  </Button>
                </div>
              )}
              <Label className="text-base font-semibold flex items-center gap-2">
                Thư viện ảnh không gian (Gallery) {!isPremium && <Lock className="size-4 text-muted-foreground" />}
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

        <TabsContent value="deals" className="space-y-6">
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm relative">
            {!isPremium && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center border border-gold/50 rounded-xl">
                <Lock className="size-8 text-gold mb-3" />
                <h4 className="font-bold text-lg mb-2">Tính năng Premium</h4>
                <p className="text-sm text-muted-foreground mb-4">Nâng cấp gói Premium để đăng tải các chương trình Ưu đãi lên trang chủ.</p>
                <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                  <Link href={`/${business.slug}/upgrade`}>Nâng cấp 399k / Năm</Link>
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-semibold text-xl flex items-center gap-2">
                Các Gói Ưu Đãi / Deals {!isPremium && <Lock className="size-4 text-muted-foreground" />}
              </h3>
              <Button onClick={addDeal} disabled={!isPremium} size="sm" variant="outline" className="text-gold border-gold hover:bg-gold/10">
                <Plus className="size-4 mr-2" /> Thêm Ưu đãi
              </Button>
            </div>
            
            <div className="space-y-4">
              {(!pageContent.deals || pageContent.deals.length === 0) && (
                <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                  Chưa có ưu đãi nào.
                </div>
              )}
              {(pageContent.deals || []).map((deal: any, i: number) => (
                <div key={i} className="p-4 border rounded-xl bg-champagne/20 relative group">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Tên Ưu Đãi</Label>
                      <Input value={deal.title || ""} onChange={e => updateDeal(i, "title", e.target.value)} placeholder="Trị mụn chuyên sâu" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nhãn nổi bật (Badge)</Label>
                      <Input value={deal.badge || ""} onChange={e => updateDeal(i, "badge", e.target.value)} placeholder="HOT" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Giá gốc</Label>
                      <Input value={deal.original_price || ""} onChange={e => updateDeal(i, "original_price", e.target.value)} placeholder="500000" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Giá Ưu Đãi</Label>
                      <Input value={deal.promo_price || ""} onChange={e => updateDeal(i, "promo_price", e.target.value)} placeholder="199000" />
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    <Label className="text-xs">Ghi chú (Lưu ý)</Label>
                    <Textarea value={deal.note || ""} onChange={e => updateDeal(i, "note", e.target.value)} placeholder="Dành cho khách hàng mới..." rows={2} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={deal.status !== 'paused'} 
                        onCheckedChange={(checked) => updateDeal(i, "status", checked ? "active" : "paused")} 
                      />
                      <Label className={`text-xs ${deal.status !== 'paused' ? 'text-green-600' : 'text-gray-400'}`}>
                        {deal.status !== 'paused' ? 'Đang bật' : 'Tạm dừng'}
                      </Label>
                    </div>
                  </div>
                  
                  <Button variant="destructive" size="sm" onClick={() => removeDeal(i)} className="absolute top-4 right-4 h-8 px-2">
                    <Trash2 className="size-4 mr-1" /> Xóa
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* Floating Save Button */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 md:hidden">
        <Button onClick={handleSave} disabled={saving} size="lg" className="bg-gold text-ink hover:bg-gold/90 shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform rounded-full px-6 h-14">
          <Save className="mr-2 size-5" />
          {saving ? "Đang lưu..." : "Lưu ngay"}
        </Button>
      </div>
    </div>
  );
}
