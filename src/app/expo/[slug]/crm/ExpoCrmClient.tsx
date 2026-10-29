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
  Printer,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { getExpoBrandName } from '@/types/expo';
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
  };
}

export function ExpoCrmClient({ business, profile }: Props) {
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

  const nameVi = getExpoBrandName(business, profile, 'vi');
  const nameEn = getExpoBrandName(business, profile, 'en');

  const supabase = createClient();
  const leadsRef = useRef<Lead[]>([]);
  leadsRef.current = leads;

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
        throw new Error(data.error || 'Mã PIN không đúng');
      }

      setIsUnlocked(true);
      setLeads(data.leads || []);
      localStorage.setItem(`expo_pin_${business.slug}`, inputPin.trim());
      toast.success('Mở khóa CRM thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Mã PIN không đúng');
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
          toast.success(`🎯 Khách mới: ${newest.customer_name} (${newest.customer_phone})`);
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
          toast.success(`🎯 Khách mới vừa quét: ${newLead.customer_name}!`);
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
      toast.error('Chưa có dữ liệu khách hàng để xuất');
      return;
    }

    try {
      const excelRows = leads.map((item, index) => ({
        STT: index + 1,
        'Thời Gian': new Date(item.created_at).toLocaleString('vi-VN'),
        'Họ Và Tên': item.customer_name,
        'Số Điện Thoại': item.customer_phone,
        Email: item.customer_email || '',
        'Tên Công Ty': item.company_name || '',
        'Nhu Cầu Quan Tâm': item.interests || '',
        'Ngôn Ngữ': (item.preferred_lang || 'vi').toUpperCase(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'KhachHangExpo');

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

      const fileName = `Danh-sach-Lead-Expo-${business.slug}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success('Đã tải xuống file Excel thành công!');
    } catch (err) {
      console.error('[Export Excel Error]:', err);
      toast.error('Lỗi khi xuất file Excel');
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
    const t = setTimeout(() => {
      setHighlightedId(null);
    }, 8000);
    return () => clearTimeout(t);
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
      toast.success(`Đã sao chép ${label}: ${text}`);
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
      setPinError('Vui lòng nhập mã PIN hiện tại (pass cũ)');
      return;
    }
    if (!newP) {
      setPinError('Vui lòng nhập mã PIN mới (pass mới)');
      return;
    }
    if (!/^[A-Za-z0-9]{4,10}$/.test(newP)) {
      setPinError('Mã PIN mới phải từ 4 đến 10 ký tự chữ hoặc số');
      return;
    }
    if (newP !== confirmP) {
      setPinError('Mã PIN mới và xác nhận mã PIN không trùng khớp');
      return;
    }
    if (newP === oldP) {
      setPinError('Mã PIN mới phải khác mã PIN cũ hiện tại');
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
        throw new Error(data.error || 'Đổi mã PIN thất bại');
      }

      setPin(newP);
      localStorage.setItem(`expo_pin_${business.slug}`, newP);
      toast.success('🎉 Đổi mã PIN CRM thành công! Hãy ghi nhớ mã PIN mới.');
      setIsChangePinOpen(false);
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } catch (err: any) {
      setPinError(err.message || 'Lỗi đổi mã PIN');
      toast.error(err.message || 'Lỗi đổi mã PIN');
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
                <h3 className="text-sm font-bold text-white">Đổi Mã PIN CRM</h3>
                <p className="text-[11px] text-slate-400">
                  Gian hàng: {profile.booth_number} • {nameVi}
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
                Mã PIN hiện tại (Pass cũ) <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPinPassword ? 'text' : 'password'}
                maxLength={10}
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
                placeholder="Nhập mã PIN đang sử dụng..."
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* 2. Mã PIN mới */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mã PIN mới (Pass mới) <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPinPassword ? 'text' : 'password'}
                maxLength={10}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="Nhập mã PIN mới (4 - 10 ký tự)..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Độ dài từ 4 đến 10 số hoặc ký tự bảo mật.
              </p>
            </div>

            {/* 3. Xác nhận mã PIN mới */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Xác nhận mã PIN mới <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPinPassword ? 'text' : 'password'}
                maxLength={10}
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                placeholder="Nhập lại mã PIN mới để xác nhận..."
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
                    <span>Ẩn ký tự</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hiện ký tự</span>
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
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={submittingPin || !oldPinInput || !newPinInput || !confirmPinInput}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {submittingPin ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>XÁC NHẬN ĐỔI PIN</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // GIAO DIỆN KHÓA: NHẬP MÃ PIN 6 SỐ
  // ═══════════════════════════════════════════════
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 font-sans">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-black text-white mb-1">
            CRM GIAN HÀNG
          </h1>
          <p className="text-xs text-amber-400 font-semibold mb-1">
            {nameVi} {nameEn && nameEn.toLowerCase() !== nameVi.toLowerCase() ? `(${nameEn})` : ''} • {profile.booth_number}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Nhập mã PIN bảo mật (4 - 10 ký tự) để mở bảng danh sách khách hàng trực tiếp
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
                placeholder="Nhập mã PIN..."
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
                  <span>Đang mở khóa...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>MỞ KHÓA CRM LIVE</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Khu vực bảo mật dành riêng cho đại diện gian hàng</span>
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Vui lòng nhập mã PIN được cấp khi bàn giao gian hàng để mở khóa dữ liệu khách hàng.
            </p>
            <Link
              href="/expo"
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-3 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Danh Bạ Expo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // GIAO DIỆN CRM MỞ KHÓA: LIVE DASHBOARD + EXCEL + CHUÔNG
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white line-clamp-1">
                  {nameVi}
                  {nameEn && nameEn.toLowerCase() !== nameVi.toLowerCase() && (
                    <span className="text-xs text-slate-400 font-normal ml-1.5">
                      ({nameEn})
                    </span>
                  )}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Vị trí: <span className="text-amber-300 font-mono font-bold">{profile.booth_number}</span> • {profile.event_name}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Test Sound button */}
            <button
              type="button"
              onClick={() => {
                playChimeSound();
                toast.info('Chuông Ting-Ting đang hoạt động tốt!');
              }}
              title="Thử âm thanh chuông Ting-Ting"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Change PIN button (Inside CRM) */}
            <button
              type="button"
              onClick={() => {
                setPinError(null);
                setOldPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
                setIsChangePinOpen(true);
              }}
              title="Đổi mã PIN quản trị CRM"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Đổi PIN</span>
            </button>

            {/* Standee QR print link */}
            <Link
              href={`/expo/${business.slug}/qr`}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>In Standee</span>
            </Link>

            {/* Back to Expo Hub */}
            <Link
              href="/expo"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
              title="Về danh bạ 1Booking Expo Pass"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Về Expo</span>
            </Link>

            {/* Open Form link */}
            <Link
              href={`/expo/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Trang Quét</span>
            </Link>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>XUẤT EXCEL</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
        {/* STATS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Tổng Khách Đã Quét
            </span>
            <span className="text-3xl font-black text-amber-400 mt-2 font-mono">
              {leads.length}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Khách Gần Nhất
            </span>
            <span className="text-sm font-semibold text-slate-200 mt-2 line-clamp-1">
              {leads.length > 0 ? leads[0].customer_name : 'Chưa có khách'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-amber-300 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Thông Báo Realtime
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Khách quét mã QR tại gian hàng, dữ liệu lập tức cập nhật và chuông <b>Ting!</b> sẽ vang lên.
            </p>
          </div>
        </div>

        {/* SEARCH & PAGE SIZE BAR */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách, số điện thoại, công ty..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value={10} className="bg-slate-900 text-slate-200">10 / trang</option>
              <option value={20} className="bg-slate-900 text-slate-200">20 / trang</option>
              <option value={50} className="bg-slate-900 text-slate-200">50 / trang</option>
              <option value={100} className="bg-slate-900 text-slate-200">100 / trang</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchFreshLeads(false)}
            disabled={loadingLeads}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLeads ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* 3. LEADS LIST */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">
              {search ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có lượt quét nào'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Mời khách quét mã QR tại quầy để nhận danh sách khách hàng tự động tại đây.
            </p>
            <Link
              href={`/expo/${business.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-500 px-4 py-2 rounded-xl shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở trang liên hệ</span>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Desktop Table View (Compact & Data-Dense) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3">Khách Hàng</th>
                    <th className="py-2.5 px-3">Công Ty</th>
                    <th className="py-2.5 px-3">Số Điện Thoại</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Nhu Cầu Kết Nối</th>
                    <th className="py-2.5 px-3 w-28 text-right">Thời Gian</th>
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
                                MỚI
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
                            onClick={() => handleCopy(item.customer_phone, item.id, 'SĐT')}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors group cursor-pointer"
                            title="Bấm để sao chép số điện thoại"
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
                    className={`p-3 transition-colors ${
                      isHighlight
                        ? 'bg-amber-500/15 border-l-4 border-l-amber-400'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Line 1: Header */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-mono font-bold text-amber-400">#{stt}</span>
                        <CountryFlag country={item.preferred_lang || 'vi'} size="sm" />
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {item.customer_name}
                        </span>
                        {isHighlight && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 animate-pulse">
                            MỚI
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Line 2: Phone & Details */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.customer_phone, item.id, 'SĐT')}
                        className="font-mono font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                        title="Bấm để sao chép"
                      >
                        <span>{item.customer_phone}</span>
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-slate-500" />
                        )}
                      </button>

                      {item.company_name && (
                        <span className="text-slate-400 truncate max-w-[160px]">
                          • 🏢 {item.company_name}
                        </span>
                      )}

                      {item.customer_email && (
                        <span className="text-slate-500 truncate max-w-[140px]">
                          • {item.customer_email}
                        </span>
                      )}
                    </div>

                    {item.interests && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/50">
                        📝 {item.interests}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-400 text-center sm:text-left">
                  Hiển thị <span className="font-bold text-amber-400">{startIndex + 1} - {endIndex}</span> trong tổng số <span className="font-bold text-white">{totalLeads}</span> khách quét
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((p, pIdx) => {
                    if (p === '...') {
                      return <span key={`ellipsis-${pIdx}`} className="px-2 text-slate-600 font-mono">...</span>;
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
                    title="Trang sau"
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
    </div>
  );
}
