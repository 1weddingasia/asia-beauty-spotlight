'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Utensils,
  Phone,
  User,
  Gift,
  Coins,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Check,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PartyDistrictItem } from '@/types/party';

const SAMPLE_PHOTOS = [
  {
    title: 'Sảnh Gỗ Hoàng Gia (Ấm cúng, Đèn Lồng)',
    url: '/images/demo/nha-hang/que-nha-banquet-luxury.jpg',
  },
  {
    title: 'Sảnh Hiện Đại Ánh Vàng (Fine Dining)',
    url: '/images/demo/nha-hang/banner1.jpg',
  },
  {
    title: 'Không Gian Sân Vườn / Rooftop',
    url: '/images/demo/nha-hang/banner2.jpg',
  },
];

interface DangKyClientProps {
  districts: PartyDistrictItem[];
}

export default function DangKyClient({ districts = [] }: DangKyClientProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState(districts[0]?.slug || '');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [partyDeal, setPartyDeal] = useState('');
  const [pricePerPax, setPricePerPax] = useState('');
  const [minGuests, setMinGuests] = useState<number | ''>(20);
  const [maxGuests, setMaxGuests] = useState<number | ''>(250);
  const [photoUrl, setPhotoUrl] = useState('/images/demo/nha-hang/que-nha-banquet-luxury.jpg');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{
    slug: string;
    qr_url: string;
    bank_acc: string;
    bank_name: string;
    bank_owner: string;
    transfer_code: string;
    amount: number;
  } | null>(null);

  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = async (text: string, type: 'acc' | 'code') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        if (type === 'acc') {
          setCopiedAcc(true);
          setTimeout(() => setCopiedAcc(false), 3000);
        } else {
          setCopiedCode(true);
          setTimeout(() => setCopiedCode(false), 3000);
        }
        return;
      } catch {
        // Fallback below
      }
    }
    alert(`Vui lòng sao chép thủ công: ${text}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || !/^(03|05|07|08|09)\d{8}$/.test(cleanPhone)) {
      setErrorMsg('Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số).');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên nhà hàng / quán tiệc.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ quán chi tiết.');
      return;
    }

    if (!district) {
      setErrorMsg('Vui lòng chọn Quận / Huyện cho nhà hàng.');
      return;
    }

    if (!partyDeal.trim()) {
      setErrorMsg('Vui lòng nhập gói ưu đãi tiệc.');
      return;
    }

    const minG = typeof minGuests === 'number' ? minGuests : parseInt(String(minGuests), 10);
    const maxG = typeof maxGuests === 'number' ? maxGuests : parseInt(String(maxGuests), 10);
    if (isNaN(minG) || minG < 1) {
      setErrorMsg('Vui lòng nhập số khách tối thiểu hợp lệ (lớn hơn 0).');
      return;
    }
    if (isNaN(maxG) || maxG < minG) {
      setErrorMsg('Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/party/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          district,
          phone: cleanPhone,
          contact_name: contactName.trim(),
          party_deal: partyDeal.trim(),
          price_per_pax: pricePerPax.trim(),
          min_guests: minG,
          max_guests: maxG,
          photo_url: photoUrl.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi đăng ký.');
      }

      if (!data.slug || typeof data.amount !== 'number') {
        throw new Error('Dữ liệu phản hồi từ hệ thống thiếu thông tin thanh toán.');
      }

      setSuccessData(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi gửi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Header Bar */}
      <header className="border-b border-amber-500/20 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/tat-nien"
            className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Bản Đồ Phố Tiệc</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-extrabold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gói Điểm Tiệc VIP 500.000đ</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Banner Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Dành Riêng Cho Chủ Nhà Hàng & Sảnh Tiệc F&B
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Đăng Ký Điểm Tiệc Siêu Tốc{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Chỉ 500.000đ
            </span>
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Ghim nhà hàng lên Bản đồ 2.5D Phố Tiệc Tất Niên 2026. Chuông Telegram nổ tức thì mỗi khi
            khách công ty đặt tiệc. Kích hoạt trong 5 phút!
          </p>
        </div>

        {/* Success View (VietQR Payment & Confirmation) */}
        {successData ? (
          <div className="bg-zinc-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-2">
              Đăng Ký Thành Công! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 text-center max-w-md mx-auto mb-6">
              Hồ sơ quán <strong className="text-amber-300">{name}</strong> đã được đồng bộ vào hệ thống.
              Chuông Telegram của Ban Quản Trị đã thông báo để ưu tiên xét duyệt cho bạn.
            </p>

            {/* QR Payment Box */}
            <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-5 mb-6 text-center space-y-4">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Quét Mã VietQR Ngân Hàng Kích Hoạt Đèn Neon
              </div>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mx-auto">
                <img
                  src={successData.qr_url}
                  alt="Mã QR VietQR"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="max-w-md mx-auto space-y-2 text-xs text-left bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Ngân hàng:</span>
                  <span className="font-bold text-white">{successData.bank_name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-white">{successData.bank_owner}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                    <span>{successData.bank_acc}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.bank_acc, 'acc')}
                      className="text-zinc-400 hover:text-white"
                      title="Sao chép STK"
                    >
                      {copiedAcc ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Số tiền:</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-sm">
                    {successData.amount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                    <span>{successData.transfer_code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.transfer_code, 'code')}
                      className="text-zinc-400 hover:text-white"
                      title="Sao chép nội dung"
                    >
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Sau khi chuyển khoản, chuyên viên kỹ thuật 1Booking.Asia sẽ liên hệ theo hotline{' '}
                <strong className="text-white">{phone}</strong> trong 5 phút để bàn giao gian hàng số
                và bật sáng đèn ghim neon rực rỡ!
              </p>
            </div>

            {/* Action Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/tat-nien"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-950/40 hover:from-amber-400 hover:to-amber-300 transition-all text-center"
              >
                <span>Xem Bản Đồ Phố Tiệc Tất Niên</span>
              </Link>
              <Link
                href={`/${successData.slug}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs transition-colors text-center"
              >
                <span>Xem Trang Chi Tiết Quán (/{successData.slug})</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Input */
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* 1. Tên quán & Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  Tên Nhà Hàng / Quán Tiệc <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nhà Hàng Ẩm Thực Hải Sản Biển Đông"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Số Điện Thoại Chủ Quán / QL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901234567 (Nhận thông báo tiệc)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* 2. Địa chỉ & Chọn Quận để cắm ghim chuẩn */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Địa Chỉ Chính Xác (Số nhà, Tên đường) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: 123 Nguyễn Thị Minh Khai, Phường Bến Thành"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5">
                  Quận / Huyện (TP.HCM)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={districts.length === 0}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                >
                  {districts.length === 0 ? (
                    <option value="" disabled className="bg-zinc-950 text-white">
                      Đang tải danh sách quận...
                    </option>
                  ) : (
                    districts.map((d) => (
                      <option key={d.id || d.slug} value={d.slug} className="bg-zinc-950 text-white">
                        {d.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* 3. Người liên hệ & Gói ưu đãi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  Tên Chủ Quán / Quản Lý
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="VD: Anh Minh (Chủ nhà hàng)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  Giá Tiệc Bình Quân / Người
                </label>
                <input
                  type="text"
                  value={pricePerPax}
                  onChange={(e) => setPricePerPax(e.target.value)}
                  placeholder="VD: 350.000đ/người (hoặc 300k - 500k)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* 4. Gói ưu đãi tiệc */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-rose-400" />
                Gói Ưu Đãi Tiệc Tất Niên Độc Quyền <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={partyDeal}
                onChange={(e) => setPartyDeal(e.target.value)}
                placeholder="VD: Tặng 2 thùng bia Heineken + dàn Karaoke VIP, Giảm 15% tổng bill..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 transition-colors"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Ưu đãi này sẽ xuất hiện to rõ trên bản đồ và bottom sheet khi khách hàng bấm xem quán.
              </p>
            </div>

            {/* 5. Sức chứa */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Số Khách Tối Thiểu
                </label>
                <input
                  type="number"
                  min={1}
                  value={minGuests}
                  onChange={(e) => setMinGuests(e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => {
                    if (!minGuests || Number(minGuests) < 1) setMinGuests(15);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5">
                  Sức Chứa Tối Đa
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => {
                    if (!maxGuests || Number(maxGuests) < 1) setMaxGuests(200);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* 6. Ảnh sảnh tiệc */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Ảnh Sảnh Tiệc / Bàn Tiệc Đẹp Nhất
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Nhập đường link ảnh hoặc chọn mẫu bên dưới..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />

              <div className="mt-2.5 flex flex-wrap gap-2">
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(sample.url)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                      photoUrl === sample.url
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    📷 {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Quy trình & Cam kết */}
            <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Quy Trình Chốt Điểm Tiệc 500.000đ:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-zinc-400">
                <li>Bấm nút đăng ký bên dưới: Hồ sơ quán được lưu ngay vào database thật của 1Booking.Asia.</li>
                <li>Hệ thống gửi chuông Telegram tức thì về Ban Quản Trị: Quán ABC - Quận X - SĐT: 090xxx.</li>
                <li>Ban Quản Trị gọi xác nhận trong 5 phút, gửi mã VietQR thu 500k và kích hoạt đèn neon rực rỡ!</li>
              </ul>
            </div>

            {districts.length === 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ Hệ thống đang đồng bộ danh mục quận. Vui lòng tải lại trang hoặc liên hệ Hotline/Zalo BQT 1Booking.Asia: 0909.888.588 để đăng ký nhanh.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || districts.length === 0}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm sm:text-base shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang xử lý đăng ký...</span>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-black text-black" />
                  <span>Đăng Ký Điểm Tiệc 500.000đ Ngay</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
