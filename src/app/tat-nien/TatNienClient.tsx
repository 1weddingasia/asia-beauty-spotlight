'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PartyVenue, PartyFilterState, PartyDistrictItem } from '@/types/party';
import VenueBottomSheet from './components/VenueBottomSheet';
import PartyFilterWidget from './components/PartyFilterWidget';
import PartyQuickFilterBar from './components/PartyQuickFilterBar';
import VenueListView from './components/VenueListView';
import { Map as MapIcon, List as ListIcon, Sparkles, ChevronLeft, Navigation, MapPin } from 'lucide-react';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Lazy load MapView với dynamic ssr: false
const MapView = dynamic(() => import('./components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] text-amber-700 gap-3">
      <div className="w-9 h-9 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold tracking-widest text-amber-800 uppercase">
        Đang tải Bản Đồ Phố Tiệc Tất Niên...
      </span>
    </div>
  ),
});

const HCMC_DEFAULT_CENTER: [number, number] = [106.67, 10.77];

interface TatNienClientProps {
  initialVenues: PartyVenue[];
  initialDistricts: PartyDistrictItem[];
}

export default function TatNienClient({ initialVenues, initialDistricts }: TatNienClientProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedVenue, setSelectedVenue] = useState<PartyVenue | null>(null);

  // Quận / Huyện & Định vị GPS
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);

  // Bộ lọc Client-side
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [filter, setFilter] = useState<PartyFilterState>({
    guests: 0,
    priceMax: 0,
    spaces: [],
    cuisines: [],
    perks: [],
    onlyVip: false,
  });

  // Danh sách Quận / Huyện load từ database thật (directory_locations)
  const districtsList = useMemo(() => {
    const allOption: PartyDistrictItem = {
      id: 'all',
      name: 'Toàn TP.HCM',
      slug: 'all',
      keywords: [],
      map_coordinates: HCMC_DEFAULT_CENTER,
    };
    return [allOption, ...(initialDistricts || [])];
  }, [initialDistricts]);

  // Xử lý lấy tọa độ người dùng ("📍 Gần tôi")
  const handleGetNearMe = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Trình duyệt của bạn chưa hỗ trợ định vị GPS.');
      return;
    }
    setIsLocating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setFlyToCenter([loc.lng, loc.lat]);
        },
        (err) => {
          setIsLocating(false);
          console.warn('Geolocation error:', err);
          alert('Không thể xác định vị trí. Vui lòng bật quyền truy cập vị trí trên trình duyệt.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } catch (e) {
      setIsLocating(false);
      console.warn('Geolocation invocation failed:', e);
      alert('Không thể kích hoạt định vị trong môi trường trình duyệt này.');
    }
  };

  // Helper tìm kiếm quận trong danh sách
  const findDistrict = (key: string) =>
    districtsList.find((d) => d.slug === key || d.id === key);

  // Xử lý chọn Quận / Huyện
  const handleSelectDistrict = (districtKey: string) => {
    setSelectedDistrict(districtKey);
    const dObj = findDistrict(districtKey);
    setUserLocation(null);
    setFlyToCenter(dObj?.map_coordinates || HCMC_DEFAULT_CENTER);
  };

  // ⚡ TỐI ƯU 0MS: Lọc trực tiếp trên React State qua useMemo (không chờ mạng)
  const filteredVenues = useMemo(() => {
    const list = initialVenues.filter((v) => {
      // 0. Lọc Quận / Huyện từ database thật
      if (selectedDistrict !== 'all') {
        const dObj = findDistrict(selectedDistrict);
        if (dObj) {
          const isDirectMatch = Boolean(
            v.location_slug && (v.location_slug === dObj.slug || v.location_slug === dObj.id)
          );
          if (!isDirectMatch) {
            const addrLower = (v.address || '').toLowerCase();
            const dNameLower = dObj.name.toLowerCase();
            const keywords = Array.isArray(dObj.keywords) && dObj.keywords.length > 0
              ? dObj.keywords
              : [dNameLower];
            const matches =
              keywords.some((k) => addrLower.includes(k.toLowerCase())) ||
              addrLower.includes(dNameLower);
            if (!matches) return false;
          }
        }
      }

      // 1. Số lượng khách (quán có max_guests >= filter.guests)
      if (filter.guests > 0 && v.max_guests < filter.guests) return false;

      // 2. Mức giá trần (giá khởi điểm price_min <= filter.priceMax)
      if (filter.priceMax > 0 && v.price_min > filter.priceMax) return false;

      // 3. Chỉ quán VIP
      if (filter.onlyVip && !v.is_vip) return false;

      // 4. Tiện ích & Không gian (phòng VIP, karaoke, ngoài trời, rooftop, sân khấu, màn chiếu LED)
      if (filter.spaces.length > 0) {
        const hasAllSpaces = filter.spaces.every((s) => {
          if (s === 'phong_vip') {
            return v.num_vip_rooms > 0 || (v.spaces_and_amenities || []).includes('phong_vip');
          }
          return (v.spaces_and_amenities || []).includes(s);
        });
        if (!hasAllSpaces) return false;
      }

      // 5. Ưu đãi tiệc độc quyền (tặng bia, tặng karaoke, tặng backdrop...)
      if (filter.perks.length > 0) {
        const hasAllPerks = filter.perks.every((p) =>
          (v.party_perks || []).includes(p)
        );
        if (!hasAllPerks) return false;
      }

      // 6. Phong cách ẩm thực
      if (filter.cuisines.length > 0) {
        const hasAnyCuisine = filter.cuisines.some((c) =>
          (v.cuisines || []).includes(c)
        );
        if (!hasAnyCuisine) return false;
      }

      return true;
    });

    // Nếu người dùng đã bật "Gần tôi", sắp xếp quán gần nhất lên đầu
    if (userLocation) {
      list.sort((a, b) => {
        const aCoords = a.map_coordinates;
        const bCoords = b.map_coordinates;
        const aDist =
          aCoords && typeof aCoords.lat === 'number' && typeof aCoords.lng === 'number'
            ? getDistanceKm(userLocation.lat, userLocation.lng, aCoords.lat, aCoords.lng)
            : 9999;
        const bDist =
          bCoords && typeof bCoords.lat === 'number' && typeof bCoords.lng === 'number'
            ? getDistanceKm(userLocation.lat, userLocation.lng, bCoords.lat, bCoords.lng)
            : 9999;
        return aDist - bDist;
      });
    }

    return list;
  }, [initialVenues, filter, selectedDistrict, userLocation, districtsList]);

  // Set ID để MapView highlight/dim markers
  const filteredVenueIds = useMemo(() => {
    return new Set(filteredVenues.map((v) => v.id));
  }, [filteredVenues]);

  // Khi bấm từ List sang xem trên Map
  const handleSelectOnMap = (venue: PartyVenue) => {
    setSelectedVenue(venue);
    setViewMode('map');
  };

  // Tọa độ trung tâm hiện tại (giữ vị trí khi chuyển đổi qua lại giữa Map và List)
  const activeCenter = useMemo(() => {
    if (userLocation) return [userLocation.lng, userLocation.lat] as [number, number];
    if (flyToCenter) return flyToCenter;
    const dObj = findDistrict(selectedDistrict);
    return (dObj?.map_coordinates as [number, number]) || HCMC_DEFAULT_CENTER;
  }, [userLocation, flyToCenter, selectedDistrict, districtsList]);

  return (
    // ⚠️ BẮT BUỘC THEO CHỈ DẪN KỸ THUẬT:
    // Dùng h-[100dvh] để thích nghi với Zalo/Facebook Webview, tuyệt đối không dùng 100vh cứng
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#FAF7F2] text-slate-900 flex flex-col select-none">
      {/* 1. Header Festive Bar (Warm Luxury Light) */}
      <header className="relative z-20 flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white/95 border-b border-amber-200/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pr-1">
          <Link
            href="/"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 border border-amber-200/90 flex items-center justify-center text-slate-700 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-100/70 transition-colors shrink-0 shadow-xs"
            title="Về trang chủ"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
          </Link>

          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-1 truncate">
                <span className="text-amber-700">PHỐ TIỆC</span>
                <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">
                  TẤT NIÊN
                </span>
                <span className="text-rose-600 font-black">
                  2026
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-rose-600" /> TIỆC CUỐI NĂM VIP
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block truncate">
              Bản đồ trực quan khám phá sảnh tiệc VIP, phòng riêng & thực đơn ưu đãi độc quyền
            </p>
          </div>
        </div>

        {/* Controls: Dual View Mode Toggle + B2B Registration */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-30">
          {/* Dual View Mode Toggle */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-50/90 p-0.5 sm:p-1 rounded-xl border border-amber-200/80 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bản Đồ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>
          </div>

          {/* 🏷️ B2B CTA: Đăng ký điểm tiệc */}
          <Link
            href="/tat-nien/dang-ky"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white text-xs font-black shadow-sm shadow-amber-900/10 transition-all active:scale-95 shrink-0"
            title="Dành cho Chủ Nhà Hàng: Đăng ký điểm tiệc để sáng đèn trên bản đồ"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="hidden md:inline">Đăng Ký Điểm Tiệc</span>
            <span className="hidden sm:inline md:hidden text-[11px] whitespace-nowrap">Đăng Điểm Tiệc</span>
            <span className="sm:hidden text-[10.5px] whitespace-nowrap">+ Đăng Tiệc</span>
          </Link>
        </div>
      </header>

      {/* 1.1 Quick District & Near Me Floating Bar (Warm Luxury Light) */}
      <div className="relative z-20 bg-white/95 border-b border-amber-100/90 px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x backdrop-blur-md shadow-xs">
        {/* Nút 📍 Gần tôi */}
        <button
          type="button"
          onClick={handleGetNearMe}
          disabled={isLocating}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-all active:scale-95 border ${
            userLocation
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-amber-50/90 text-amber-950 border-amber-200/90 hover:bg-amber-100 hover:border-amber-300'
          }`}
          title="Định vị quán tiệc gần vị trí của bạn"
        >
          {isLocating ? (
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${userLocation ? 'text-white fill-white' : 'text-amber-700'}`} />
          )}
          <span>{userLocation ? 'Gần tôi (Bật)' : '📍 Gần tôi'}</span>
        </button>

        <div className="h-3.5 w-px bg-amber-200/70 shrink-0 mx-0.5" />

        {/* Danh sách Quận / Huyện từ database thật */}
        {districtsList.map((d) => {
          const key = d.slug || d.id;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectDistrict(key)}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
                selectedDistrict === key
                  ? 'bg-amber-600 text-white font-black border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/40'
              }`}
            >
              {d.name}
            </button>
          );
        })}
      </div>

      {/* 1.2 Quick Criteria Filter Bar (Bộ lọc tiêu chí tiệc kết nối trực tiếp database) */}
      <PartyQuickFilterBar
        filter={filter}
        onFilterChange={setFilter}
        totalVenues={initialVenues.length}
        matchedCount={filteredVenues.length}
        onOpenAdvancedModal={() => setIsAdvancedFilterOpen(true)}
      />

      {/* 2. Main Content View Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {viewMode === 'map' ? (
          <MapView
            venues={initialVenues}
            filteredVenueIds={filteredVenueIds}
            selectedVenue={selectedVenue}
            onSelectVenue={setSelectedVenue}
            userLocation={userLocation}
            flyToCenter={flyToCenter}
            initialCenter={activeCenter}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <VenueListView
              venues={filteredVenues}
              onSelectOnMap={handleSelectOnMap}
              userLocation={userLocation}
            />
          </div>
        )}

        {/* 3. Modal Bộ Lọc Chi Tiết (PartyFilterWidget) */}
        <PartyFilterWidget
          filter={filter}
          onFilterChange={setFilter}
          totalVenues={initialVenues.length}
          matchedCount={filteredVenues.length}
          isOpen={isAdvancedFilterOpen}
          onOpenChange={setIsAdvancedFilterOpen}
          showTrigger={false}
        />

        {/* 4. Chi tiết điểm tiệc (Side Panel trên Desktop / Drawer trên Mobile) */}
        <VenueBottomSheet
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      </main>
    </div>
  );
}

