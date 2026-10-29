"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  MapPin, Phone, CheckCircle2, Tag, MessageCircle, Clock, Globe, Mail, Sparkles,
  ChevronLeft, ChevronRight, X, BadgeCheck, Gift, Calendar, Eye, Users, Wine,
  DoorClosed, Share2, Check, CalendarCheck, Utensils, type LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader, SiteFooter, useSiteConfig } from "@/components/site/Layout";
import { PARTY_SPACES, PARTY_PERKS, type BusinessPartyProfile, isFnBCategory } from "@/types/party";
import { getExpoEventName } from "@/types/expo";

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
  valid_from?: string;
  valid_until?: string;
  terms?: string;
};

const INDUSTRY_CTAS: Record<string, { btnText: string, modalTitle: string, icon: LucideIcon }> = {
  'fashion': { btnText: 'Nhận Tư Vấn', modalTitle: 'Tư Vấn & Mua Sắm', icon: MessageCircle },
  'sports': { btnText: 'Đặt Sân Ngay', modalTitle: 'Đặt Sân & Đăng Ký', icon: Calendar },
  'sport': { btnText: 'Đặt Sân Ngay', modalTitle: 'Đặt Sân & Đăng Ký', icon: Calendar },
  'health': { btnText: 'Đặt Lịch Khám', modalTitle: 'Đặt Lịch Khám', icon: Calendar },
  'clinic': { btnText: 'Đặt Lịch Khám', modalTitle: 'Đặt Lịch Khám', icon: Calendar },
  'dining': { btnText: 'Đặt Bàn Ngay', modalTitle: 'Đặt Bàn & Giữ Chỗ', icon: Calendar },
  'fnb': { btnText: 'Đặt Bàn Ngay', modalTitle: 'Đặt Bàn & Giữ Chỗ', icon: Calendar },
  'auto': { btnText: 'Đặt Lịch Dịch Vụ', modalTitle: 'Đặt Lịch Chăm Sóc Xe', icon: Calendar },
  'fitness': { btnText: 'Đăng Ký Tập', modalTitle: 'Đăng Ký & Đặt Lịch', icon: Calendar },
  'beauty': { btnText: 'Đặt Lịch Làm Đẹp', modalTitle: 'Đặt Lịch & Tư Vấn', icon: Sparkles },
  'studio': { btnText: 'Đặt Lịch Chụp', modalTitle: 'Đặt Lịch Chụp Ảnh', icon: Calendar },
  'pet': { btnText: 'Đặt Lịch Chăm Sóc', modalTitle: 'Đặt Lịch Cho Thú Cưng', icon: Calendar },
  'repair': { btnText: 'Gọi Thợ Ngay', modalTitle: 'Yêu Cầu Dịch Vụ', icon: Clock },
  'travel': { btnText: 'Đặt Phòng / Tour', modalTitle: 'Đặt Phòng & Tour', icon: Globe },
  'consulting': { btnText: 'Đặt Lịch Tư Vấn', modalTitle: 'Tư Vấn 1:1', icon: MessageCircle },
  'generic': { btnText: 'Liên Hệ Ngay', modalTitle: 'Liên Hệ Với Chúng Tôi', icon: MessageCircle },
  'other': { btnText: 'Liên Hệ Ngay', modalTitle: 'Liên Hệ Với Chúng Tôi', icon: MessageCircle }
};

export default function PromoClient({
  business,
  bannerImg,
  avatar,
  partyProfile,
  expoProfile,
}: {
  business: any;
  bannerImg: string | null;
  avatar: string;
  partyProfile?: BusinessPartyProfile | null;
  expoProfile?: { booth_number: string; event_name?: string | null; event_name_en?: string | null } | null;
}) {
  const siteConfig = useSiteConfig();
  const b = business;
  const industryKey = b.page_content?.industry || b.category_slug || 'other';
  const ctaConfig = INDUSTRY_CTAS[industryKey] || INDUSTRY_CTAS['other'];
  const actionName = b.page_content?.action_name || ctaConfig.btnText;
  const modalTitle = ctaConfig.modalTitle;
  const actionNameUpper = actionName.toUpperCase();
  const ActionIcon = ctaConfig.icon;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState("");

  // Modal state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCrossSells, setSelectedCrossSells] = useState<string[]>([]);

  // Booking fields
  const [bookingTime, setBookingTime] = useState("");
  const [bookingService, setBookingService] = useState("");
  const [partyGuests, setPartyGuests] = useState("20");
  const [partyNotes, setPartyNotes] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const shareTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  const handleShareZalo = async () => {
    const shareUrl = typeof window !== 'undefined'
      ? window.location.href
      : `https://${siteConfig.domain || '1booking.asia'}/${business.slug}`;
    const text = `🎉 Tham khảo tiệc Tất Niên tại ${business.name}!\n📍 Địa chỉ: ${business.address || ''}\n🎁 Ưu đãi: ${partyProfile?.party_deal_highlight || 'Nhiều ưu đãi tiệc hấp dẫn'}\n👉 Xem chi tiết & thực đơn tại: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
      setCopiedShare(true);
      toast.success("Đã sao chép thông tin tiệc & đường dẫn!");
      shareTimerRef.current = setTimeout(() => setCopiedShare(false), 3000);
    } catch {
      toast.error("Không thể tự động sao chép. Hãy chia sẻ đường dẫn trên trình duyệt.");
    }
  };

  const [interceptType, setInterceptType] = useState<'hotline' | 'zalo' | null>(null);
  const [interceptPhone, setInterceptPhone] = useState("");
  const [interceptName, setInterceptName] = useState("");
  const [interceptLoading, setInterceptLoading] = useState(false);

  // Page views tracking
  const [views, setViews] = useState<{ real: number; random: number; total: number } | null>(null);

  useEffect(() => {
    if (!business?.slug) return;
    // Don't track views in admin mode (if there was a way to know, but for now we track all)
    // Actually, simple fetch is fine
    fetch(`/api/businesses/${business.slug}/view`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.total_views) {
          setViews({ real: data.page_views, random: data.random_views, total: data.total_views });
        }
      })
      .catch(err => console.error("View tracking error:", err));
  }, [business?.slug]);

  // Carousel state
  const [api, setApi] = useState<CarouselApi>();
  const [servicesRef, servicesApi] = useEmblaCarousel({ loop: false, align: "start" });
  const scrollPrevServices = useCallback(() => servicesApi && servicesApi.scrollPrev(), [servicesApi]);
  const scrollNextServices = useCallback(() => servicesApi && servicesApi.scrollNext(), [servicesApi]);

  // Tự động chuyển slide
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  // Tải danh sách deal đã lưu từ localStorage
  useEffect(() => {
    if (savedDeals.length === 0) {
      const local = localStorage.getItem(`saved_deals_${siteConfig.domain}`);
      if (local) {
        try {
          setSavedDeals(JSON.parse(local));
        } catch (e) { }
      }
    }
  }, [siteConfig.domain, savedDeals.length]);

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
        note: o.description || o.note || "",
        status: "active",
        valid_until: o.validUntil || o.valid_until || ""
      }));
    }
  }

  // Lọc deal đang chạy và giới hạn 5 deal
  const deals = rawDeals
    .filter(d => d.status !== 'paused')
    .slice(0, 5);

  const rawCrossSells = Array.isArray(business.page_content?.cross_sells) ? business.page_content.cross_sells : [];
  const crossSells = rawCrossSells.filter((c: any) => c.status !== 'paused');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09)\d{8}$/.test(cleanPhone)) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    const isPartyBooking = selectedDeal.id === 'party-booking';
    const isBooking = selectedDeal.id === 'booking' || isPartyBooking;

    if (isPartyBooking) {
      const parsedGuests = parseInt(partyGuests, 10);
      if (isNaN(parsedGuests) || parsedGuests <= 0) {
        toast.error("Vui lòng nhập số lượng khách dự kiến hợp lệ (lớn hơn 0)");
        return;
      }
    }

    // Kiểm tra xem đã lưu ưu đãi này chưa
    const dealKey = `${business.id}_${selectedDeal.id}_${cleanPhone}`;
    // Nếu là chế độ Booking, không cần lưu mảng savedDeals chặn duplicate
    if (!isBooking) {
      if (savedDeals.includes(dealKey)) {
        toast.error("Bạn đã nhận ưu đãi này rồi. Vui lòng chọn ưu đãi khác.");
        return;
      }
    }

    setLoading(true);
    try {
      let actualDealName = selectedDeal.title;
      if (isPartyBooking) {
        actualDealName = `[TIỆC TẤT NIÊN] ${selectedDeal.title}`;
      } else if (selectedDeal.id === 'booking') {
        actualDealName = bookingService || selectedDeal.title;
      }

      let bTime: string | null = null;
      if (isPartyBooking) {
        bTime = bookingTime?.trim()
          ? `${bookingTime.trim()} • Quy mô: ${partyGuests} khách`
          : `Quy mô: ${partyGuests} khách`;
      } else if (selectedDeal.id === 'booking') {
        bTime = bookingTime?.trim() || null;
      }

      const crossSellStr = (isPartyBooking
        ? (partyNotes || selectedCrossSells.join(", "))
        : selectedCrossSells.join(", ")
      ).slice(0, 450);

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          customer_name: name || 'Khách đặt tiệc',
          customer_phone: cleanPhone,
          deal_name: actualDealName,
          cross_sell_items: crossSellStr || null,
          booking_time: bTime
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
      } else if (!data.voucher_code) {
        toast.error("Không nhận được mã ưu đãi. Vui lòng thử lại.");
      } else {
        setVoucher(data.voucher_code);
        toast.success(isPartyBooking ? "Đã gửi yêu cầu đặt tiệc thành công! Quán sẽ gọi xác nhận trong 5 phút." : "Lưu ưu đãi thành công!");

        // Lưu vào localStorage nếu không phải booking
        if (!isBooking) {
          const updatedSavedDeals = [...savedDeals, dealKey];
          setSavedDeals(updatedSavedDeals);
          localStorage.setItem(`saved_deals_${siteConfig.domain}`, JSON.stringify(updatedSavedDeals));
        }
      }
    } catch (err) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  };

  const rawHotline = business.page_content?.phone || business.phone;
  const hotline = rawHotline || "(Chưa công khai)";
  const hotlineDigits = rawHotline ? rawHotline.replace(/[^0-9]/g, '') : '';
  const zaloNumber = business.zalo || hotlineDigits;
  const zaloLink = zaloNumber ? (zaloNumber.startsWith('http') ? zaloNumber : `https://zalo.me/${zaloNumber}`) : '#';
  let mapSrc = null;
  if (typeof business.page_content?.map_embed === 'string') {
    const srcMatch = business.page_content.map_embed.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1].startsWith('http')) {
        mapSrc = srcMatch[1];
    } else if (business.page_content.map_embed.startsWith('http')) {
        mapSrc = business.page_content.map_embed;
    }
  }

  const services = Array.isArray(business.page_content?.services) && business.page_content.services.length > 0
    ? business.page_content.services.filter((s: any) => s.status !== 'paused')
    : Array.isArray(business.services) && business.services.length > 0
      ? business.services.filter((s: any) => s.status !== 'paused')
      : [];

  // Fallback gallery for service images
  const galleryItems = Array.isArray(business.page_content?.gallery) ? business.page_content.gallery : [];


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

  const banners = Array.isArray(business.page_content?.banners) && business.page_content.banners.length > 0
    ? business.page_content.banners
    : bannerImg ? [bannerImg] : [];

  const partySpaces = Array.isArray(partyProfile?.spaces_and_amenities) ? partyProfile.spaces_and_amenities : [];
  const partyPerks = Array.isArray(partyProfile?.party_perks) ? partyProfile.party_perks : [];
  const partyMenus = Array.isArray(partyProfile?.set_menus) ? partyProfile.set_menus : [];
  const rawMenuLink = business.page_content?.menu_url || partyProfile?.party_menu_url || null;
  const menuLink = rawMenuLink && /^https?:\/\//.test(rawMenuLink) ? rawMenuLink : null;

  return (
    <div className="min-h-screen relative transition-colors duration-300 pb-24 md:pb-16 bg-[#FCFAF5] text-ink">
      <SiteHeader solid={false} />

      {/* Premium Hero Section */}
      <div className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden group">
        <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {banners.length > 0 ? (
              banners.map((img: string, idx: number) => (
                <CarouselItem key={idx} className="relative h-[75vh] md:h-[90vh] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {/* Lớp 1 (Mobile): Ambient Glow Backdrop lấp đầy 75vh bằng sắc thái chính của banner */}
                  <div className="absolute inset-0 block md:hidden pointer-events-none overflow-hidden">
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="100vw"
                      quality={40}
                      className="object-cover blur-2xl scale-125 opacity-60"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-slate-950/30" />
                  </div>

                  {/* Lớp 2: Ảnh Banner Chính
                      - Mobile: object-contain hiển thị trọn vẹn 100% chiều ngang banner không bị tràn cắt mất góc
                      - Desktop: object-cover tràn viền điện ảnh 90vh
                  */}
                  <Image
                    src={img}
                    alt={`${business.name} - slide ${idx + 1}`}
                    fill
                    sizes="100vw"
                    quality={85}
                    className="object-contain md:object-cover drop-shadow-2xl transition-transform duration-700"
                    priority={idx === 0}
                  />
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="relative h-[75vh] md:h-[90vh] w-full bg-gradient-to-br from-gold via-gold-soft to-gold" />
            )}
          </CarouselContent>
          {banners.length > 1 && (
            <div className="absolute inset-y-0 w-full flex items-center justify-between px-4 pointer-events-none z-20">
              <CarouselPrevious className="relative left-0 pointer-events-auto bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12" />
              <CarouselNext className="relative right-0 pointer-events-auto bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12" />
            </div>
          )}
        </Carousel>
        <div className={`absolute inset-0 pointer-events-none z-10 ${banners.length > 0 ? 'bg-gradient-to-b from-black/20 via-black/35 to-black/85' : 'bg-gradient-to-b from-black/5 via-black/10 to-black/40'}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-xl tracking-tight mb-3 flex items-center justify-center gap-2">
            {business.name}
            {(business.plan_tier === 'premium' || business.is_featured) && (
              <BadgeCheck className="size-8 md:size-10 text-blue-500 fill-white drop-shadow-md" />
            )}
          </h1>
          {business.short_description && (
            <p className="text-white/90 font-medium text-base md:text-xl max-w-2xl text-center mb-4 italic drop-shadow-md">
              "{business.short_description}"
            </p>
          )}
          <p className="text-champagne/90 text-sm md:text-lg flex items-center gap-2 mb-2 max-w-2xl text-center">
            <MapPin className="size-5 shrink-0" /> {business.address || "Đang cập nhật địa chỉ"}
          </p>
          {/* Category & Location Tags */}
          {((business.categories_list?.length > 0) || (business.locations_list?.length > 0)) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {(business.categories_list || []).map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/danh-muc/${cat.slug}`}
                  className="inline-flex items-center gap-1 bg-gold/20 border border-gold/40 text-gold text-xs font-semibold px-3 py-1 rounded-full hover:bg-gold/30 transition-colors backdrop-blur-sm"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
              {(business.locations_list || []).map((loc: any) => (
                <Link
                  key={loc.slug}
                  href={`/dia-diem/${loc.slug}`}
                  className="inline-flex items-center gap-1 bg-white/15 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  <MapPin className="size-3" />
                  {loc.name}
                </Link>
              ))}
            </div>
          )}

          {/* Expo Exhibitor Badge & Back to Expo Hub */}
          {expoProfile && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <Link
                href={`/expo/${business.slug}`}
                className="inline-flex items-center gap-1.5 bg-amber-500/25 border border-amber-400 text-amber-200 hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-full hover:bg-amber-500/40 transition-all backdrop-blur-md shadow-lg"
              >
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Booth {expoProfile.booth_number} • {getExpoEventName(expoProfile, 'vi')}</span>
              </Link>
              <Link
                href="/expo"
                className="inline-flex items-center gap-1.5 bg-black/40 border border-white/20 text-white/90 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/60 transition-all backdrop-blur-md"
              >
                <ChevronLeft className="size-3.5" />
                <span>Về Danh Bạ Expo</span>
              </Link>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-6 md:mt-8">
            <button
              onClick={() => {
                document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 bg-champagne text-gold font-bold px-8 py-3.5 md:py-3 rounded-full shadow-lg border border-gold/30 hover:bg-gold hover:text-white transition-all hover:scale-105 w-64 sm:w-auto"
            >
              <Gift className="size-5" /> NHẬN ƯU ĐÃI
            </button>
            <button
              onClick={() => {
                setBookingService("");
                setSelectedDeal({ id: 'booking', title: modalTitle, original_price: '', promo_price: '', valid_until: '' });
                setIsDialogOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-soft text-ink font-black px-8 py-3.5 md:py-3 rounded-full shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all hover:scale-105 w-64 sm:w-auto hover:brightness-110"
            >
              <ActionIcon className="size-5" /> {actionNameUpper}
            </button>
            {menuLink && (
              <a
                href={menuLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/95 hover:bg-white text-ink font-bold px-7 py-3.5 md:py-3 rounded-full shadow-lg border border-gold/40 hover:scale-105 transition-all w-64 sm:w-auto"
              >
                <Utensils className="size-5 text-amber-600" />
                <span>Xem Menu Món Ăn</span>
              </a>
            )}
          </div>
          
          {views && (
            <div className="mt-8 flex items-center justify-center gap-2 text-white/90 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-sm border border-gold/20 shadow-lg">
              <Eye className="w-4 h-4 text-gold" />
              <span className="font-medium tracking-wide">
                <span className="text-gold font-bold">{views.total}</span> lượt xem trang
              </span>
            </div>
          )}
        </div>
      </div>
      <div id="deals-section" className="max-w-5xl mx-auto px-4 py-8 md:py-12 -mt-16 md:-mt-24 relative z-10">
        {/* 🌟 BANNER ĐẶC BIỆT KẾT NỐI SANG TRANG ĐẶT TIỆC RIÊNG (KHI QUÁN CÓ KÍCH HOẠT TIỆC) */}
        {partyProfile && partyProfile.is_active && (
          <div className="mb-10 bg-gradient-to-r from-amber-50 via-white to-amber-100/70 rounded-3xl p-6 md:p-8 border border-gold/40 shadow-xl shadow-gold/10 text-left relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>🎉 SẢNH TIỆC TẤT NIÊN & YEAR-END PARTY 2026</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight font-display">
                  {partyProfile.party_deal_highlight || `${business.name} Nhận Đặt Tiệc & Sự Kiện Cuối Năm`}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nhà hàng có không gian sảnh tiệc riêng sang trọng với sức chứa <strong>{partyProfile.min_guests} - {partyProfile.max_guests} khách</strong>
                  {partyProfile.num_vip_rooms > 0 ? `, gồm ${partyProfile.num_vip_rooms} phòng VIP riêng tư` : ''}. Đầy đủ thực đơn set menu & ưu đãi đoàn tiệc.
                </p>
              </div>
              <Link
                href={`/${business.slug}/tiec`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold to-gold-soft hover:brightness-110 text-ink font-black text-sm shadow-lg shadow-gold/30 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <span>Khám Phá Sảnh Tiệc</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 📋 BANNER THỰC ĐƠN / MENU MÓN ĂN TRỰC TUYẾN */}
        {menuLink && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 via-white to-orange-50/70 rounded-3xl p-5 md:p-6 border border-amber-300/80 shadow-lg shadow-amber-500/5 text-left relative overflow-hidden backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center shrink-0 shadow-md">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base md:text-lg text-ink font-display">
                      Thực Đơn &amp; Bảng Giá Món Ăn Chi Tiết
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-900 border border-amber-400/50 px-2.5 py-0.5 rounded-full">
                      Trực Tuyến
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Xem trọn bộ danh sách món ăn, set combo và thực đơn đồ uống được nhà hàng cập nhật trực tiếp.
                  </p>
                </div>
              </div>
              <a
                href={menuLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 w-full sm:w-auto"
              >
                <Utensils className="w-4 h-4" />
                <span>Mở Xem Menu ↗</span>
              </a>
            </div>
          </div>
        )}

        <div className="text-center mb-8 md:mb-10 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-xl max-w-3xl mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-white to-champagne/40 border border-gold/30 shadow-gold/5">
          <div className="mb-6 md:mb-8 w-full flex justify-center">
            <img 
              src={avatar} 
              alt="Logo" 
              className="max-h-20 md:max-h-28 max-w-[90%] md:max-w-[300px] w-auto h-auto object-contain drop-shadow-md" 
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-display flex flex-col md:flex-row items-center justify-center gap-3 text-ink">
            <Tag className="size-8 md:size-10 text-gold" />
            ƯU ĐÃI ĐẶC BIỆT
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Chọn một ưu đãi bên dưới và lưu lại để sử dụng khi đến tiệm.
          </p>
        </div>

        {/* Danh sách Deals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deals.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-dashed md:col-span-2">
              <p className="text-muted-foreground">Hiện tại chưa có chương trình ưu đãi nào đang mở.</p>
            </div>
          ) : (
            deals.map(deal => {
              const now = new Date();
              const isUpcoming = deal.valid_from ? new Date(deal.valid_from) > now : false;
              const isExpired = deal.valid_until ? new Date(deal.valid_until) < now : false;
              const isDisabled = isUpcoming || isExpired;

              const formatDT = (dtStr: string) => {
                if (!dtStr) return '';
                if (!dtStr.includes('T')) return dtStr;
                try {
                  const d = new Date(dtStr);
                  if (isNaN(d.getTime())) return dtStr;
                  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                } catch { return dtStr; }
              };

              return (
                <div
                  key={deal.id}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  onKeyDown={(e) => {
                    if (isDisabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDeal(deal);
                      setVoucher("");
                      setIsDialogOpen(true);
                    }
                  }}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedDeal(deal);
                    setVoucher("");
                    setIsDialogOpen(true);
                  }}
                  className={`group rounded-3xl p-1.5 relative overflow-hidden transition-all duration-500 flex flex-col h-full border ${isDisabled
                      ? 'opacity-60 grayscale cursor-not-allowed border-gray-200'
                      : 'bg-white shadow-xl shadow-gold/10 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer border-gold/20'
                    }`}
                >
                  <div className={`rounded-[1.4rem] border p-5 md:p-8 flex flex-col h-full relative ${
                    isDisabled
                      ? 'bg-gray-50 border-gray-200'
                      : 'border-gold/30 bg-gradient-to-br from-white to-champagne/50'
                  }`}>
                    {isExpired ? (
                      <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                        Đã kết thúc
                      </div>
                    ) : isUpcoming ? (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                        Sắp diễn ra
                      </div>
                    ) : deal.badge ? (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                        {deal.badge}
                      </div>
                    ) : null}

                    <h3 className="text-xl md:text-2xl font-bold font-display pr-20 leading-tight mb-3 text-ink">
                      {deal.title}
                    </h3>

                    {deal.note && (
                      <p className={`text-sm mb-4 p-4 rounded-2xl border shadow-sm text-muted-foreground bg-champagne/30 border-gold/20 ${!deal.terms ? 'grow' : ''}`}>
                        <span className="font-semibold text-ink">Mô tả:</span> {deal.note}
                      </p>
                    )}

                    {deal.terms && (
                      <div className="text-xs mb-4 p-3 rounded-xl border border-dashed grow text-muted-foreground border-gray-200 bg-white/50">
                        <span className="font-semibold block mb-1 text-ink">Điều kiện áp dụng:</span>
                        <p className="whitespace-pre-wrap">{deal.terms}</p>
                      </div>
                    )}

                    {(!deal.note && !deal.terms) && <div className="grow" />}

                    {(deal.valid_from || deal.valid_until) && (
                      <div className={`flex flex-col gap-1 text-xs md:text-sm font-semibold py-1.5 px-3 rounded-lg w-fit mb-4 ${
                        isDisabled ? 'bg-gray-200 text-gray-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {deal.valid_from && (
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            Bắt đầu: {formatDT(deal.valid_from)}
                          </div>
                        )}
                        {deal.valid_until && (
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            Hết hạn: {formatDT(deal.valid_until)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mt-auto pt-6 border-t border-gold/20">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground line-through mb-1">
                          {formatPrice(deal.original_price)}
                        </div>
                        <div className="text-3xl font-black leading-none text-red-600">
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
                        className="w-full xl:w-auto font-bold shadow-lg h-12 md:h-14 px-8 rounded-2xl text-base transition-all active:scale-95 group-hover:scale-105 border bg-gradient-to-r from-gold to-gold-soft text-ink border-gold/50 hover:brightness-110"
                      >
                        Nhận và Lưu Ưu Đãi
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ─── DANH MỤC DỊCH VỤ ─── */}
        {services.length > 0 && (
          <div className="mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase mb-2">Bảng giá</p>
                <h2 className="font-display text-2xl md:text-4xl text-ink">Sản phẩm & Dịch vụ</h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button onClick={scrollPrevServices} className="grid size-10 place-items-center rounded-full border border-border bg-white hover:border-gold hover:text-gold transition-colors">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={scrollNextServices} className="grid size-10 place-items-center rounded-full border border-border bg-white hover:border-gold hover:text-gold transition-colors">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden -mx-4 px-4 md:mx-0 md:px-0" ref={servicesRef}>
              <div className="flex gap-4 md:gap-6">
                {services.map((s: any, idx: number) => (
                  <div key={idx} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
                    <div
                      onClick={() => setSelectedService(s)}
                      className="bg-white border border-border rounded-2xl overflow-hidden h-full flex flex-col hover:border-gold hover:shadow-xl hover:shadow-gold/10 transition-all cursor-pointer group"
                    >
                      <div className="w-full h-40 md:h-48 bg-secondary relative overflow-hidden">
                        {(s.image || s.image_url || galleryItems[idx % galleryItems.length]) ? (
                          <Image
                            src={s.image || s.image_url || galleryItems[idx % galleryItems.length]}
                            alt={s.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="size-8 text-gold/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 md:p-6 flex flex-col flex-1">
                        <h3 className="text-lg md:text-xl font-display text-ink mb-3 group-hover:text-gold transition-colors">{s.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground flex-1 mb-5 leading-relaxed line-clamp-3">
                          {s.description || "Liên hệ để biết thêm chi tiết."}
                        </p>
                        <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                          <span className="font-semibold text-gold text-base md:text-lg">
                            {formatPrice(s.price || s.price_min) || "Liên hệ"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingService(s.name);
                              setSelectedDeal({ id: 'booking', title: actionName, original_price: '', promo_price: '', valid_until: '' });
                              setVoucher("");
                              setIsDialogOpen(true);
                            }}
                            className="mt-2 text-[10px] md:text-xs font-bold text-white bg-gold py-1.5 px-4 rounded-full w-fit hover:bg-ink transition-colors shadow-sm"
                          >
                            {actionName}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── GIỚI THIỆU DOANH NGHIỆP ─── */}
        <div className="mt-20 pt-16 border-t border-border/50">
          <div className="grid lg:grid-cols-5 gap-10 md:gap-12">
            {/* Cột trái: Câu chuyện thương hiệu */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-gold flex-1" />
                <p className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase font-semibold">Câu Chuyện Thương Hiệu</p>
                <div className="h-px bg-gold flex-1" />
              </div>

              {(b.page_content?.description || b.description) && (
                <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
                  {b.page_content?.description || b.description}
                </div>
              )}

              {b.page_content?.amenities && b.page_content.amenities.length > 0 && (
                <div className="pt-6 border-t border-border mt-8">
                  <h3 className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase font-semibold mb-4">Tiện Ích Không Gian</h3>
                  <div className="flex flex-wrap gap-2">
                    {b.page_content.amenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-champagne border border-gold-soft text-ink text-xs px-3 py-1.5 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* THƯ VIỆN ẢNH (GALLERY) */}
              {galleryItems.length > 0 && (
                <div className="pt-8 mt-8 border-t border-border/50">
                  <h3 className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase font-semibold mb-6">Thư Viện Ảnh</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {galleryItems.slice(0, 6).map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group">
                        <Image src={img} alt={`Gallery ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Card liên hệ */}
            <div className="lg:col-span-2 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-card h-fit space-y-6">
              <h3 className="font-display text-lg md:text-xl border-b border-border pb-4">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 md:size-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-muted-foreground leading-relaxed">{b.address || "Đang cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-4 md:size-5 text-gold shrink-0" />
                  <span className="text-xs md:text-sm font-medium">{hotline}</span>
                </div>

                {b.page_content?.price_range && (
                  <div className="flex items-center gap-3">
                    <Tag className="size-4 md:size-5 text-gold shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-foreground">{b.page_content.price_range}</span>
                  </div>
                )}

                {b.socials && (b.socials.facebook || b.socials.tiktok || b.socials.instagram || b.socials.youtube) ? (
                  <div className="flex items-start gap-3">
                    <Globe className="size-4 md:size-5 text-gold shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-2">
                      {b.socials?.facebook && (
                        <a href={b.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-gold hover:underline line-clamp-1">Facebook</a>
                      )}
                      {b.socials?.tiktok && (
                        <a href={b.socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-gold hover:underline line-clamp-1">TikTok</a>
                      )}
                      {b.socials?.instagram && (
                        <a href={b.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-gold hover:underline line-clamp-1">Instagram</a>
                      )}
                      {b.socials?.youtube && (
                        <a href={b.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-gold hover:underline line-clamp-1">YouTube</a>
                      )}
                    </div>
                  </div>
                ) : null}

                {b.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 md:size-5 text-gold shrink-0" />
                    <a href={`mailto:${b.email}`} className="text-xs md:text-sm font-medium text-gold hover:underline line-clamp-1">{b.email}</a>
                  </div>
                )}

                {(b.website || b.page_content?.website || b.socials?.website) && (
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 md:size-5 text-gold shrink-0" />
                    <a href={(b.website || b.page_content?.website || b.socials?.website).startsWith('http') ? (b.website || b.page_content?.website || b.socials?.website) : `https://${(b.website || b.page_content?.website || b.socials?.website)}`} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-gold hover:underline line-clamp-1">
                      {(b.website || b.page_content?.website || b.socials?.website).replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="size-4 md:size-5 text-gold shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    {Array.isArray(b.page_content?.working_hours) ? (
                      b.page_content.working_hours.map((wh: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] md:text-[13px]">
                          <span className="text-muted-foreground">{wh.day}</span>
                          <span className="font-medium text-foreground">{wh.hours}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs md:text-sm text-muted-foreground">{b.page_content?.working_hours || "Đang cập nhật"}</span>
                    )}
                  </div>
                </div>
              </div>

              {mapSrc ? (
                <div className="mt-2 rounded-2xl overflow-hidden border border-border h-[200px] bg-secondary/30 relative">
                  <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                </div>
              ) : b.address ? (
                <div className="mt-2 rounded-2xl overflow-hidden border border-border h-[200px] bg-secondary/30 relative">
                  <iframe
                    width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((b.address || '') + ' ' + (b.name || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              ) : null}

              {zaloLink !== '#' && (
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 rounded-2xl px-6 py-5 text-center text-sm md:text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 active:opacity-90"
                >
                  <MessageCircle className="size-5 md:size-6" /> Chat qua Zalo
                </a>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal / Dialog Form Nhận Mã */}
      {(() => {
        const isPartyBooking = selectedDeal?.id === 'party-booking';
        const isBooking = selectedDeal?.id === 'booking' || isPartyBooking;

        let dialogTitle = "Điền thông tin nhận ưu đãi";
        if (voucher) {
          if (isPartyBooking) {
            dialogTitle = "Đã gửi yêu cầu đặt tiệc thành công! 🎉";
          } else if (isBooking) {
            dialogTitle = "Đã gửi yêu cầu thành công!";
          } else {
            dialogTitle = "Đăng ký thành công!";
          }
        } else {
          if (isPartyBooking) {
            dialogTitle = `Đặt Tiệc Tất Niên — ${business.name}`;
          } else if (isBooking) {
            dialogTitle = `Thông tin ${actionName}`;
          } else {
            dialogTitle = "Điền thông tin nhận ưu đãi";
          }
        }

        let submitButtonLabel = "NHẬN ƯU ĐÃI";
        if (loading) {
          submitButtonLabel = "Đang gửi...";
        } else if (isPartyBooking) {
          submitButtonLabel = "GỬI YÊU CẦU ĐẶT TIỆC (BẢO LƯU ƯU ĐÃI)";
        } else if (isBooking) {
          submitButtonLabel = `XÁC NHẬN ${actionNameUpper}`;
        }

        let successHeading = "Đã nhận ưu đãi thành công!";
        if (isPartyBooking) {
          successHeading = "Đã Gửi Yêu Cầu Đặt Tiệc Thành Công! 🎉";
        } else if (isBooking) {
          successHeading = "Đã gửi yêu cầu thành công!";
        }

        return (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setName("");
              setPhone("");
              setVoucher("");
              setSelectedDeal(null);
              setSelectedCrossSells([]);
              setPartyGuests("20");
              setPartyNotes("");
              setBookingTime("");
              setBookingService("");
            }
          }}>
            <DialogContent className={`sm:max-w-md rounded-2xl ${isPartyBooking ? 'bg-zinc-950 border border-amber-500/40 text-zinc-100' : ''}`}>
              <DialogHeader>
                <DialogTitle className={`text-xl font-bold text-center leading-tight ${isPartyBooking ? 'text-white' : 'text-ink'}`}>
                  {dialogTitle}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {!voucher && (
                    <span className={`font-semibold mt-2 block ${isPartyBooking ? 'text-amber-400' : 'text-gold'}`}>
                      {selectedDeal?.title}
                    </span>
                  )}
                  {isPartyBooking && !voucher && (
                    <span className="text-xs text-zinc-400 mt-1 block">
                      Đại diện nhà hàng sẽ nhận thông báo qua Telegram và liên hệ lại ngay
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              {!voucher ? (
                <form onSubmit={handleSubmit} className="space-y-3.5 mt-2 text-left">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isPartyBooking ? 'text-zinc-300' : 'text-ink'}`}>
                      Họ & Tên người liên hệ / đại diện công ty <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="VD: Anh Minh / Chị Linh"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`h-11 rounded-xl ${isPartyBooking ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500' : 'bg-muted/50'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isPartyBooking ? 'text-zinc-300' : 'text-ink'}`}>
                      Số điện thoại Zalo nhận xác nhận <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      required
                      placeholder="VD: 0901234567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className={`h-11 rounded-xl font-medium ${isPartyBooking ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500' : 'bg-muted/50'}`}
                    />
                  </div>

                  {/* Trường riêng cho Party Booking */}
                  {isPartyBooking ? (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            Quy mô dự kiến <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={5000}
                            inputMode="numeric"
                            required
                            placeholder="VD: 25"
                            value={partyGuests}
                            onChange={e => setPartyGuests(e.target.value)}
                            className="h-11 rounded-xl bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500 text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            Thời gian tiệc
                          </label>
                          <Input
                            placeholder="VD: 18:30 ngày 25/12"
                            value={bookingTime}
                            onChange={e => setBookingTime(e.target.value)}
                            className="h-11 rounded-xl bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Yêu cầu đặc biệt (Phòng VIP, Karaoke, menu...)
                        </label>
                        <Input
                          placeholder="VD: Cần phòng VIP riêng có dàn Karaoke, tư vấn set menu 350k"
                          value={partyNotes}
                          onChange={e => setPartyNotes(e.target.value)}
                          className="h-11 rounded-xl bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500 text-sm"
                        />
                      </div>
                    </>
                  ) : isBooking ? (
                    <>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="w-full h-12 px-3 rounded-xl border border-input bg-muted/50 text-sm font-medium text-ink focus:outline-none focus:ring-1 focus:ring-gold"
                          placeholder="VD: 15:30 chiều mai, hoặc sáng Thứ Bảy"
                          value={bookingTime}
                          onChange={e => setBookingTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <select
                          className="w-full h-12 px-3 rounded-xl border border-input bg-muted/50 text-sm font-medium text-ink focus:outline-none focus:ring-1 focus:ring-gold"
                          value={bookingService}
                          onChange={e => setBookingService(e.target.value)}
                        >
                          <option value="">-- Chọn sản phẩm/dịch vụ quan tâm (Tùy chọn) --</option>
                          {b.page_content?.services?.map((s: any, idx: number) => (
                            <option key={idx} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : null}

                  {!isBooking && crossSells.length > 0 && (
                    <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 mb-3">Đăng ký dùng thêm khi đến tiệm</p>
                      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                        {crossSells.map((cs: any, index: number) => {
                          const itemName = typeof cs === 'string' ? cs : cs.name;
                          const itemPrice = typeof cs === 'string' ? null : cs.price;

                          return (
                            <label key={cs.id || index} className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
                                checked={selectedCrossSells.includes(itemName)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCrossSells([...selectedCrossSells, itemName]);
                                  } else {
                                    setSelectedCrossSells(selectedCrossSells.filter(n => n !== itemName));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-ink group-hover:text-purple-700 transition-colors">{itemName}</p>
                                {itemPrice != null && <p className="text-xs text-muted-foreground">{formatPrice(itemPrice)}</p>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className={`w-full h-12 text-base font-bold rounded-xl mt-3 ${
                      isPartyBooking
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:brightness-110 shadow-lg shadow-amber-950/60'
                        : 'bg-gold text-ink hover:bg-gold/90 shadow-lg shadow-gold/20'
                    }`}
                    disabled={loading}
                  >
                    {submitButtonLabel}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="size-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className={`text-lg font-bold mb-1 ${isPartyBooking ? 'text-white' : 'text-ink'}`}>
                    {successHeading}
                  </h3>

                  {isPartyBooking ? (
                    <div className="space-y-3 mt-3 text-left">
                      <p className="text-xs text-zinc-300 leading-relaxed text-center">
                        Thông tin của bạn đã được chuyển thẳng tới Telegram của <span className="text-amber-300 font-bold">{business.name}</span> và ban quản trị 1Booking.Asia.
                      </p>

                      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                        <div>🏛️ Nhà hàng: <span className="text-white font-semibold">{business.name}</span></div>
                        <div>👤 Người liên hệ: <span className="text-white font-semibold">{name || 'Khách đặt tiệc'}</span> ({phone})</div>
                        <div>👥 Quy mô tiệc: <span className="text-amber-300 font-semibold">{partyGuests} khách</span></div>
                        {bookingTime && <div>🕒 Thời gian: <span className="text-zinc-200">{bookingTime}</span></div>}
                        <div>🎁 Ưu đãi: <span className="text-emerald-400 font-semibold">{selectedDeal?.title}</span></div>
                        {partyNotes && <div>📝 Yêu cầu: <span className="text-zinc-300 italic">{partyNotes}</span></div>}
                      </div>

                      <p className="text-[11px] text-zinc-400 text-center">
                        Quán sẽ chủ động gọi lại theo số <span className="text-amber-300 font-mono font-bold">{phone}</span> trong ít phút để tư vấn thực đơn và giữ sảnh tiệc đẹp nhất!
                      </p>
                    </div>
                  ) : !isBooking ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-5">Bạn chỉ cần đọc <strong>số điện thoại</strong> cho lễ tân khi đến tiệm.</p>

                      {/* Mã ưu đãi = Số điện thoại */}
                      <div className="rounded-2xl border-2 border-gold bg-gradient-to-b from-yellow-50 to-amber-50 px-5 py-4 mb-3 text-left shadow-inner">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Mã ưu đãi của bạn</p>
                        <p className="text-3xl font-black tracking-widest text-gold">{phone}</p>
                        <p className="text-xs text-muted-foreground mt-1 italic">Khi đến tiệm, đọc số này cho lễ tân để nhận ngay mức giá ưu đãi</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-5">Cảm ơn bạn. Chúng tôi sẽ sớm liên hệ qua số điện thoại <strong>{phone}</strong> để xác nhận với bạn nhé!</p>
                  )}

                  {!isPartyBooking && (
                    <div className="rounded-xl border border-border bg-white px-4 py-3 mb-5 text-left">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{isBooking ? "Sản phẩm/dịch vụ đã chọn" : "Gói ưu đãi"}</p>
                      <p className="text-sm font-bold text-ink leading-snug">{isBooking ? (bookingService || selectedDeal?.title) : selectedDeal?.title}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 mt-4">
                    {hotlineDigits ? (
                      <Button asChild className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
                        <Link href={`tel:${hotlineDigits}`}>
                          <Phone className="mr-2 size-5" /> Gọi Hotline Quán Xác Nhận Ngay
                        </Link>
                      </Button>
                    ) : (
                      <Button onClick={() => toast.error("Tiệm chưa cập nhật số điện thoại")} className="w-full h-12 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-xl">
                        <Phone className="mr-2 size-5" /> Liên hệ qua Hotline
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        );
      })()}

      <ChatWidget key={business.id} businessId={business.id} businessName={business.name} slug={business.slug} />

      {/* MODAL: CHI TIẾT DỊCH VỤ */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 md:p-6 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-gold-soft bg-card overflow-hidden shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-40 md:h-56 bg-champagne relative">
                {(selectedService.image || selectedService.image_url || galleryItems[0] || avatar) ? (
                  <Image
                    src={selectedService.image || selectedService.image_url || galleryItems[0] || avatar}
                    alt={selectedService.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="size-10 md:size-12 text-gold/40" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 grid size-8 md:size-10 place-items-center rounded-full bg-background/60 backdrop-blur-md text-foreground transition-colors hover:bg-background"
                >
                  <X className="size-4 md:size-5" />
                </button>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-display text-xl md:text-3xl mb-3 md:mb-4 leading-tight text-ink">{selectedService.name}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                  {selectedService.description || "Liên hệ để biết thêm thông tin chi tiết về sản phẩm/dịch vụ này."}
                </p>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-champagne border border-gold-soft mb-6 md:mb-8">
                  <span className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground">Giá</span>
                  <span className="font-display text-xl md:text-2xl text-gold font-semibold">
                    {formatPrice(selectedService.price || selectedService.price_min) || "Liên hệ"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBookingService(selectedService.name);
                    setSelectedDeal({ id: 'booking', title: actionName, original_price: '', promo_price: '', valid_until: '' });
                    setSelectedService(null);
                    setIsDialogOpen(true);
                  }}
                  className="block text-center w-full bg-gradient-to-r from-gold to-gold-soft rounded-full py-3.5 md:py-4 text-ink text-xs md:text-sm font-semibold uppercase tracking-widest transition-all duration-200 shadow-lg active:scale-95 active:opacity-90 hover:opacity-90"
                >
                  {actionNameUpper}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="mt-16 pb-8 text-center px-4">
        <p className="text-xs text-muted-foreground">
          Được thực hiện bởi <Link href="/lien-he" className="font-semibold text-ink hover:text-gold transition-colors">{siteConfig.brand}</Link>
        </p>
      </div>

      {/* 🌟 NÚT BẤM DÍNH ĐÁY MÀN HÌNH (FIXED BOTTOM CTA CHO MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 flex gap-2 md:hidden">
        {menuLink && (
          <a
            href={menuLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3.5 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0"
            title="Xem thực đơn món ăn chi tiết"
          >
            <Utensils className="size-4 text-amber-600" />
            <span className="font-black">Menu</span>
          </a>
        )}
        <button
          onClick={() => {
            document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 bg-champagne text-gold font-bold text-sm py-3 rounded-xl border border-gold/30 transition-all duration-200 active:scale-95 active:opacity-90 hover:bg-gold hover:text-white"
        >
          <span className="flex items-center justify-center gap-1.5"><Gift className="size-4" /> Nhận Ưu Đãi</span>
        </button>
        <button
          onClick={() => {
            setBookingService("");
            setSelectedDeal({ id: 'booking', title: actionName, original_price: '', promo_price: '', valid_until: '' });
            setIsDialogOpen(true);
          }}
          className="flex-1 bg-ink text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 shadow-lg active:scale-95 active:opacity-90 hover:bg-gold"
        >
          <span className="flex items-center justify-center gap-1.5"><ActionIcon className="size-4" /> {actionName}</span>
        </button>
      </div>

      <SiteFooter />
    </div>
  );
}
