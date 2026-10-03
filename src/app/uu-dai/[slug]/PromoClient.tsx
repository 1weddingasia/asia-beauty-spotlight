"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Phone, CheckCircle2, Tag, MessageCircle, Clock, Globe, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useEffect } from "react";

const ChatWidget = dynamic(() => import("@/components/site/ChatWidget").then(mod => mod.ChatWidget), {
  ssr: false, // Tắt SSR cho Chat Widget để giảm gánh nặng server và tải nhanh trang
});

type Deal = {
  id: string;
  title: string;
  original_price: number | string;
  promo_price: number | string;
  badge?: string;
  note?: string;
  status?: string;
};

export default function PromoClient({ business, bannerImg, avatar }: { business: any, bannerImg: string, avatar: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState("");
  
  // Modal state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  
  // Carousel state
  const [api, setApi] = useState<CarouselApi>();

  // Tự động chuyển slide
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  // Tải danh sách deal đã lưu từ localStorage
  if (typeof window !== 'undefined' && savedDeals.length === 0) {
    const local = localStorage.getItem('saved_deals_1beauty');
    if (local) {
      try {
        setSavedDeals(JSON.parse(local));
      } catch (e) {}
    }
  }

  // Lấy danh sách deals từ JSON
  let rawDeals: Deal[] = Array.isArray(business.page_content?.deals) ? business.page_content.deals : [];
  
  // Tương thích ngược: Nếu tiệm chưa cấu hình deals mảng, lấy từ offers cũ
  if (rawDeals.length === 0) {
    if (Array.isArray(business.page_content?.offers) && business.page_content.offers.length > 0) {
      rawDeals = business.page_content.offers.map((o: any, i: number) => ({
        id: `legacy-offer-${i}`,
        title: o.title || "",
        original_price: "Liên hệ",
        promo_price: o.promo_price || o.discount || "Ưu đãi",
        badge: o.badge || "Hot",
        note: o.description || o.note || (o.validUntil ? `HSD: ${o.validUntil}` : ""),
        status: "active"
      }));
    }
  }

  // Lọc deal đang chạy và giới hạn 5 deal
  const deals = rawDeals
    .filter(d => d.status !== 'paused')
    .slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09)\d{8}$/.test(cleanPhone)) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    // Kiểm tra xem đã lưu ưu đãi này chưa
    const dealKey = `${business.id}_${selectedDeal.id}_${cleanPhone}`;
    if (savedDeals.includes(dealKey)) {
      toast.error("Bạn đã nhận ưu đãi này rồi. Vui lòng chọn ưu đãi khác.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          customer_name: name,
          customer_phone: phone,
          deal_name: selectedDeal.title
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
      } else if (!data.voucher_code) {
        toast.error("Không nhận được mã ưu đãi. Vui lòng thử lại.");
      } else {
        setVoucher(data.voucher_code);
        toast.success("Lưu ưu đãi thành công!");
        
        // Lưu vào localStorage
        const updatedSavedDeals = [...savedDeals, dealKey];
        setSavedDeals(updatedSavedDeals);
        localStorage.setItem('saved_deals_1beauty', JSON.stringify(updatedSavedDeals));
      }
    } catch (err) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  };

  const services = Array.isArray(business.page_content?.services) ? business.page_content.services : [];

  const hotline = business.page_content?.phone || "1900 xxxx";

  const formatPrice = (price: number | string) => {
    if (!price) return "";
    
    if (typeof price === 'string') {
      const trimmed = price.trim();
      // Nếu là số thuần túy (có thể có khoảng trắng) thì format, nếu không thì giữ nguyên chữ (VD: "Liên hệ")
      if (/^\d+$/.test(trimmed)) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(trimmed));
      }
      return price;
    }
    
    if (typeof price === 'number' && price > 0) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
    
    return price;
  };

  const b = business;
  const zaloNumber = b.zalo || (hotline ? hotline.replace(/[^0-9]/g, '') : '');
  const zaloLink = zaloNumber ? (zaloNumber.startsWith('http') ? zaloNumber : `https://zalo.me/${zaloNumber}`) : '#';

  const banners = Array.isArray(b.page_content?.banners) && b.page_content.banners.length > 0
    ? b.page_content.banners 
    : [bannerImg];

  return (
    <div className="min-h-screen bg-[#FCFAF5] pb-20 md:pb-0">
      {/* Premium Hero Section */}
      <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden group">
        <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {banners.map((img: string, idx: number) => (
              <CarouselItem key={idx} className="relative h-[75vh] md:h-[85vh] w-full">
                <Image src={img} alt={`${business.name} - slide ${idx + 1}`} fill sizes="100vw" quality={100} className="object-cover scale-105 animate-ken-burns" priority={idx === 0} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {banners.length > 1 && (
            <div className="absolute inset-y-0 w-full flex items-center justify-between px-4 pointer-events-none z-20">
              <CarouselPrevious className="relative left-0 pointer-events-auto bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12" />
              <CarouselNext className="relative right-0 pointer-events-auto bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12" />
            </div>
          )}
        </Carousel>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/90 pointer-events-none z-10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
          <div className="size-24 md:size-32 rounded-full border-4 border-gold overflow-hidden bg-white shadow-2xl mb-6 relative">
            <Image src={avatar} alt="Logo" fill sizes="(max-width: 768px) 96px, 128px" className="object-cover" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-xl tracking-tight mb-3">
            {business.name}
          </h1>
          <p className="text-champagne/90 text-sm md:text-lg flex items-center gap-2 mb-2 max-w-2xl text-center">
            <MapPin className="size-5 shrink-0" /> {business.address || "Đang cập nhật địa chỉ"}
          </p>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white font-medium shadow-xl mt-4">
            <Phone className="size-4 text-gold" /> {hotline}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 -mt-16 md:-mt-24 relative z-10">
        <div className="text-center mb-10 bg-gradient-to-b from-white to-champagne/40 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl shadow-gold/5 border border-gold/30 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-ink flex flex-col md:flex-row items-center justify-center gap-3">
            <Tag className="size-8 md:size-10 text-gold" />
            ƯU ĐÃI ĐỘC QUYỀN
          </h2>
          <p className="text-muted-foreground mt-4 text-base md:text-lg">
            Chọn một ưu đãi bên dưới và lưu lại để sử dụng khi đến tiệm.
          </p>
        </div>

        {/* Danh sách Deals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deals.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-dashed">
              <p className="text-muted-foreground">Hiện tại chưa có chương trình ưu đãi nào đang mở.</p>
            </div>
          ) : (
            deals.map(deal => (
              <div 
                key={deal.id} 
                onClick={() => {
                  setSelectedDeal(deal);
                  setVoucher("");
                  setIsDialogOpen(true);
                }}
                className="group rounded-3xl bg-white p-1.5 shadow-xl shadow-gold/10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer flex flex-col h-full border border-gold/20"
              >
                <div className="rounded-[1.4rem] border border-gold/30 bg-gradient-to-br from-white to-champagne/50 p-6 md:p-8 flex flex-col h-full relative">
                  {deal.badge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                      {deal.badge}
                    </div>
                  )}
                  
                  <h3 className="text-xl md:text-2xl font-bold text-ink pr-20 leading-tight mb-3">
                    {deal.title}
                  </h3>
                  
                  {deal.note && (
                    <p className="text-sm text-muted-foreground mb-8 bg-champagne/30 p-4 rounded-2xl border border-gold/20 shadow-sm grow">
                      <span className="font-semibold text-ink">Lưu ý:</span> {deal.note}
                    </p>
                  )}
                  
                  <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mt-auto pt-6 border-t border-gold/20">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground line-through mb-1">
                        {formatPrice(deal.original_price)}
                      </div>
                      <div className="text-3xl font-black text-red-600 leading-none">
                        {formatPrice(deal.promo_price)}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn onClick thẻ cha chạy 2 lần
                        setSelectedDeal(deal);
                        setVoucher("");
                        setIsDialogOpen(true);
                      }}
                      className="w-full xl:w-auto bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-ink font-bold hover:brightness-110 shadow-lg h-12 md:h-14 px-8 rounded-2xl text-base transition-all active:scale-95 group-hover:scale-105 border border-[#D4AF37]/50"
                    >
                      Nhận và Lưu Ưu Đãi
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Danh sách Dịch vụ / Sản phẩm */}
        {services.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl md:text-3xl font-black text-ink text-center mb-10 flex items-center justify-center gap-3">
              <Sparkles className="size-6 md:size-8 text-gold" />
              DANH MỤC DỊCH VỤ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any, index: number) => (
                <div key={index} className="bg-white rounded-3xl p-5 shadow-sm border border-gold/20 flex flex-row gap-4 items-center transition-all duration-500 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1.5 hover:scale-105 hover:border-gold/50 cursor-pointer group">
                  {service.image_url && (
                    <div className="size-24 rounded-2xl overflow-hidden relative shrink-0 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <Image src={service.image_url} alt={service.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-ink line-clamp-2">{service.name}</h4>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                    )}
                    <div className="mt-2 font-bold text-gold">
                      {formatPrice(service.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thông tin doanh nghiệp (About & Contact) */}
        <div className="mt-20 pt-16 border-t border-slate-200">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-ink">VỀ CHÚNG TÔI</h2>
            <p className="text-muted-foreground mt-2">Thông tin liên hệ và không gian của {b.name}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {b.short_description && (
                <p className="text-lg font-medium text-ink leading-relaxed">
                  {b.short_description}
                </p>
              )}
              <div 
                className="text-sm md:text-base text-muted-foreground leading-relaxed prose prose-slate"
                dangerouslySetInnerHTML={{ __html: b.about || b.description || "Đang cập nhật giới thiệu chi tiết về doanh nghiệp." }}
              />
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit space-y-5">
              <h3 className="font-bold text-xl border-b pb-3">Liên Hệ & Đặt Lịch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{b.address || "Đang cập nhật"}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-gold shrink-0" />
                  <span className="text-sm font-medium">{hotline}</span>
                </div>
                
                {(b.socials?.facebook) && (
                  <div className="flex items-center gap-3">
                    <Globe className="size-5 text-gold shrink-0" />
                    <a href={b.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gold hover:underline line-clamp-1">Facebook Fanpage</a>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Clock className="size-5 text-gold shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    {Array.isArray(b.hours) ? (
                      b.hours.map((wh: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{wh.day}</span>
                          <span className="font-medium">{wh.hours}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">{b.hours || "Đang cập nhật"}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {b.address && (
                <div className="mt-4 rounded-xl overflow-hidden border h-[150px] bg-slate-100">
                  <iframe
                    width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((b.address || '') + ' ' + (b.name || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Dialog Form Nhận Mã */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setName("");
          setPhone("");
          setVoucher("");
          setSelectedDeal(null);
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-ink leading-tight">
              {voucher ? "🎉 Giữ chỗ thành công!" : "Điền thông tin giữ chỗ"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {!voucher && <span className="font-semibold text-gold mt-2 block">{selectedDeal?.title}</span>}
            </DialogDescription>
          </DialogHeader>

          {!voucher ? (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Input 
                  placeholder="Họ và tên của bạn (Tùy chọn)" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="h-12 bg-muted/50 rounded-xl"
                />
              </div>
              <div>
                <Input 
                  type="tel" 
                  required 
                  placeholder="Số điện thoại Zalo (*)" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="h-12 bg-muted/50 font-medium rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold bg-gold text-ink hover:bg-gold/90 shadow-lg shadow-gold/20 rounded-xl" disabled={loading}>
                {loading ? "Đang xử lý..." : "XÁC NHẬN GIỮ CHỖ"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-ink mb-1">Lưu ưu đãi thành công! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-5">Bạn chỉ cần đọc <strong>số điện thoại</strong> cho lễ tân khi đến tiệm.</p>

              {/* Mã ưu đãi = Số điện thoại */}
              <div className="rounded-2xl border-2 border-gold bg-gradient-to-b from-yellow-50 to-amber-50 px-5 py-4 mb-3 text-left shadow-inner">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Mã ưu đãi của bạn</p>
                <p className="text-3xl font-black tracking-widest text-gold">{phone}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">Khi đến tiệm, đọc số này cho lễ tân để nhận ngay mức giá ưu đãi</p>
              </div>

              {/* Gói đã chọn */}
              <div className="rounded-xl border border-border bg-white px-4 py-3 mb-5 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Gói ưu đãi</p>
                <p className="text-sm font-bold text-ink leading-snug">{selectedDeal?.title}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
                  <Link href={`tel:${hotline.replace(/\D/g, '')}`}>
                    <Phone className="mr-2 size-5" /> Đặt lịch qua Hotline
                  </Link>
                </Button>
                
                {hotline && hotline.replace(/\D/g, '').length >= 9 && (
                  <Button asChild variant="outline" className="w-full h-12 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl">
                    <Link href={`https://zalo.me/${hotline.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 size-5" /> Xác nhận qua Zalo
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ChatWidget key={business.id} businessId={business.id} businessName={business.name} />
      
      <div className="mt-16 pb-8 text-center px-4">
        <p className="text-xs text-muted-foreground">
          Cổng đặt hẹn bảo trợ bởi 1Beauty.asia – Hotline hỗ trợ: <span className="font-semibold text-ink">090 909 0909</span>
        </p>
      </div>
    </div>
  );
}
