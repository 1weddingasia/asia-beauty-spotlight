"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Building2,
  ExternalLink,
  BarChart3,
  Printer,
  Sparkles,
  Globe,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { CountryFlag } from './CountryFlag';

export type SortKey = 'booth_asc' | 'booth_desc' | 'name_asc' | 'name_desc';

export function getZone(boothNumber: string): string {
  const match = (boothNumber || '').match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : 'OTHER';
}

interface BoothItem {
  id: string;
  name: string;
  name_vi?: string | null;
  name_en?: string | null;
  slug: string;
  phone: string;
  address?: string | null;
  logo_url?: string | null;
  event_name: string;
  event_name_en?: string | null;
  booth_number: string;
  product_info?: string | null;
  is_demo?: boolean;
}

interface Props {
  initialBooths: BoothItem[];
}

type HubLang = 'vi' | 'en' | 'ko' | 'zh';

const HUB_LANGUAGES: Array<{ code: HubLang; label: string; country: string }> = [
  { code: 'vi', label: 'Tiếng Việt', country: 'Việt Nam' },
  { code: 'en', label: 'English', country: 'International' },
  { code: 'ko', label: '한국어', country: '대한민국' },
  { code: 'zh', label: '中文', country: '中国' },
];

const HUB_I18N: Record<HubLang, {
  eventTag: string;
  title: string;
  subtitle: string;
  desc: string;
  searchPlaceholder: string;
  boothsHeading: string;
  boothsSub: string;
  realBoothsSuffix: string;
  btnScan: string;
  btnCrm: string;
  btnStandee: string;
  langSupport: string;
  emptyTitle: string;
  emptyDesc: string;
  clearSearch: string;
  allZones: string;
  zonePrefix: string;
  showing: string;
  of: string;
  boothUnit: string;
  sortByLabel: string;
  sortBoothAsc: string;
  sortBoothDesc: string;
  sortNameAsc: string;
  sortNameDesc: string;
  perPage: string;
  allPerPage: string;
  prevPage: string;
  nextPage: string;
  resetFilter: string;
  pageWord: string;
  totalWord: string;
}> = {
  vi: {
    eventTag: 'TRIỂN LÃM QUỐC TẾ NHƯỢNG QUYỀN • SECC TP.HCM',
    title: 'VIETFRANCHISE 2026',
    subtitle: 'Danh Bạ Số Hóa Doanh Nghiệp Tham Gia Triển Lãm',
    desc: 'Nền tảng số hóa kết nối đối tác B2B, tra cứu vị trí gian hàng, Standee để bàn thông minh và hệ thống Mini-CRM Live theo thời gian thực tại SECC.',
    searchPlaceholder: 'Tìm theo tên doanh nghiệp, số vị trí (C07, G26, A10...), ngành hàng...',
    boothsHeading: 'Danh sách doanh nghiệp',
    boothsSub: 'Danh bạ số hóa kết nối doanh nghiệp B2B tại SECC',
    realBoothsSuffix: 'doanh nghiệp',
    btnScan: 'Quét Thử',
    btnCrm: 'CRM Live',
    btnStandee: 'In Standee',
    langSupport: 'Hỗ trợ 4 ngôn ngữ',
    emptyTitle: 'Không tìm thấy gian hàng nào',
    emptyDesc: 'Thử tìm kiếm với từ khóa khác hoặc số vị trí.',
    clearSearch: 'Xóa',
    allZones: 'Tất cả khu',
    zonePrefix: 'Khu',
    showing: 'Hiển thị',
    of: 'trên',
    boothUnit: 'doanh nghiệp',
    sortByLabel: 'Sắp xếp:',
    sortBoothAsc: 'Vị trí (A → Z)',
    sortBoothDesc: 'Vị trí (Z → A)',
    sortNameAsc: 'Tên Doanh Nghiệp (A → Z)',
    sortNameDesc: 'Tên Doanh Nghiệp (Z → A)',
    perPage: '/ trang',
    allPerPage: 'Tất cả',
    prevPage: 'Trước',
    nextPage: 'Sau',
    resetFilter: 'Đặt lại',
    pageWord: 'Trang',
    totalWord: 'Tổng cộng',
  },
  en: {
    eventTag: 'INTERNATIONAL FRANCHISE EXHIBITION • SECC HCMC',
    title: 'VIETFRANCHISE 2026',
    subtitle: 'Digitized Directory of Exhibiting Businesses',
    desc: 'Digital B2B networking platform, booth location lookup, smart table standees, and live real-time CRM solutions at SECC.',
    searchPlaceholder: 'Search by exhibitor, booth location (C07, G26, A10...), industry...',
    boothsHeading: 'Exhibitor Directory',
    boothsSub: 'Digitized B2B business networking directory at SECC',
    realBoothsSuffix: 'exhibitors',
    btnScan: 'Scan QR',
    btnCrm: 'Live CRM',
    btnStandee: 'Standee',
    langSupport: '4 Languages Ready',
    emptyTitle: 'No exhibitors found',
    emptyDesc: 'Try searching with different keywords or booth number.',
    clearSearch: 'Clear',
    allZones: 'All Zones',
    zonePrefix: 'Zone',
    showing: 'Showing',
    of: 'of',
    boothUnit: 'exhibitors',
    sortByLabel: 'Sort:',
    sortBoothAsc: 'Location (A → Z)',
    sortBoothDesc: 'Location (Z → A)',
    sortNameAsc: 'Company (A → Z)',
    sortNameDesc: 'Company (Z → A)',
    perPage: '/ page',
    allPerPage: 'All',
    prevPage: 'Prev',
    nextPage: 'Next',
    resetFilter: 'Reset',
    pageWord: 'Page',
    totalWord: 'Total',
  },
  ko: {
    eventTag: '국제 프랜차이즈 박람회 • 호치민 SECC',
    title: 'VIETFRANCHISE 2026',
    subtitle: '참가기업 디지털 디렉토리 및 비즈니스 매칭',
    desc: '호치민 SECC 참가기업 디지털 B2B 네트워킹, 부스 위치 검색, 스마트 탁상용 스탠디 및 실시간 CRM 솔루션.',
    searchPlaceholder: '기업명, 부스 위치(C07, G26, A10...), 업종 검색...',
    boothsHeading: '참가기업 명록',
    boothsSub: '호치민 SECC B2B 기업 디지털 비즈니스 디렉토리',
    realBoothsSuffix: '개 기업',
    btnScan: 'QR 스캔',
    btnCrm: '실시간 CRM',
    btnStandee: '스탠디 인쇄',
    langSupport: '4개 국어 지원',
    emptyTitle: '검색된 부스가 없습니다',
    emptyDesc: '다른 검색어나 부스 번호로 다시 검색해보세요.',
    clearSearch: '지우기',
    allZones: '전체 구역',
    zonePrefix: '구역',
    showing: '표시',
    of: '/',
    boothUnit: '개 기업',
    sortByLabel: '정렬:',
    sortBoothAsc: '위치순 (A → Z)',
    sortBoothDesc: '위치역순 (Z → A)',
    sortNameAsc: '기업명 (A → Z)',
    sortNameDesc: '기업명 (Z → A)',
    perPage: '/ 페이지',
    allPerPage: '전체',
    prevPage: '이전',
    nextPage: '다음',
    resetFilter: '초기화',
    pageWord: '페이지',
    totalWord: '총',
  },
  zh: {
    eventTag: '国际特许加盟展览会 • 胡志明市 SECC',
    title: 'VIETFRANCHISE 2026',
    subtitle: '参展企业数字化商务名录',
    desc: '胡志明市 SECC 展会数字化商务对接平台、展位查询、智能桌面展架与实时CRM客户管理。',
    searchPlaceholder: '搜索参展企业、展位编号 (C07, G26, A10...)、所属行业...',
    boothsHeading: '参展商名录',
    boothsSub: 'SECC 数字化 B2B 商务对接名录',
    realBoothsSuffix: '家参展商',
    btnScan: '扫码体验',
    btnCrm: '实时CRM',
    btnStandee: '打印展架',
    langSupport: '支持4国语言',
    emptyTitle: '未找到匹配的展位',
    emptyDesc: '请尝试使用其他关键词或展位号搜索。',
    clearSearch: '清除',
    allZones: '全部展区',
    zonePrefix: '展区',
    showing: '显示',
    of: '/',
    boothUnit: '家参展商',
    sortByLabel: '排序:',
    sortBoothAsc: '展位号 (A → Z)',
    sortBoothDesc: '展位号 (Z → A)',
    sortNameAsc: '企业名 (A → Z)',
    sortNameDesc: '企业名 (Z → A)',
    perPage: '/ 页',
    allPerPage: '全部',
    prevPage: '上一页',
    nextPage: '下一页',
    resetFilter: '重置',
    pageWord: '第',
    totalWord: '共',
  },
};

export function ExpoHubClient({ initialBooths }: Props) {
  const [hubLang, setHubLang] = useState<HubLang>('vi');
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('booth_asc');
  const [pageSize, setPageSize] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const mainRef = useRef<HTMLElement>(null);

  const t = HUB_I18N[hubLang];

  // Trích xuất thống kê các Zone/Dãy Booth (A, B, C, D, E, F, G, Q, R...)
  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialBooths.forEach((b) => {
      const zone = getZone(b.booth_number);
      counts[zone] = (counts[zone] || 0) + 1;
    });
    return counts;
  }, [initialBooths]);

  const availableZones = useMemo(() => {
    return Object.keys(zoneCounts).sort((a, b) => a.localeCompare(b));
  }, [zoneCounts]);

  // Reset trang về 1 khi người dùng đổi bộ lọc, tìm kiếm hoặc số lượng/trang
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedZone, sortBy, pageSize]);

  // Lọc và sắp xếp gian hàng
  const filteredAndSortedBooths = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = initialBooths.filter((item) => {
      // 1. Lọc theo Zone
      if (selectedZone !== 'ALL') {
        const itemZone = getZone(item.booth_number);
        if (itemZone !== selectedZone) return false;
      }

      // 2. Tìm kiếm từ khóa
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.name_vi && item.name_vi.toLowerCase().includes(q)) ||
        (item.name_en && item.name_en.toLowerCase().includes(q)) ||
        item.booth_number.toLowerCase().includes(q) ||
        (item.address && item.address.toLowerCase().includes(q)) ||
        (item.phone && item.phone.includes(q)) ||
        (item.product_info && item.product_info.toLowerCase().includes(q))
      );
    });

    // 3. Sắp xếp
    return filtered.sort((a, b) => {
      if (sortBy === 'booth_asc') {
        return a.booth_number.localeCompare(b.booth_number, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortBy === 'booth_desc') {
        return b.booth_number.localeCompare(a.booth_number, undefined, { numeric: true, sensitivity: 'base' });
      }
      const nameA = hubLang === 'vi' ? (a.name_vi || a.name) : (a.name_en || a.name);
      const nameB = hubLang === 'vi' ? (b.name_vi || b.name) : (b.name_en || b.name);
      if (sortBy === 'name_asc') {
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'name_desc') {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });
  }, [initialBooths, search, selectedZone, sortBy, hubLang]);

  // Phân trang
  const totalBooths = filteredAndSortedBooths.length;
  const isViewAll = pageSize === 0;
  const effectivePageSize = isViewAll ? Math.max(1, totalBooths) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalBooths / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalBooths);
  const paginatedBooths = filteredAndSortedBooths.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      const el = document.getElementById('expo-directory-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isFilterActive = search.trim() !== '' || selectedZone !== 'ALL' || sortBy !== 'booth_asc' || pageSize !== 24;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedZone('ALL');
    setSortBy('booth_asc');
    setPageSize(24);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 pb-20">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 px-4 pt-8 pb-8 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          {/* TOP 4-LANGUAGE FLAGS SWITCHER BAR */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-900/95 rounded-full border border-slate-700/80 shadow-xl mb-4">
            <span className="text-[11px] text-slate-400 font-medium pl-3 pr-1 hidden sm:inline">
              <Globe className="w-3 h-3 inline mr-1 text-amber-400" />
              {t.langSupport}:
            </span>
            {HUB_LANGUAGES.map((l) => {
              const isActive = hubLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setHubLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-300 ring-2 ring-amber-400 shadow-md scale-105'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 opacity-70 hover:opacity-100'
                  }`}
                  title={`${l.label} (${l.country})`}
                  aria-label={l.label}
                >
                  <CountryFlag country={l.code} size="sm" />
                  <span className="text-[11px] font-mono font-bold">{l.code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          <div className="block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t.eventTag}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {t.title}
          </h1>
          <p className="text-sm font-bold text-amber-400 mb-1 max-w-xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            {t.desc}
          </p>

          {/* SEARCH BAR CHÍNH */}
          <div className="relative max-w-lg mx-auto">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-3 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {t.clearSearch}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. GRID GIAN HÀNG & BỘ LỌC + PHÂN TRANG */}
      <main ref={mainRef} id="expo-directory-section" className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 scroll-mt-6">
        {/* BỘ LỌC DÃY / KHU VỰC BOOTH (HORIZONTAL TABS) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.zonePrefix} ({availableZones.length})</span>
            </span>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-2 rounded-lg hover:bg-slate-900"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.resetFilter}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* All Zones Button */}
            <button
              type="button"
              onClick={() => setSelectedZone('ALL')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedZone === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{t.allZones}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedZone === 'ALL' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {initialBooths.length}
              </span>
            </button>

            {/* Individual Zone Buttons */}
            {availableZones.map((zone) => {
              const isSelected = selectedZone === zone;
              const count = zoneCounts[zone] || 0;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{t.zonePrefix} {zone}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* THANH ĐIỀU KHIỂN: THỐNG KÊ + SẮP XẾP + SỐ LƯỢNG / TRANG */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Thông tin hiển thị */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-300 font-medium">
              {t.showing}{' '}
              <strong className="text-amber-400 font-mono font-bold">
                {totalBooths === 0 ? 0 : startIndex + 1} - {endIndex}
              </strong>{' '}
              {t.of}{' '}
              <strong className="text-white font-mono font-bold">{totalBooths}</strong> {t.boothUnit}
            </span>

            {selectedZone !== 'ALL' && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                {t.zonePrefix} {selectedZone}
              </span>
            )}

            {search.trim() && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold truncate max-w-[150px]">
                &ldquo;{search}&rdquo;
              </span>
            )}
          </div>

          {/* Sắp xếp & Số dòng trên trang */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                aria-label={t.sortByLabel}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="booth_asc" className="bg-slate-900 text-white">{t.sortBoothAsc}</option>
                <option value="booth_desc" className="bg-slate-900 text-white">{t.sortBoothDesc}</option>
                <option value="name_asc" className="bg-slate-900 text-white">{t.sortNameAsc}</option>
                <option value="name_desc" className="bg-slate-900 text-white">{t.sortNameDesc}</option>
              </select>
            </div>

            {/* Page Size Dropdown */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label={t.perPage}
                className="bg-transparent text-slate-200 text-xs font-mono font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value={12} className="bg-slate-900 text-white">12 {t.perPage}</option>
                <option value={24} className="bg-slate-900 text-white">24 {t.perPage}</option>
                <option value={48} className="bg-slate-900 text-white">48 {t.perPage}</option>
                <option value={0} className="bg-slate-900 text-white">{t.allPerPage} ({totalBooths})</option>
              </select>
            </div>
          </div>
        </div>

        {/* DANH SÁCH GIAN HÀNG */}
        {totalBooths === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">{t.emptyTitle}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {t.emptyDesc}
            </p>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetFilter}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBooths.map((booth) => {
              const displayName = hubLang === 'vi' 
                ? (booth.name_vi || booth.name)
                : (booth.name_en || booth.name);
              const subName = hubLang === 'vi' ? booth.name_en : booth.name_vi;

              return (
                <div
                  key={booth.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div>
                    {/* Top Bar of Card */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {booth.booth_number}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        SECC TP.HCM
                      </span>
                    </div>

                    {/* Logo + Name */}
                    <div className="flex items-center gap-3 mb-3">
                      {booth.logo_url ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white p-1 border border-slate-700 shrink-0">
                          <Image
                            src={booth.logo_url}
                            alt={displayName}
                            fill
                            unoptimized
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {displayName}
                        </h3>
                        {subName && subName.toLowerCase() !== displayName.toLowerCase() && (
                          <p className="text-[11px] text-amber-400/90 font-medium truncate mt-0.5">
                            {subName}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {booth.address || 'SECC - TP. Hồ Chí Minh'}
                        </p>
                      </div>
                    </div>

                    {/* Product / Industry Summary if available */}
                    {booth.product_info && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
                        {booth.product_info}
                      </p>
                    )}

                    {/* 4 National Flags Readiness on each Booth Card */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 py-2 border-t border-slate-800/80 mb-3">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {t.langSupport}:
                      </span>
                      <div className="flex items-center gap-1.5" title="Hỗ trợ 4 ngôn ngữ: Tiếng Việt, English, 한국어, 中文">
                        {HUB_LANGUAGES.map((l) => (
                          <CountryFlag key={l.code} country={l.code} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3 Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center">
                    <Link
                      href={`/expo/${booth.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors text-[10px] font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 mb-1" />
                      <span>{t.btnScan}</span>
                    </Link>

                    <Link
                      href={`/expo/${booth.slug}/crm`}
                      className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors text-[10px] font-bold"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-400 mb-1" />
                      <span>{t.btnCrm}</span>
                    </Link>

                    <Link
                      href={`/expo/${booth.slug}/qr`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors text-[10px] font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                      <span>{t.btnStandee}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ĐIỀU KHIỂN PHÂN TRANG (PAGINATION BAR) */}
        {!isViewAll && totalPages > 1 && (
          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              {t.pageWord} <strong className="text-white font-mono">{safeCurrentPage}</strong> / {totalPages} ({t.totalWord} {totalBooths} {t.boothUnit})
            </span>

            <div className="flex items-center gap-1.5">
              {/* Nút Trước */}
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage <= 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t.prevPage}</span>
              </button>

              {/* Các số trang */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-slate-500 font-mono">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = p === safeCurrentPage;
                  return (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => handlePageChange(p as number)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Nút Sau */}
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold transition-colors"
              >
                <span className="hidden sm:inline">{t.nextPage}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ĐỊNH VỊ ĐỘC LẬP / INDEPENDENT DIRECTORY DISCLAIMER */}
        <div className="mt-16 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          <p>
            1Booking Expo Pass là nền tảng số hóa danh bạ và giải pháp kết nối B2B độc lập phục vụ các doanh nghiệp & khách tham quan tại SECC TP.HCM. Nền tảng hoạt động độc lập, không phải và không đại diện cho Ban Tổ Chức sự kiện. Mọi tên thương hiệu thuộc về chủ sở hữu hợp pháp.
          </p>
        </div>
      </main>
    </div>
  );
}
