"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

type DealInput = { id: string; title: string; original_price: string; promo_price: string; note: string; badge: string };
type ServiceInput = { id: string; name: string; price: string; description: string; image_url: string };

export function QuickPromoBuilderDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [banners, setBanners] = useState<string[]>(["", "", ""]);
  
  const [shortDesc, setShortDesc] = useState("");
  const [facebook, setFacebook] = useState("");
  const [hours, setHours] = useState("");
  
  const [deals, setDeals] = useState<DealInput[]>([{ id: "deal-1", title: "", original_price: "", promo_price: "", note: "", badge: "HOT" }]);
  const [services, setServices] = useState<ServiceInput[]>([]);

  const autoGenerateSlug = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/create-full-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, name, slug, address, phone, logo_url: logoUrl, 
          banners: banners.filter(b => b.trim() !== ""),
          short_description: shortDesc, facebook, hours,
          deals: deals.filter(d => d.title.trim() !== "").map(d => ({ ...d, status: "active" })),
          services: services.filter(s => s.name.trim() !== "")
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setSuccessData({ email, password, promoLink: 'https://1beauty.asia' + data.promoLink });
      toast.success("Tạo trang ưu đãi thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setEmail(""); setPassword(""); setName(""); setSlug(""); setAddress(""); setPhone("");
    setLogoUrl(""); setBanners(["", "", ""]);
    setShortDesc(""); setFacebook(""); setHours("");
    setDeals([{ id: "deal-1", title: "", original_price: "", promo_price: "", note: "", badge: "HOT" }]);
    setServices([]);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val && successData) resetForm();
    }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            🚀 Trình Tạo Trang Ưu Đãi (Dành cho Khách Hàng)
          </DialogTitle>
          <DialogDescription>
            Tạo tài khoản thật và trang ưu đãi đồng bộ với Database. Bạn có thể copy mẫu này cho nhiều khách.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {successData ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="size-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold">Thành công!</h3>
              <div className="bg-muted p-4 rounded-xl text-left max-w-md mx-auto relative group">
                <p><strong>Email:</strong> {successData.email}</p>
                <p><strong>Mật khẩu:</strong> {successData.password}</p>
                <p className="mt-2 text-blue-600 truncate"><a href={successData.promoLink} target="_blank">{successData.promoLink}</a></p>
                
                <Button 
                  size="sm" 
                  className="absolute top-4 right-4" 
                  onClick={() => {
                    navigator.clipboard.writeText(`Trang Ưu Đãi của bạn:\nLink: ${successData.promoLink}\n\nTài khoản quản trị:\nEmail: ${successData.email}\nPass: ${successData.password}`);
                    toast.success("Đã copy vào clipboard");
                  }}
                >
                  <Copy className="size-4 mr-2" /> Copy Gửi Khách
                </Button>
              </div>
              <Button variant="outline" onClick={resetForm}>Tạo tiệm khác</Button>
            </div>
          ) : (
            <form id="promo-form" onSubmit={handleSubmit} className="space-y-8 pb-8">
              
              {/* 1. Account Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">1. Thông tin Tài Khoản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Email đăng nhập *</label>
                    <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ngocspa@gmail.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Mật khẩu *</label>
                    <Input required value={password} onChange={e => setPassword(e.target.value)} placeholder="123456" />
                  </div>
                </div>
              </div>

              {/* 2. Business Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">2. Cấu hình Cửa Hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Tên tiệm *</label>
                    <Input required value={name} onChange={e => autoGenerateSlug(e.target.value)} placeholder="Ngọc Spa" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Đường dẫn (Slug) *</label>
                    <Input required value={slug} onChange={e => setSlug(e.target.value)} placeholder="ngoc-spa" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium">Giới thiệu ngắn</label>
                    <Input value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Spa chăm sóc sắc đẹp uy tín..." />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium">Địa chỉ</label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Lê Lợi..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Hotline / Zalo *</label>
                    <Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="0901234567" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Link Facebook</label>
                    <Input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium">Giờ hoạt động</label>
                    <Input value={hours} onChange={e => setHours(e.target.value)} placeholder="9:00 - 20:00 (T2-CN)" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium">Logo Tiệm</label>
                    <ImageUpload 
                      value={logoUrl} 
                      onChange={setLogoUrl} 
                      folder="businesses/logos"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium mb-2 block">Ảnh Bìa (Banner - tối đa 3 ảnh làm slider)</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map((idx) => (
                        <ImageUpload 
                          key={idx}
                          value={banners[idx]} 
                          onChange={(url) => {
                            const newBanners = [...banners];
                            newBanners[idx] = url;
                            setBanners(newBanners);
                          }} 
                          folder="businesses/banners"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Deals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-lg">3. Các Gói Ưu Đãi</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setDeals([...deals, { id: `deal-${Date.now()}`, title: "", original_price: "", promo_price: "", note: "", badge: "" }])}>
                    <Plus className="size-4 mr-2" /> Thêm Ưu Đãi
                  </Button>
                </div>
                {deals.map((deal, index) => (
                  <div key={deal.id} className="p-4 bg-muted/50 rounded-xl space-y-3 relative">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => setDeals(deals.filter((_, i) => i !== index))}>
                      <Trash2 className="size-4" />
                    </Button>
                    <div className="grid grid-cols-12 gap-3 pr-8">
                      <div className="col-span-12 md:col-span-6">
                        <Input placeholder="Tên Gói Ưu Đãi (Vd: Trị mụn chuyên sâu)" value={deal.title} onChange={e => { const nd = [...deals]; nd[index].title = e.target.value; setDeals(nd); }} />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <Input placeholder="Giá gốc (Vd: 500000)" value={deal.original_price} onChange={e => { const nd = [...deals]; nd[index].original_price = e.target.value; setDeals(nd); }} />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <Input placeholder="Giá KM (Vd: 199000)" value={deal.promo_price} onChange={e => { const nd = [...deals]; nd[index].promo_price = e.target.value; setDeals(nd); }} />
                      </div>
                      <div className="col-span-8">
                        <Input placeholder="Ghi chú (Vd: Dành cho khách mới)" value={deal.note} onChange={e => { const nd = [...deals]; nd[index].note = e.target.value; setDeals(nd); }} />
                      </div>
                      <div className="col-span-4">
                        <Input placeholder="Badge (Vd: HOT)" value={deal.badge} onChange={e => { const nd = [...deals]; nd[index].badge = e.target.value; setDeals(nd); }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-lg">4. Danh mục Dịch Vụ</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setServices([...services, { id: `srv-${Date.now()}`, name: "", price: "", description: "", image_url: "" }])}>
                    <Plus className="size-4 mr-2" /> Thêm Dịch Vụ
                  </Button>
                </div>
                {services.map((srv, index) => (
                  <div key={srv.id} className="p-4 bg-muted/50 rounded-xl space-y-3 relative">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => setServices(services.filter((_, i) => i !== index))}>
                      <Trash2 className="size-4" />
                    </Button>
                    <div className="grid grid-cols-12 gap-3 pr-8">
                      <div className="col-span-8">
                        <Input placeholder="Tên dịch vụ" value={srv.name} onChange={e => { const ns = [...services]; ns[index].name = e.target.value; setServices(ns); }} />
                      </div>
                      <div className="col-span-4">
                        <Input placeholder="Giá (Vd: 300000)" value={srv.price} onChange={e => { const ns = [...services]; ns[index].price = e.target.value; setServices(ns); }} />
                      </div>
                      <div className="col-span-12">
                        <Input placeholder="Mô tả ngắn" value={srv.description} onChange={e => { const ns = [...services]; ns[index].description = e.target.value; setServices(ns); }} />
                      </div>
                      <div className="col-span-12">
                        <label className="text-sm font-medium mb-1 block">Ảnh Dịch Vụ</label>
                        <ImageUpload 
                          value={srv.image_url} 
                          onChange={url => { const ns = [...services]; ns[index].image_url = url; setServices(ns); }} 
                          folder="businesses/services"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>
        
        <div className="p-4 border-t bg-muted/30 flex justify-end gap-2">
          {!successData && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button form="promo-form" type="submit" disabled={loading} className="bg-gold text-ink hover:bg-gold/90 font-bold">
                {loading ? "Đang xử lý..." : "TẠO TRANG ƯU ĐÃI NAY"}
              </Button>
            </>
          )}
          {successData && (
            <Button onClick={() => onOpenChange(false)}>Đóng</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
