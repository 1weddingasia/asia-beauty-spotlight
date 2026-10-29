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
  Phone,
  MessageCircle,
  Mail,
  Search,
  Printer,
  ExternalLink,
  Volume2,
  RefreshCw,
  Building2,
  Clock,
  UserCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getExpoBrandName } from '@/types/expo';

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
    phone: string;
    is_demo?: boolean;
    page_content?: any;
  };
  profile: {
    id?: string;
    event_name: string;
    booth_number: string;
    access_pin: string;
    company_name_vi?: string | null;
    company_name_en?: string | null;
  };
}

export function ExpoCrmClient({ business, profile }: Props) {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [search, setSearch] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const nameVi = getExpoBrandName(business, profile, 'vi');
  const nameEn = getExpoBrandName(business, profile, 'en');
  const isDemoBooth = business.slug === 'deoproce-korea' || business.is_demo;

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

  const handleDeleteDemo = async () => {
    if (!confirm('Anh có chắc muốn XÓA gian hàng mẫu này? Sau khi xóa, trang demo và toàn bộ dữ liệu mẫu sẽ bị xóa vĩnh viễn.')) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/expo/crm', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: business.slug, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa');
      localStorage.removeItem(`expo_pin_${business.slug}`);
      toast.success('Đã xóa gian hàng mẫu thành công!');
      window.location.href = '/expo';
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa');
      setDeleting(false);
    }
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
            {nameVi} {nameEn && nameEn.toLowerCase() !== nameVi.toLowerCase() ? `(${nameEn})` : ''} • Booth {profile.booth_number}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Nhập mã PIN 6 số để mở bảng danh sách khách hàng trực tiếp
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
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập 6 số PIN..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-2xl font-mono tracking-[0.3em] text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Mã PIN mặc định ban đầu: <span className="font-mono text-amber-300 font-bold">123456</span>
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
                Booth: <span className="text-amber-300 font-mono font-bold">{profile.booth_number}</span> • {profile.event_name}
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

            {/* Standee QR print link */}
            <Link
              href={`/expo/${business.slug}/qr`}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>In Standee</span>
            </Link>

            {/* Open Form link */}
            <Link
              href={`/expo/${business.slug}`}
              target="_blank"
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
              Kịch Bản Demo
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Quét mã QR từ điện thoại khác, đúng 1 giây sau chuông <b>Ting!</b> sẽ vang lên.
            </p>
          </div>
        </div>

        {/* DEMO NOTICE BANNER (Chỉ hiển thị cho gian hàng demo để user có thể xem mẫu và tự bấm xóa sau) */}
        {isDemoBooth && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Gian Hàng Mẫu Thử Nghiệm (Demo Showcase)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đây là gian hàng mẫu riêng để anh thử nghiệm chuông và xuất Excel. Khi xem xong, anh có thể bấm nút xóa bên cạnh để dọn dẹp sạch sẽ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteDemo}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Đang xóa...' : 'Xóa Gian Hàng Mẫu Này'}</span>
            </button>
          </div>
        )}

        {/* SEARCH & REFRESH BAR */}
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

          <button
            type="button"
            onClick={() => fetchFreshLeads(false)}
            disabled={loadingLeads}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
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
              <span>Quét thử từ trang này</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((item, idx) => {
              const isHighlight = highlightedId === item.id;
              const cleanPhone = item.customer_phone.replace(/\D/g, '');

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900 border rounded-2xl p-4 transition-all duration-300 ${
                    isHighlight
                      ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Contact Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          #{filteredLeads.length - idx}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {item.customer_name}
                        </h4>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.preferred_lang || 'VI'}
                        </span>
                        {isHighlight && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                            MỚI
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono font-bold text-amber-300">
                          {item.customer_phone}
                        </span>
                        {item.customer_email && (
                          <span className="text-slate-400">{item.customer_email}</span>
                        )}
                        {item.company_name && (
                          <span className="text-slate-300 font-medium">
                            🏢 {item.company_name}
                          </span>
                        )}
                      </div>

                      {item.interests && (
                        <p className="text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-1">
                          📝 {item.interests}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <a
                        href={`tel:${item.customer_phone}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi</span>
                      </a>

                      {cleanPhone && (
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Zalo</span>
                        </a>
                      )}

                      {item.customer_email && (
                        <a
                          href={`mailto:${item.customer_email}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
