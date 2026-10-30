"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { playChimeSound } from '@/lib/audio-chime';
import * as XLSX from 'xlsx';
import {
  Lock,
  Unlock,
  KeyRound,
  Download,
  Search,
  ExternalLink,
  Volume2,
  RefreshCw,
  Building2,
  Clock,
  UserCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Globe,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getExpoBrandName,
  getExpoEventName,
  getStoredExpoLanguage,
  setStoredExpoLanguage,
  CRM_TRANSLATIONS,
  type ExpoLanguage,
} from '@/types/expo';
import { CountryFlag } from '../../CountryFlag';

interface Lead {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  company_name?: string | null;
  interests?: string | null;
  preferred_lang?: string;
  created_at: string;
  isNew?: boolean;
}

interface Props {
  business: {
    id: string;
    name: string;
    slug: string;
    phone?: string | null;
    is_demo?: boolean;
    page_content?: any;
  };
  profile: {
    id?: string;
    event_name: string;
    booth_number: string;
    access_pin?: string;
    company_name_vi?: string | null;
    company_name_en?: string | null;
    languages_enabled?: ExpoLanguage[] | string[];
    default_language?: ExpoLanguage | string;
  };
  initialIsActivated?: boolean;
}

const LANGUAGE_CONFIG: Array<{ code: ExpoLanguage; label: string; countryName: string }> = [
  { code: 'vi', label: 'Tiếng Việt', countryName: 'Việt Nam' },
  { code: 'en', label: 'English', countryName: 'International / English' },
  { code: 'ko', label: '한국어', countryName: '대한민국 (Korea)' },
  { code: 'zh', label: '中文', countryName: '中国 (China)' },
];

export function ExpoCrmClient({ business, profile, initialIsActivated = false }: Props) {
  const [lang, setLang] = useState<ExpoLanguage>((profile.default_language as ExpoLanguage) || 'vi');

  // 0. Khởi tạo và đồng bộ ngôn ngữ từ URL query param (?lang=) hoặc localStorage
  useEffect(() => {
    const detected = getStoredExpoLanguage((profile.default_language as ExpoLanguage) || 'vi');
    if (detected && ['vi', 'en', 'ko', 'zh'].includes(detected)) {
      setLang(detected);
    }
  }, [profile.default_language]);

  const handleSwitchLang = (newLang: ExpoLanguage) => {
    setLang(newLang);
    setStoredExpoLanguage(newLang);
  };

  const t = CRM_TRANSLATIONS[lang] || CRM_TRANSLATIONS.vi;

  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [search, setSearch] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State đổi mã PIN
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPinPassword, setShowPinPassword] = useState(false);
  const [submittingPin, setSubmittingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // State Kích hoạt bản quyền 2 Gói (300k sự kiện / 600k cả năm)
  const [isActivated, setIsActivated] = useState<boolean>(Boolean(initialIsActivated));
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [selectedPlanAmount, setSelectedPlanAmount] = useState<number>(300000);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const handleCheckPayment = async () => {
    setCheckingPayment(true);
    try {
      const res = await fetch('/api/payment/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: business.slug }),
      });
      const data = await res.json();
      if (data.success && (data.activated || data.business?.is_expo_active)) {
        setIsActivated(true);
        setIsActivateOpen(false);
        toast.success(t.activateConfirmed);
      } else {
        toast.info(t.activateChecking);
      }
    } catch {
      toast.error('Lỗi khi kiểm tra trạng thái thanh toán.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const brandName = getExpoBrandName(business, profile, lang);
  const eventName = getExpoEventName(profile, lang);

  const supabase = createClient();
  const leadsRef = useRef<Lead[]>([]);
  leadsRef.current = leads;

  // Language switcher component
  const LanguageSwitcher = () => (
    <div className="flex items-center gap-1 bg-slate-900/95 p-0.5 sm:p-1 rounded-full border border-slate-700/80 shadow-inner shrink-0">
      {LANGUAGE_CONFIG.map((item) => {
        const isActive = lang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => handleSwitchLang(item.code)}
            className={`relative p-0.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
              isActive
                ? 'bg-amber-400/20 ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-400/20'
                : 'hover:bg-slate-800 opacity-60 hover:opacity-100'
            }`}
            title={`${item.label} (${item.countryName})`}
            aria-label={item.label}
          >
            <CountryFlag country={item.code} size="sm" className="rounded-full overflow-hidden object-cover" />
          </button>
        );
      })}
    </div>
  );

  // 1. Kiểm tra cache PIN từ localStorage khi vào trang
  useEffect(() => {
    const cachedPin = localStorage.getItem(`expo_pin_${business.slug}`);
    if (cachedPin) {
      setPin(cachedPin);
      verifyPin(cachedPin);
    }
  }, [business.slug]);

  // Hàm xác thực mã PIN
  const verifyPin = async (inputPin: string) => {
    if (!inputPin.trim()) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/expo/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: business.slug, pin: inputPin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(t.pinIncorrect);
      }

      setIsUnlocked(true);
      setLeads(data.leads || []);
      localStorage.setItem(`expo_pin_${business.slug}`, inputPin.trim());
      toast.success(t.pinSuccess);
    } catch {
      toast.error(t.pinIncorrect);
      localStorage.removeItem(`expo_pin_${business.slug}`);
    } finally {
      setVerifying(false);
    }
  };

  // 2. Tải lại danh sách Leads thủ công
  const fetchFreshLeads = async (silent = false) => {
    if (!silent) setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('business_expo_leads')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Kiểm tra xem có lead mới hơn không
        if (leadsRef.current.length > 0 && data.length > leadsRef.current.length) {
          const newest = data[0];
          setHighlightedId(newest.id);
          setCurrentPage(1);
          if (audioEnabled) {
            playChimeSound();
          }
          toast.success(`🎯 ${t.newCustomer}: ${newest.customer_name} (${newest.customer_phone})`);
        }
        setLeads(data);
      }
    } catch (e) {
      console.warn('[Fetch Leads Error]:', e);
    } finally {
      if (!silent) setLoadingLeads(false);
    }
  };

  // 3. Lắng nghe Realtime + Polling 4s fallback
  useEffect(() => {
    if (!isUnlocked) return;

    // Realtime channel
    const channel = supabase
      .channel(`expo-leads-${business.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_expo_leads',
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => [newLead, ...prev]);
          setHighlightedId(newLead.id);
          setCurrentPage(1);
          if (audioEnabled) {
            playChimeSound();
          }
          toast.success(`🎯 ${t.newScan}: ${newLead.customer_name}!`);
        }
      )
      .subscribe();

    // Polling fallback mỗi 4 giây (đề phòng wifi hội chợ chặn websocket)
    const interval = setInterval(() => {
      fetchFreshLeads(true);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isUnlocked, business.id, audioEnabled]);

  // 4. Xuất File Excel 1-chạm
  const handleExportExcel = () => {
    if (leads.length === 0) {
      toast.error(t.exportEmpty);
      return;
    }

    try {
      const excelRows = leads.map((item, index) => ({
        [t.xlNo]: index + 1,
        [t.xlTime]: new Date(item.created_at).toLocaleString('vi-VN'),
        [t.xlName]: item.customer_name,
        [t.xlPhone]: item.customer_phone,
        Email: item.customer_email || '',
        [t.xlCompany]: item.company_name || '',
        [t.xlInterest]: item.interests || '',
        [t.xlLang]: (item.preferred_lang || 'vi').toUpperCase(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

      // Tự động căn chỉnh độ rộng cột
      worksheet['!cols'] = [
        { wch: 6 },  // STT
        { wch: 20 }, // Thời Gian
        { wch: 25 }, // Họ Tên
        { wch: 16 }, // SĐT
        { wch: 25 }, // Email
        { wch: 28 }, // Công Ty
        { wch: 35 }, // Nhu Cầu
        { wch: 10 }, // Ngôn Ngữ
      ];

      const fileName = `Leads-Expo-${business.slug}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success(t.exportSuccess);
    } catch (err) {
      console.error('[Export Excel Error]:', err);
      toast.error(t.exportError);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      lead.customer_name.toLowerCase().includes(q) ||
      lead.customer_phone.includes(q) ||
      (lead.company_name && lead.company_name.toLowerCase().includes(q))
    );
  });

  // Reset trang về 1 khi thay đổi từ khóa tìm kiếm hoặc đổi số dòng/trang
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // Phân trang danh sách Lead
  const totalLeads = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalLeads / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalLeads);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

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

  // Tự động tắt nhấp nháy highlight sau 8 giây
  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => {
      setHighlightedId(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async (text: string, id: string, label: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
      toast.success(`${t.copiedLabel} ${label}: ${text}`);
    } catch {
      toast.info(`${label}: ${text}`);
    }
  };

  // Hàm xử lý đổi mã PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const oldP = oldPinInput.trim();
    const newP = newPinInput.trim();
    const confirmP = confirmPinInput.trim();

    if (!oldP) {
      setPinError(t.errOldPinRequired);
      return;
    }
    if (!newP) {
      setPinError(t.errNewPinRequired);
      return;
    }
    if (!/^[A-Za-z0-9]{4,10}$/.test(newP)) {
      setPinError(t.errPinFormat);
      return;
    }
    if (newP !== confirmP) {
      setPinError(t.errPinMismatch);
      return;
    }
    if (newP === oldP) {
      setPinError(t.errPinSame);
      return;
    }

    setSubmittingPin(true);
    try {
      const res = await fetch('/api/expo/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: business.slug,
          oldPin: oldP,
          newPin: newP,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.changePinFail);
      }

      setPin(newP);
      localStorage.setItem(`expo_pin_${business.slug}`, newP);
      toast.success(t.changePinSuccess);
      setIsChangePinOpen(false);
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } catch (err: any) {
      setPinError(err.message || t.changePinFail);
      toast.error(err.message || t.changePinFail);
    } finally {
      setSubmittingPin(false);
    }
  };

  // Modal đổi mã PIN CRM
  const renderChangePinModal = () => {
    if (!isChangePinOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-left">
          {/* Ambient glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t.changePinTitle}</h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {brandName} • Mini-CRM
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={submittingPin}
              onClick={() => setIsChangePinOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleChangePin} className="space-y-4">
            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                ⚠️ {pinError}
              </div>
            )}

            {/* 1. Mã PIN cũ */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.oldPinLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPinPassword ? 'text' : 'password'}
                maxLength={10}
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
                placeholder={t.oldPinPlaceholder}
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* 2. Mã PIN mới */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.newPinLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPinPassword ? 'text' : 'password'}
                maxLength={10}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder={t.newPinPlaceholder}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {t.pinLengthHint}
              </p>
            </div>

            {/* 3. Xác nhận mã PIN mới */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.confirmPinLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPinPassword ? 'text' : 'password'}
                maxLength={10}
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                placeholder={t.confirmPinPlaceholder}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Toggle show/hide */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowPinPassword(!showPinPassword)}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPinPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{t.hideChars}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.showChars}</span>
                  </>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsChangePinOpen(false)}
                disabled={submittingPin}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>

              <button
                type="submit"
                disabled={submittingPin || !oldPinInput || !newPinInput || !confirmPinInput}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {submittingPin ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.updatingBtn}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.confirmChangePinBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderActivateModal = () => {
    if (!isActivateOpen) return null;

    const BANK_ACC = '00003554020';
    const BANK_NAME = 'TPBank';
    const BANK_OWNER = '1BOOKING.ASIA';
    const cleanSlug = (business.slug || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'EXPO';
    const transferMessage = `EXPO ${cleanSlug}`;
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${selectedPlanAmount}&des=${encodeURIComponent(transferMessage)}`;

    const copyText = async (val: string, label: string) => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(val);
          toast.success(`${label}: ${t.activateCopied}`);
          return;
        }
        toast.info(`${label}: ${val}`);
      } catch {
        toast.info(`${label}: ${val}`);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-left max-h-[90vh] overflow-y-auto">
          {/* Ambient glow */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shadow-inner font-black">
                ⚡
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.activateModalTitle}</h3>
                <p className="text-[11px] text-slate-400">
                  {t.activateModalSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsActivateOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2 Gói Lựa Chọn Duy Nhất */}
          <div className="mb-5 space-y-2.5">
            {/* Gói 1: Sự Kiện 30 Ngày */}
            <button
              type="button"
              onClick={() => setSelectedPlanAmount(300000)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedPlanAmount === 300000
                  ? 'bg-amber-500/15 border-amber-500/70 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎪</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{t.activateEventPlan}</h4>
                    {selectedPlanAmount === 300000 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        {t.activateSelected}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.activateEventPlanDesc}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-black text-amber-400">300.000đ</span>
              </div>
            </button>

            {/* Gói 2: Toàn Niên 365 Ngày */}
            <button
              type="button"
              onClick={() => setSelectedPlanAmount(600000)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedPlanAmount === 600000
                  ? 'bg-amber-500/15 border-amber-500/70 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{t.activateYearlyPlan}</h4>
                    {selectedPlanAmount === 600000 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        {t.activateSelected}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.activateYearlyPlanDesc}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-black text-amber-400">600.000đ</span>
              </div>
            </button>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center mx-auto mb-5 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="VietQR Kích Hoạt"
              className="w-56 h-auto max-w-full rounded-xl object-contain shadow-sm"
            />
            <p className="text-[11px] text-slate-600 font-medium mt-2">
              Mở App ngân hàng quét mã VietQR thanh toán tự động 24/7
            </p>
            <p className="text-xs font-bold text-amber-700 mt-0.5">
              Số tiền: {selectedPlanAmount.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          {/* Bank Details Table */}
          <div className="space-y-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs mb-5">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">{t.activateBankLabel}:</span>
              <span className="font-bold text-white font-mono">{BANK_NAME} (Ngân hàng Tiên Phong)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">{t.activateAccNumLabel}:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-amber-400 text-sm">{BANK_ACC}</span>
                <button
                  type="button"
                  onClick={() => copyText(BANK_ACC, t.activateAccNumLabel)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sao chép số tài khoản"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">{t.activateAccOwnerLabel}:</span>
              <span className="font-bold text-white font-mono">{BANK_OWNER}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{t.activateSyntaxLabel}:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-emerald-400">{transferMessage}</span>
                <button
                  type="button"
                  onClick={() => copyText(transferMessage, t.activateSyntaxLabel)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sao chép nội dung"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer with Check Payment & Close */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={checkingPayment}
              onClick={handleCheckPayment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {checkingPayment ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.activateChecking}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.activateCheckBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsActivateOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer text-center"
            >
              {t.activateClose}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // GIAO DIỆN KHÓA: NHẬP MÃ PIN
  // ═══════════════════════════════════════════════
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 font-sans overflow-x-hidden max-w-full">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          {/* Language Switcher on PIN screen */}
          <div className="flex justify-center mb-5">
            <LanguageSwitcher />
          </div>

          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-black text-white mb-1">
            {t.pinTitle}
          </h1>
          <p className="text-xs text-amber-400 font-semibold mb-1">
            {brandName}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            {t.pinDesc}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyPin(pin);
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinPlaceholder}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-xl font-mono tracking-[0.25em] text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || pin.length < 4}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.pinUnlocking}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t.pinUnlockBtn}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.pinSecurityNote}</span>
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              {t.pinSecurityDesc}
            </p>
            {isActivated ? (
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>{t.activateSuccessBadge}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanAmount(300000);
                  setIsActivateOpen(true);
                }}
                className="mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.activateBtn}</span>
              </button>
            )}
            <Link
              href={`/expo?lang=${lang}`}
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-3 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToExpo}</span>
            </Link>
          </div>
        </div>

        {renderActivateModal()}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // GIAO DIỆN CRM MỞ KHÓA: LIVE DASHBOARD + EXCEL + CHUÔNG
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 overflow-x-clip max-w-full">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 overflow-x-hidden">
        <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
          {/* Row 1: Brand Info & Language Switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[170px] sm:max-w-md">
                    {brandName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  <span className="text-amber-300 font-medium">Mini-CRM</span> • {lang === 'vi' ? 'Quản lý khách & đối tác kết nối' : 'Partner & Lead Management'}
                </p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="shrink-0">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Row 2: Action Toolbar (Hiển thị đầy đủ trực quan thành các hàng trên điện thoại, không cần cuộn ngang) */}
          <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-1.5 sm:gap-2">
            {/* 1. Nút Xuất Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold px-2 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 text-center"
              title={t.exportExcel}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.exportExcel}</span>
            </button>

            {/* 2. Link Tải Standee QR */}
            <Link
              href={`/expo/${business.slug}/qr?lang=${lang}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-amber-400/40 transition-colors active:scale-95 text-center"
              title={t.downloadStandee}
            >
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t.downloadStandee}</span>
            </Link>

            {/* 3. Link Trang Quét Mã Khách Hàng */}
            <Link
              href={`/expo/${business.slug}?lang=${lang}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-blue-400/40 transition-colors active:scale-95 text-center"
              title={t.scanPage}
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{t.scanPage}</span>
            </Link>

            {/* 4. Nút Đổi Mã PIN */}
            <button
              type="button"
              onClick={() => {
                setPinError(null);
                setOldPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
                setIsChangePinOpen(true);
              }}
              title={t.changePinTitle}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 transition-colors cursor-pointer active:scale-95 text-center"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t.changePin}</span>
            </button>

            {/* 5. Nút Thử Chuông Báo */}
            <button
              type="button"
              onClick={() => {
                playChimeSound();
                toast.info(t.soundOk);
              }}
              title={t.soundTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400/40 transition-colors cursor-pointer active:scale-95 text-center"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t.soundTest}</span>
            </button>

            {/* 6. Nút Về Danh Bạ */}
            <Link
              href={`/expo?lang=${lang}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors active:scale-95 text-center"
              title={t.backToExpo}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.backExpo}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 flex-1 overflow-x-hidden">
        {/* BANNER KÍCH HOẠT BẢN QUYỀN HOẶC TRẠNG THÁI ĐÃ KÍCH HOẠT */}
        {isActivated ? (
          <div className="mb-5 sm:mb-6 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-emerald-500/10 border border-emerald-500/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 text-xl shadow-inner">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-emerald-300">
                  {t.activateSuccessBadge}
                </p>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {t.activateSuccessDesc}
                </p>
              </div>
            </div>
            <span className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>VIP Expo Pass</span>
            </span>
          </div>
        ) : (
          <div className="mb-5 sm:mb-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 text-xl shadow-inner font-black">
                ⚡
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-amber-300">
                  {t.activateBannerTitle}
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {t.activateBannerSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPlanAmount(300000);
                setIsActivateOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>{t.activateBtn}</span>
            </button>
          </div>
        )}

        {/* STATS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t.totalScanned}</span>
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">
              {leads.length}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{t.latestCustomer}</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-2 truncate">
              {leads.length > 0 ? leads[0].customer_name : t.noCustomerYet}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <span className="text-xs text-amber-300 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t.realtimeAlert}</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug" dangerouslySetInnerHTML={{ __html: t.realtimeDesc }} />
          </div>
        </div>

        {/* SEARCH & PAGE SIZE BAR */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 absolute left-3 top-2.5 sm:top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 truncate"
            />
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 shrink-0">
            <span className="text-[11px] text-slate-500 hidden sm:inline">{t.show}:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value={10} className="bg-slate-900 text-slate-200">10 {t.perPage}</option>
              <option value={20} className="bg-slate-900 text-slate-200">20 {t.perPage}</option>
              <option value={50} className="bg-slate-900 text-slate-200">50 {t.perPage}</option>
              <option value={100} className="bg-slate-900 text-slate-200">100 {t.perPage}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchFreshLeads(false)}
            disabled={loadingLeads}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer shrink-0"
            title={t.refreshList}
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loadingLeads ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* 3. LEADS LIST */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">
              {search ? t.noMatchFound : t.noScansYet}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              {t.inviteScanDesc}
            </p>
            <Link
              href={`/expo/${business.slug}?lang=${lang}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-500 px-4 py-2 rounded-xl shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.openContactPage}</span>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Desktop Table View (Compact & Data-Dense) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3 w-12 text-center">{t.thNo}</th>
                    <th className="py-2.5 px-3">{t.thCustomer}</th>
                    <th className="py-2.5 px-3">{t.thCompany}</th>
                    <th className="py-2.5 px-3">{t.thPhone}</th>
                    <th className="py-2.5 px-3">{t.thEmail}</th>
                    <th className="py-2.5 px-3">{t.thInterest}</th>
                    <th className="py-2.5 px-3 w-28 text-right">{t.thTime}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedLeads.map((item, idx) => {
                    const isHighlight = highlightedId === item.id;
                    const stt = filteredLeads.length - (startIndex + idx);

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isHighlight
                            ? 'bg-amber-500/15 border-l-4 border-l-amber-400'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        {/* STT */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400/90 text-xs">
                          #{stt}
                        </td>

                        {/* Tên + Cờ Quốc Gia */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <CountryFlag country={item.preferred_lang || 'vi'} size="sm" />
                            <span className="font-bold text-white text-xs truncate max-w-[160px]">
                              {item.customer_name}
                            </span>
                            {isHighlight && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 animate-pulse">
                                {t.newBadge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Công ty */}
                        <td className="py-2.5 px-3 text-slate-300">
                          {item.company_name ? (
                            <span className="truncate max-w-[150px] inline-block font-medium" title={item.company_name}>
                              {item.company_name}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Số điện thoại (Nhấp để chép) */}
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.customer_phone, item.id, t.thPhone)}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors group cursor-pointer"
                            title={t.copiedLabel}
                          >
                            <span>{item.customer_phone}</span>
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </td>

                        {/* Email */}
                        <td className="py-2.5 px-3 text-slate-400">
                          {item.customer_email ? (
                            <a
                              href={`mailto:${item.customer_email}`}
                              className="truncate max-w-[160px] inline-block hover:text-amber-300 hover:underline transition-colors"
                              title={item.customer_email}
                            >
                              {item.customer_email}
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Nhu cầu */}
                        <td className="py-2.5 px-3 text-slate-300">
                          {item.interests ? (
                            <span className="truncate max-w-[200px] inline-block text-slate-300" title={item.interests}>
                              {item.interests}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Thời gian */}
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                          <span className="text-slate-500">{new Date(item.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: High-density compact card list */}
            <div className="block sm:hidden divide-y divide-slate-800/80">
              {paginatedLeads.map((item, idx) => {
                const isHighlight = highlightedId === item.id;
                const stt = filteredLeads.length - (startIndex + idx);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 transition-colors ${
                      isHighlight
                        ? 'bg-amber-500/15 border-l-4 border-l-amber-400'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Line 1: Header (STT + Name + Badge + Time) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-xs font-mono font-bold text-amber-400 shrink-0">#{stt}</span>
                        <CountryFlag country={item.preferred_lang || 'vi'} size="sm" />
                        <span className="text-sm font-bold text-white truncate">
                          {item.customer_name}
                        </span>
                        {isHighlight && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse shrink-0">
                            {t.newBadge}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 shrink-0 bg-slate-950/70 px-2 py-0.5 rounded-md border border-slate-800">
                        {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Line 2: Phone Bar with Quick Call & Copy */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] text-slate-400 shrink-0">{t.thPhone}:</span>
                        <a
                          href={`tel:${item.customer_phone.replace(/\s+/g, '')}`}
                          className="font-mono font-bold text-amber-400 hover:text-amber-300 text-sm tracking-wide truncate"
                        >
                          {item.customer_phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${item.customer_phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                          title={t.callLabel}
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{t.callLabel}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.customer_phone, item.id, t.thPhone)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                          title={copiedId === item.id ? t.copiedLabel : t.copyLabel}
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{copiedId === item.id ? t.copiedLabel : t.copyLabel}</span>
                        </button>
                      </div>
                    </div>

                    {/* Line 3: Company & Email */}
                    {(item.company_name || item.customer_email) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mb-2">
                        {item.company_name && (
                          <div className="inline-flex items-center gap-1 text-slate-300 font-medium">
                            <span>🏢</span>
                            <span className="truncate max-w-[180px]">{item.company_name}</span>
                          </div>
                        )}
                        {item.customer_email && (
                          <a
                            href={`mailto:${encodeURI(item.customer_email.trim())}`}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                          >
                            <span>✉️</span>
                            <span className="truncate max-w-[160px]">{item.customer_email}</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Line 4: Interests Note */}
                    {item.interests && (
                      <div className="text-xs text-slate-300 p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 leading-relaxed">
                        <span className="text-amber-400/90 font-medium mr-1.5">📝 {t.thInterest}:</span>
                        <span>{item.interests}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="px-3 sm:px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <div className="text-slate-400 text-center sm:text-left text-[11px] sm:text-xs">
                  {t.showingRange} <span className="font-bold text-amber-400">{startIndex + 1} - {endIndex}</span> {t.inTotal} <span className="font-bold text-white">{totalLeads}</span> {t.scanned}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t.prevPage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((p, pIdx) => {
                    if (p === '...') {
                      return <span key={`ellipsis-${pIdx}`} className="px-1.5 text-slate-600 font-mono text-xs">...</span>;
                    }
                    const isCurrent = p === safeCurrentPage;
                    return (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => setCurrentPage(p as number)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t.nextPage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {renderChangePinModal()}
      {renderActivateModal()}
    </div>
  );
}
