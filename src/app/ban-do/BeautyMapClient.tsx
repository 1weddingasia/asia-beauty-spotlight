'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BeautyVenue, BeautyFilterState, BEAUTY_CATEGORIES } from '@/types/beauty';
import { PartyDistrictItem } from '@/types/party';
import BeautyBottomSheet from './components/BeautyBottomSheet';
import BeautyFilterWidget from './components/BeautyFilterWidget';
import BeautyListView from './components/BeautyListView';
import {
  Map as MapIcon,
  List as ListIcon,
  Sparkles,
  ChevronLeft,
  Navigation,
  Flower2,
  Building2,
  Droplet,
  Eye,
  Scissors,
  Smile,
} from 'lucide-react';

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

const BeautyMapView = dynamic(() => import('./components/BeautyMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] text-rose-700 gap-3">
      <div className="w-9 h-9 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold tracking-widest text-rose-800 uppercase">
        Đang tải Bản Đồ Làm Đẹp 1Beauty...
      </span>
    </div>
  ),
});

const HCMC_DEFAULT_CENTER: [number, number] = [106.69, 10.78];

interface BeautyMapClientProps {
  initialVenues: BeautyVenue[];
  initialDistricts: PartyDistrictItem[];
}

export default function BeautyMapClient({
  initialVenues,
  initialDistricts,
}: BeautyMapClientProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedVenue, setSelectedVenue] = useState<BeautyVenue | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);

  const [filter, setFilter] = useState<BeautyFilterState>({
    category: 'all',
    priceMax: 0,
    amenities: [],
    onlyVip: false,
  });

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

  const findDistrict = (key: string) =>
    districtsList.find((d) => d.slug === key || d.id === key);

  const handleSelectDistrict = (districtKey: string) => {
    setSelectedDistrict(districtKey);
    const dObj = findDistrict(districtKey);
    setUserLocation(null);
    setFlyToCenter(dObj?.map_coordinates || HCMC_DEFAULT_CENTER);
  };

  const filteredVenues = useMemo(() => {
    const list = initialVenues.filter((v) => {
      // 0. Lọc quận huyện
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

      // 1. Danh mục dịch vụ
      if (filter.category !== 'all') {
        const catSlug = v.category_slug || '';
        if (catSlug !== filter.category) {
          const nameLower = (v.name || '').toLowerCase();
          const spec = (v.specialties || []).map((s) => s.toLowerCase());
          if (filter.category === 'spa-thu-gian' && !nameLower.includes('spa') && !spec.includes('spa')) return false;
          if (filter.category === 'clinic-tham-my' && !nameLower.includes('thẩm mỹ') && !nameLower.includes('clinic')) return false;
          if (filter.category === 'nails-mi' && !nameLower.includes('nail') && !nameLower.includes('mi')) return false;
          if (filter.category === 'salon-toc' && !nameLower.includes('tóc') && !nameLower.includes('salon')) return false;
          if (filter.category === 'nha-khoa' && !nameLower.includes('nha khoa')) return false;
        }
      }

      // 2. VIP filter
      if (filter.onlyVip && !v.is_vip) return false;

      return true;
    });

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

  const filteredVenueIds = useMemo(() => {
    return new Set(filteredVenues.map((v) => v.id));
  }, [filteredVenues]);

  const handleSelectOnMap = (venue: BeautyVenue) => {
    setSelectedVenue(venue);
    setViewMode('map');
  };

  const activeCenter = useMemo(() => {
    if (userLocation) return [userLocation.lng, userLocation.lat] as [number, number];
    if (flyToCenter) return flyToCenter;
    const dObj = findDistrict(selectedDistrict);
    return (dObj?.map_coordinates as [number, number]) || HCMC_DEFAULT_CENTER;
  }, [userLocation, flyToCenter, selectedDistrict, districtsList]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#FAF7F2] text-slate-900 flex flex-col select-none">
      {/* 1. Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white/95 border-b border-rose-200/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pr-1">
          <Link
            href="/"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 border border-rose-200/90 flex items-center justify-center text-slate-700 hover:text-rose-800 hover:border-rose-400 hover:bg-rose-100/70 transition-colors shrink-0 shadow-xs"
            title="Về trang chủ"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
          </Link>

          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-1 truncate">
                <span className="text-rose-600">BẢN ĐỒ</span>
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                  LÀM ĐẸP
                </span>
                <span className="text-amber-600 font-black">
                  1BEAUTY
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-rose-600" /> SPA &amp; CLINIC UY TÍN
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block truncate">
              Khám phá Spa, Clinic Da liễu &amp; Viện thẩm mỹ uy tín gần bạn — Bảng giá minh bạch
            </p>
          </div>
        </div>

        {/* Controls: Dual View Mode + Registration */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-30">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-rose-50/90 p-0.5 sm:p-1 rounded-xl border border-rose-200/80 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/50'
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
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/50'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh Sách ({filteredVenues.length})</span>
              <span className="sm:hidden text-[10px] font-extrabold bg-rose-100 text-rose-900 px-1 rounded-full">
                {filteredVenues.length}
              </span>
            </button>
          </div>

          <Link
            href="/danh-cho-doanh-nghiep"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-sm shadow-rose-900/10 transition-all active:scale-95 shrink-0"
            title="Đăng ký cơ sở làm đẹp lên bản đồ"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="hidden md:inline">Đăng Ký Cơ Sở</span>
            <span className="hidden sm:inline md:hidden text-[11px] whitespace-nowrap">Đăng Cơ Sở</span>
            <span className="sm:hidden text-[10.5px] whitespace-nowrap">+ Cơ Sở</span>
          </Link>
        </div>
      </header>

      {/* 2. Floating Quick Category Pills Bar */}
      <div className="relative z-20 bg-white/95 border-b border-rose-100/90 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x backdrop-blur-md shadow-xs">
        {/* Nút 📍 Gần tôi */}
        <button
          type="button"
          onClick={handleGetNearMe}
          disabled={isLocating}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 border ${
            userLocation
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-rose-50/90 text-rose-950 border-rose-200/90 hover:bg-rose-100 hover:border-rose-300'
          }`}
          title="Tìm spa / clinic gần bạn"
        >
          {isLocating ? (
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className={`w-3.5 h-3.5 ${userLocation ? 'text-white fill-white' : 'text-rose-600'}`} />
          )}
          <span>{userLocation ? 'Gần tôi (Đã bật)' : '📍 Gần tôi'}</span>
        </button>

        <div className="h-4 w-px bg-rose-200/70 shrink-0 mx-0.5" />

        {/* Danh mục làm đẹp nhanh */}
        {BEAUTY_CATEGORIES.map((cat) => {
          const isActive = filter.category === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: cat.slug }))}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-800 hover:bg-rose-50/40'
              }`}
            >
              {(() => {
                const cls = `w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-rose-500'}`;
                switch (cat.slug) {
                  case 'spa-thu-gian':
                    return <Flower2 className={cls} />;
                  case 'clinic-tham-my':
                    return <Building2 className={cls} />;
                  case 'chamsoc-da':
                    return <Droplet className={cls} />;
                  case 'nails-mi':
                    return <Eye className={cls} />;
                  case 'salon-toc':
                    return <Scissors className={cls} />;
                  case 'nha-khoa':
                    return <Smile className={cls} />;
                  default:
                    return <Sparkles className={cls} />;
                }
              })()}
              <span>{cat.name}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-rose-200/70 shrink-0 mx-0.5" />

        {/* Quận Huyện */}
        {districtsList.map((d) => {
          const key = d.slug || d.id;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectDistrict(key)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
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

      {/* 3. Main Content View Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {viewMode === 'map' ? (
          <BeautyMapView
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
            <BeautyListView
              venues={filteredVenues}
              onSelectOnMap={handleSelectOnMap}
              userLocation={userLocation}
            />
          </div>
        )}

        {/* 4. Floating Filter Widget */}
        <div
          className={`absolute bottom-5 inset-x-0 z-30 flex justify-center pointer-events-none px-4 transition-all duration-300 ${
            selectedVenue ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="pointer-events-auto">
            <BeautyFilterWidget
              filter={filter}
              onFilterChange={setFilter}
              totalVenues={initialVenues.length}
              matchedCount={filteredVenues.length}
            />
          </div>
        </div>
      </main>

      {/* 5. Bottom Sheet Details */}
      <BeautyBottomSheet
        venue={selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />
    </div>
  );
}
