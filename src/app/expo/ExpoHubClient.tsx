"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Building2, ExternalLink, BarChart3, Printer, Sparkles, Send, Globe } from 'lucide-react';
import { CountryFlag } from './CountryFlag';

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
  btc_url?: string | null;
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
  btcLabel: string;
  langSupport: string;
  emptyTitle: string;
  emptyDesc: string;
  clearSearch: string;
  telegramTitle: string;
  telegramHeading: string;
  telegramDesc: string;
  telegramBtn: string;
}> = {
  vi: {
    eventTag: 'VIETFRANCHISE 2026 • SECC TP.HCM (29 - 31/10/2026)',
    title: 'VIETFRANCHISE 2026',
    subtitle: 'Triển Lãm Quốc Tế Nhượng Quyền Việt Nam • Vietnam International Franchise Exhibition',
    desc: 'Danh bạ 85 gian hàng thực tế từ ban tổ chức vietfranchise.vn tại SECC. Số hóa QR kết nối đối tác, Standee để bàn và CRM Live theo thời gian thực.',
    searchPlaceholder: 'Tìm theo tên doanh nghiệp, số booth (C07, G26, A10...), ngành hàng...',
    boothsHeading: 'Danh sách gian hàng',
    boothsSub: 'Dữ liệu đồng bộ trực tiếp từ ban tổ chức VietFranchise SECC',
    realBoothsSuffix: 'gian hàng thực tế',
    btnScan: 'Quét Thử',
    btnCrm: 'CRM Live',
    btnStandee: 'In Standee',
    btcLabel: 'Ban Tổ Chức',
    langSupport: 'Hỗ trợ 4 ngôn ngữ',
    emptyTitle: 'Không tìm thấy gian hàng nào',
    emptyDesc: 'Thử tìm kiếm với từ khóa khác hoặc số booth.',
    clearSearch: 'Xóa',
    telegramTitle: 'TẠO GIAN HÀNG NHANH QUA TELEGRAM BOT',
    telegramHeading: 'Cần tạo gian hàng gấp ngay tại hội trường?',
    telegramDesc: 'Chỉ cần nhắn vào Telegram Bot cú pháp: EXPO: Tên Gian Hàng | Số Booth | SĐT | Tên Triển Lãm',
    telegramBtn: 'MỞ TELEGRAM BOT',
  },
  en: {
    eventTag: 'VIETFRANCHISE 2026 • SECC HCMC (Oct 29 - 31, 2026)',
    title: 'VIETFRANCHISE 2026',
    subtitle: 'Vietnam International Franchise Exhibition • Official Directory',
    desc: 'Official directory of 85 verified exhibitors from vietfranchise.vn at SECC. Digitized QR networking, table standees, and real-time CRM.',
    searchPlaceholder: 'Search by exhibitor, booth number (C07, G26, A10...), industry...',
    boothsHeading: 'Exhibitor Directory',
    boothsSub: 'Directly synchronized with VietFranchise SECC official registry',
    realBoothsSuffix: 'verified booths',
    btnScan: 'Scan QR',
    btnCrm: 'Live CRM',
    btnStandee: 'Standee',
    btcLabel: 'Organizer Page',
    langSupport: '4 Languages Ready',
    emptyTitle: 'No exhibitors found',
    emptyDesc: 'Try searching with different keywords or booth number.',
    clearSearch: 'Clear',
    telegramTitle: 'FAST BOOTH CREATION VIA TELEGRAM BOT',
    telegramHeading: 'Need to create a booth instantly at the expo?',
    telegramDesc: 'Simply send a Telegram command: EXPO: Booth Name | Booth Number | Phone | Expo Name',
    telegramBtn: 'OPEN TELEGRAM BOT',
  },
  ko: {
    eventTag: 'VIETFRANCHISE 2026 • 호치민 SECC (2026. 10. 29 - 31)',
    title: 'VIETFRANCHISE 2026',
    subtitle: '베트남 국제 프랜차이즈 박람회 2026 • 공식 부스 명록',
    desc: 'vietfranchise.vn 주최 SECC 85개 공식 참가기업 디렉토리. QR 비즈니스 명함 교환, 탁상용 스탠디 및 실시간 CRM 솔루션.',
    searchPlaceholder: '기업명, 부스 번호(C07, G26, A10...), 업종 검색...',
    boothsHeading: '전시 부스 명록',
    boothsSub: 'VietFranchise SECC 공식 데이터베이스와 100% 동기화',
    realBoothsSuffix: '개 공식 부스',
    btnScan: 'QR 스캔',
    btnCrm: '실시간 CRM',
    btnStandee: '스탠디 인쇄',
    btcLabel: '주최측 공식페이지',
    langSupport: '4개 국어 지원',
    emptyTitle: '검색된 부스가 없습니다',
    emptyDesc: '다른 검색어나 부스 번호로 다시 검색해보세요.',
    clearSearch: '지우기',
    telegramTitle: '텔레그램 봇으로 즉시 부스 개설',
    telegramHeading: '현장에서 즉시 부스 웹페이지가 필요하신가요?',
    telegramDesc: '텔레그램 봇에 전송: EXPO: 부스명 | 부스번호 | 연락처 | 박람회명',
    telegramBtn: '텔레그램 봇 열기',
  },
  zh: {
    eventTag: 'VIETFRANCHISE 2026 • 胡志明市 SECC (2026年10月29-31日)',
    title: 'VIETFRANCHISE 2026',
    subtitle: '2026 越南国际特许加盟展览会 • 官方参展商名录',
    desc: 'SECC vietfranchise.vn 组委会官方认证85个参展商名录。数字化二维码商务交换名片、桌面展架与实时CRM管理。',
    searchPlaceholder: '搜索参展企业、展位号 (C07, G26, A10...)、所属行业...',
    boothsHeading: '参展商名录',
    boothsSub: '直接与 VietFranchise 官方数据实时同步',
    realBoothsSuffix: '个正式展位',
    btnScan: '扫码体验',
    btnCrm: '实时CRM',
    btnStandee: '打印展架',
    btcLabel: '组委会页面',
    langSupport: '支持4国语言',
    emptyTitle: '未找到匹配的展位',
    emptyDesc: '请尝试使用其他关键词或展位号搜索。',
    clearSearch: '清除',
    telegramTitle: '通过 TELEGRAM 机器人极速开通展位',
    telegramHeading: '需要在展会现场紧急开通展位名片吗？',
    telegramDesc: '只需在 Telegram 发送指令：EXPO: 展位名称 | 展位号 | 电话 | 展会名称',
    telegramBtn: '打开 TELEGRAM 机器人',
  },
};

export function ExpoHubClient({ initialBooths }: Props) {
  const [hubLang, setHubLang] = useState<HubLang>('vi');
  const [search, setSearch] = useState('');
  const t = HUB_I18N[hubLang];

  const filteredBooths = initialBooths.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.name_vi && item.name_vi.toLowerCase().includes(q)) ||
      (item.name_en && item.name_en.toLowerCase().includes(q)) ||
      item.booth_number.toLowerCase().includes(q) ||
      (item.address && item.address.toLowerCase().includes(q)) ||
      (item.phone && item.phone.includes(q))
    );
  });

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

      {/* 2. GRID GIAN HÀNG */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{t.boothsHeading}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
              {filteredBooths.length} {t.realBoothsSuffix}
            </span>
          </div>

          <p className="text-xs text-slate-500 hidden sm:block">
            {t.boothsSub}
          </p>
        </div>

        {filteredBooths.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">{t.emptyTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooths.map((booth) => {
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          BOOTH: {booth.booth_number}
                        </span>
                        {booth.is_demo && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Demo
                          </span>
                        )}
                      </div>
                      {booth.btc_url ? (
                        <a
                          href={booth.btc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-amber-400/80 hover:text-amber-300 hover:underline"
                          title="Xem trang chi tiết từ Ban Tổ Chức vietfranchise.vn"
                        >
                          <span>{t.btcLabel}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          SECC 2026
                        </span>
                      )}
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

        {/* 3. TELEGRAM FAST-CREATE TIP BOX */}
        <div className="mt-12 bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl p-6 text-center sm:text-left sm:flex items-center justify-between gap-6">
          <div className="space-y-1 mb-4 sm:mb-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Send className="w-3.5 h-3.5" />
              {t.telegramTitle}
            </span>
            <h4 className="text-base font-bold text-white">
              {t.telegramHeading}
            </h4>
            <p className="text-xs text-slate-400">
              {t.telegramDesc}
            </p>
          </div>

          <a
            href="https://t.me/abs_booking_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t.telegramBtn}</span>
          </a>
        </div>
      </main>
    </div>
  );
}
