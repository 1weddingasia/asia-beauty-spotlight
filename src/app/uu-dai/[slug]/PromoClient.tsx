"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, CheckCircle2, Ticket } from "lucide-react";
import { toast } from "sonner";

export default function PromoClient({ business, bannerImg, avatar }: { business: { id: string, name: string, slug: string, address: string, page_content: any }, bannerImg: string, avatar: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState("");

  const dealName = business.page_content?.featured_deal || "Giảm ngay 20% cho lần đầu trải nghiệm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          deal_name: dealName
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
      } else if (!data.voucher_code) {
        toast.error("Không nhận được mã ưu đãi. Vui lòng thử lại.");
      } else {
        setVoucher(data.voucher_code);
        toast.success("Nhận ưu đãi thành công!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const hotline = business.page_content?.phone || "1900 xxxx";

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image src={bannerImg} alt={business.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <div className="size-16 md:size-24 rounded-full border-4 border-gold overflow-hidden bg-white shrink-0 shadow-lg">
            <Image src={avatar} alt="Logo" width={96} height={96} className="w-full h-full object-cover" />
          </div>
          <div className="pb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white shadow-sm">{business.name}</h1>
            <p className="text-champagne text-sm md:text-base flex items-center gap-1 mt-1 opacity-90">
              <MapPin className="size-4" /> {business.address || "Đang cập nhật địa chỉ"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Deal Card */}
        <div className="rounded-2xl border-2 border-gold/30 bg-white p-6 text-center shadow-luxe relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-b-lg">
            Độc Quyền 1Beauty
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-ink mt-4 mb-2">
            {dealName}
          </h2>
          
          <div className="flex justify-center items-center gap-3 mt-4">
            <span className="text-muted-foreground line-through text-lg">999.000đ</span>
            <span className="text-red-600 font-black text-3xl">Chỉ còn 0đ</span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 italic">
            Số lượng có hạn. Áp dụng cho khách hàng đăng ký hôm nay.
          </p>
        </div>

        {/* Action Form or Success state */}
        {!voucher ? (
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-4">Điền thông tin nhận mã:</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input 
                  placeholder="Họ và tên của bạn (Tùy chọn)" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="h-12 bg-muted/50"
                />
              </div>
              <div>
                <Input 
                  type="tel" 
                  required 
                  placeholder="Số điện thoại Zalo (*)" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="h-12 bg-muted/50 font-medium"
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-gold text-ink hover:bg-gold/90 shadow-lg shadow-gold/20" disabled={loading}>
                {loading ? "Đang xử lý..." : "NHẬN MÃ ƯU ĐÃI NGAY"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-white p-8 shadow-luxe text-center border border-green-100 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-2xl text-green-700 mb-2">Đăng ký thành công!</h3>
            <p className="text-muted-foreground mb-6">Bạn hãy chụp lại màn hình này và đưa cho nhân viên khi đến nhé.</p>
            
            <div className="inline-flex items-center justify-center gap-2 border-2 border-dashed border-green-500 bg-white rounded-xl px-6 py-4 mb-6 relative">
              <Ticket className="size-6 text-green-600" />
              <span className="text-3xl font-black tracking-widest text-ink">{voucher}</span>
            </div>
            
            <Button asChild className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold">
              <Link href={`tel:${hotline.replace(/\D/g, '')}`}>
                <Phone className="mr-2 size-5" /> Gọi điện đặt lịch ngay
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-12 mt-3 font-semibold">
              <Link href={`/doanh-nghiep/${business.slug}`}>
                Xem chi tiết tiệm
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
