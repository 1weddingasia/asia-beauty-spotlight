'use client';

import React from 'react';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { PartyVenue, PARTY_SPACES, PARTY_CUISINES, PARTY_PERKS } from '@/types/party';
import { Users, Phone, ExternalLink, Sparkles, MapPin, Wine, Utensils, Award, Share2, Check } from 'lucide-react';

interface VenueBottomSheetProps {
  venue: PartyVenue | null;
  onClose: () => void;
}

export default function VenueBottomSheet({ venue, onClose }: VenueBottomSheetProps) {
  const [copiedShare, setCopiedShare] = React.useState(false);

  const handleShareZalo = async () => {
    if (!venue) return;
    const shareUrl = `https://1booking.asia/${venue.slug}`;
    const shareText = `📋 [THÔNG TIN THAM KHẢO TIỆC TẤT NIÊN 2026]\n🏛️ Nhà hàng: ${venue.name}\n📍 Địa chỉ: ${venue.address || 'TP.HCM'}\n👥 Sức chứa: ${venue.min_guests} - ${venue.max_guests} khách${venue.num_vip_rooms ? ` (${venue.num_vip_rooms} phòng VIP)` : ''}\n💰 Ngân sách tham khảo: Từ ${venue.price_min?.toLocaleString('vi-VN')} đ/người\n🎁 Ưu đãi tiệc: ${venue.party_deal_highlight || 'Tặng bia, âm thanh & backdrop'}\n👉 Xem chi tiết sảnh tiệc & menu để bình chọn: ${shareUrl}\n(Gửi nhóm công ty / phòng ban tham khảo & bình chọn)`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Thông tin tham khảo tiệc Tất Niên: ${venue.name}`,
          text: shareText,
          url: shareUrl,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3500);
        window.open(`https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    } catch {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3500);
      }
    }
  };

  if (!venue) return null;

  // Banner image resolution
  const banners = venue.page_content?.banners || [];
  const gallery = venue.page_content?.gallery || [];
  const heroImage =
    banners[0] ||
    (typeof gallery[0] === 'string' ? gallery[0] : (gallery[0] as any)?.url) ||
    venue.page_content?.hero_image ||
    '/images/categories/nha-hang-am-thuc.jpg';

  const priceFormatted = `${venue.price_min?.toLocaleString('vi-VN')} - ${venue.price_max?.toLocaleString('vi-VN')} đ`;

  // Look up labels
  const spaceLabels = venue.spaces_and_amenities
    .map((s) => PARTY_SPACES.find((item) => item.id === s)?.label || s)
    .filter(Boolean);

  const cuisineLabels = venue.cuisines
    .map((c) => PARTY_CUISINES.find((item) => item.id === c)?.label || c)
    .filter(Boolean);

  const perkLabels = venue.party_perks
    .map((p) => PARTY_PERKS.find((item) => item.id === p)?.label || p)
    .filter(Boolean);

  return (
    <Drawer open={!!venue} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-zinc-950 border-t border-amber-500/30 text-zinc-100 max-h-[85dvh] rounded-t-3xl overflow-hidden shadow-2xl">
        {/* 
          ⚠️ BẮT BUỘC THEO CHỈ DẪN KỸ THUẬT:
          onTouchMove e.stopPropagation() để việc vuốt xem menu trong Drawer không làm trượt bản đồ MapLibre bên dưới
        */}
        <div
          onTouchMove={(e) => e.stopPropagation()}
          className="overflow-y-auto px-4 pb-8 pt-2 scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {/* Header Info */}
          <div className="relative rounded-2xl overflow-hidden mb-4 border border-zinc-800 bg-zinc-900 aspect-[16/9] max-h-48 sm:max-h-56">
            <img
              src={heroImage}
              alt={venue.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback nếu ảnh lỗi
                (e.target as HTMLImageElement).src = '/images/categories/nha-hang-am-thuc.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {venue.is_vip && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-700 text-black font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg vip-pin-glow">
                  <Sparkles className="w-3.5 h-3.5" /> VIP VENUE
                </span>
              )}
              {venue.num_vip_rooms > 0 && (
                <span className="bg-zinc-900/90 text-amber-300 border border-amber-500/40 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                  {venue.num_vip_rooms} Phòng VIP riêng
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {venue.name}
              </h2>
              {venue.address && (
                <p className="flex items-center gap-1 text-xs text-zinc-300 line-clamp-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  {venue.address}
                </p>
              )}
            </div>
          </div>

          <DrawerHeader className="p-0 text-left mb-3">
            <DrawerTitle className="sr-only">{venue.name}</DrawerTitle>
            <DrawerDescription className="sr-only">Hồ sơ đặt tiệc tất niên của {venue.name}</DrawerDescription>

            {/* Highlight Banner Deal */}
            {venue.party_deal_highlight && (
              <div className="bg-gradient-to-r from-amber-950/80 via-rose-950/60 to-amber-950/80 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 shadow-inner">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Ưu Đãi Tiệc Tất Niên Độc Quyền
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {venue.party_deal_highlight}
                  </div>
                </div>
              </div>
            )}
          </DrawerHeader>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-zinc-400 font-medium">Sức chứa tiệc</div>
                <div className="text-sm font-bold text-white">
                  {venue.min_guests} - {venue.max_guests} <span className="text-xs font-normal text-zinc-400">khách</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Wine className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-zinc-400 font-medium">Mức giá ước tính</div>
                <div className="text-sm font-bold text-amber-300">
                  {priceFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* Space & Amenities */}
          {spaceLabels.length > 0 && (
            <div className="mb-3 text-left">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Không gian & Tiện ích
              </div>
              <div className="flex flex-wrap gap-1.5">
                {spaceLabels.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs px-2.5 py-1 rounded-lg"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cuisines */}
          {cuisineLabels.length > 0 && (
            <div className="mb-3 text-left">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" /> Phong cách ẩm thực
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cuisineLabels.map((c, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-950/40 text-amber-200 border border-amber-800/40 text-xs px-2.5 py-1 rounded-lg font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Perks */}
          {perkLabels.length > 0 && (
            <div className="mb-4 text-left">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Quà tặng & Đặc quyền
              </div>
              <div className="flex flex-wrap gap-1.5">
                {perkLabels.map((p, idx) => (
                  <span
                    key={idx}
                    className="bg-rose-950/40 text-rose-200 border border-rose-800/40 text-xs px-2.5 py-1 rounded-lg font-medium"
                  >
                    ★ {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {venue.party_description && (
            <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed mb-4 text-left">
              {venue.party_description}
            </div>
          )}

          {/* Set menus */}
          {venue.set_menus && venue.set_menus.length > 0 && (
            <div className="mb-5 text-left">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Gợi ý Set Menu Tiệc
              </div>
              <div className="space-y-2">
                {venue.set_menus.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-zinc-400 ml-2">({m.pax} người/bàn)</span>
                    </div>
                    <span className="font-bold text-amber-400">
                      {m.price?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Actions Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-zinc-800">
            {/* 1. Nút Gửi nhóm Zalo / Bình chọn */}
            <button
              type="button"
              onClick={handleShareZalo}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
                copiedShare
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-blue-950/50 hover:bg-blue-900/60 border-blue-500/50 text-blue-200'
              }`}
              title="Chia sẻ thông tin tham khảo vào nhóm Zalo để cùng xem và bình chọn"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Gửi Zalo</span>
                </>
              )}
            </button>

            {/* 2. Nút Gọi quán */}
            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all shrink-0 active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Gọi Quán</span>
              </a>
            )}

            {/* 3. Nút Xem Menu & Đặt Bàn */}
            <Link
              href={`/${venue.slug}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black text-sm font-extrabold shadow-lg shadow-amber-900/40 transition-all active:scale-[0.98]"
            >
              <span>Xem Menu & Đặt Bàn</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
