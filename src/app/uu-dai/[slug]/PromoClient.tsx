"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Phone, CheckCircle2, Ticket, Tag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

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

export default function PromoClient({ business, bannerImg, avatar }: { business: { id: string, name: string, slug: string, address: string, page_content: any }, bannerImg: string, avatar: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState("");
  
  // Modal state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Lấy danh sách deals từ JSON
  let rawDeals: Deal[] = Array.isArray(business.page_content?.deals) ? business.page_content.deals : [];
  
  // Tương thích ngược: Nếu tiệm chưa cấu hình deals mảng, tạo 1 deal mặc định từ featured_deal cũ
  if (rawDeals.length === 0) {
    rawDeals = [
      {
        id: "default-1",
        title: business.page_content?.featured_deal || "Giảm ngay 20% cho lần đầu trải nghiệm",
        original_price: "Liên hệ tiệm",
        promo_price: "Ưu đãi sốc",
        badge: "Độc quyền 1Beauty",
        status: "active"
      }
    ];
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
    
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          customer_name: name,
          customer_phone: phone,
          deal_name: selectedDeal.title // Gửi chính xác tên Deal khách chọn
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
      } else if (!data.voucher_code) {
        toast.error("Không nhận được mã ưu đãi. Vui lòng thử lại.");
      } else {
        setVoucher(data.voucher_code);
        toast.success("Giữ chỗ ưu đãi thành công!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      {/* Cover Image */}
      <div className="relative h-80 md:h-[450px] w-full overflow-hidden">
        <Image src={bannerImg} alt={business.name} fill sizes="100vw" quality={85} className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <div className="size-16 md:size-24 rounded-full border-4 border-gold overflow-hidden bg-white shrink-0 shadow-lg relative">
            <Image src={avatar} alt="Logo" fill sizes="(max-width: 768px) 64px, 96px" className="object-cover" />
          </div>
          <div className="pb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white shadow-sm">{business.name}</h1>
            <p className="text-champagne text-sm md:text-base flex items-center gap-1 mt-1 opacity-90">
              <MapPin className="size-4" /> {business.address || "Đang cập nhật địa chỉ"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Tag className="size-5 text-gold" />
            Ưu đãi đặc quyền
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Đăng ký giữ chỗ ngay hôm nay để nhận mức giá tốt nhất. Số lượng có hạn!
          </p>
        </div>

        {/* Danh sách Deals */}
        <div className="space-y-4">
          {deals.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-2xl border">
              <p className="text-muted-foreground">Hiện tại chưa có chương trình ưu đãi nào đang mở.</p>
            </div>
          ) : (
            deals.map(deal => (
              <div key={deal.id} className="rounded-2xl border border-border/50 bg-white p-5 shadow-card relative overflow-hidden transition-all hover:border-gold/50">
              {deal.badge && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg shadow-sm">
                    {deal.badge}
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-ink pr-16 leading-tight mb-2">
                  {deal.title}
                </h3>
                
                {deal.note && (
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    * {deal.note}
                  </p>
                )}
                
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-dashed">
                  <div>
                    <div className="text-sm text-muted-foreground line-through mb-1">
                      {formatPrice(deal.original_price)}
                    </div>
                    <div className="text-2xl font-black text-red-600 leading-none">
                      {formatPrice(deal.promo_price)}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setSelectedDeal(deal);
                      setVoucher("");
                      setIsDialogOpen(true);
                    }}
                    className="bg-gold text-ink font-bold hover:bg-gold/90 shadow-md shadow-gold/20 h-10 px-6 rounded-xl"
                  >
                    Giữ Chỗ Ngay
                  </Button>
                </div>
              </div>
            ))
          )}
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
              <p className="text-sm text-muted-foreground mb-6">Bạn hãy chụp lại màn hình này và đưa cho nhân viên khi đến nhé.</p>
              
              <div className="inline-flex items-center justify-center gap-2 border-2 border-dashed border-green-500 bg-green-50 rounded-xl px-6 py-4 mb-6 relative w-full">
                <Ticket className="size-6 text-green-600 shrink-0" />
                <span className="text-2xl font-black tracking-widest text-ink">{voucher}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
                  <Link href={`tel:${hotline.replace(/\D/g, '')}`}>
                    <Phone className="mr-2 size-5" /> Gọi Hotline Tiệm Ngay
                  </Link>
                </Button>
                
                {hotline && hotline.replace(/\D/g, '').length >= 9 && (
                  <Button asChild variant="outline" className="w-full h-12 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl">
                    <Link href={`https://zalo.me/${hotline.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 size-5" /> Nhắn Zalo Cho Tiệm
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
