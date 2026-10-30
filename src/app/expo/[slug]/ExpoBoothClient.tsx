"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  EXPO_TRANSLATIONS,
  ExpoLanguage,
  getExpoBrandName,
  formatStandeeBrandName,
  getExpoEventName,
  getStoredExpoLanguage,
  setStoredExpoLanguage,
} from '@/types/expo';
import { Globe, CheckCircle2, Building2, Handshake, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CountryFlag } from '../CountryFlag';
import { ExpoContactModal } from '../ExpoContactModal';

interface Props {
  business: {
    id: string;
    name: string;
    slug: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    website?: string | null;
    page_content?: any;
    category_slug?: string | null;
  };
  profile: {
    id?: string;
    event_name: string;
    event_name_en?: string | null;
    booth_number: string;
    languages_enabled?: ExpoLanguage[] | string[];
    default_language?: ExpoLanguage | string;
    company_name_vi?: string | null;
    company_name_en?: string | null;
  };
}

const LANGUAGE_CONFIG: Array<{ code: ExpoLanguage; label: string; countryName: string }> = [
  { code: 'vi', label: 'Tiếng Việt', countryName: 'Việt Nam' },
  { code: 'en', label: 'English', countryName: 'International / English' },
  { code: 'ko', label: '한국어', countryName: '대한민국 (Korea)' },
  { code: 'zh', label: '中文', countryName: '中国 (China)' },
];

export function ExpoBoothClient({ business, profile }: Props) {
  const [lang, setLang] = useState<ExpoLanguage>((profile.default_language as ExpoLanguage) || 'vi');

  // Đồng bộ ngôn ngữ từ URL query hoặc localStorage
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

  const t = EXPO_TRANSLATIONS[lang] || EXPO_TRANSLATIONS.vi;

  const brandName = getExpoBrandName(business, profile, lang);
  const brand = formatStandeeBrandName(
    getExpoBrandName(business, profile, 'vi'),
    getExpoBrandName(business, profile, 'en')
  );
  const eventName = getExpoEventName(profile, lang);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Mô tả theo ngôn ngữ
  const displayDescription = lang === 'vi' 
    ? (business.page_content?.description_vi || business.page_content?.description || business.address || t.welcome)
    : (business.page_content?.description_en || business.page_content?.description || business.address || t.welcome);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(lang === 'vi' ? 'Vui lòng nhập họ và tên' : 'Please enter your name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      toast.error(lang === 'vi' ? 'Vui lòng nhập số điện thoại hợp lệ' : 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/expo/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || null,
          company_name: company.trim() || null,
          interests: interests.trim() || null,
          preferred_lang: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gửi thông tin không thành công');
      }

      setSubmitted(true);
      toast.success(t.successTitle);
    } catch (err: any) {
      toast.error(err.message || 'Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans pb-24">
      {/* 1. TOP BAR: Back to Expo & Language Selector */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/expo?lang=${lang}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 hover:text-white hover:bg-amber-500/30 border border-amber-500/40 transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
              title={t.expoDirectory}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.backToExpo}</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400 border border-slate-800 truncate">
              {eventName}
            </span>
          </div>

          {/* National Flags Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-full border border-slate-700/80 shadow-inner shrink-0">
            {LANGUAGE_CONFIG.map((item) => {
              const isActive = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSwitchLang(item.code)}
                  className={`relative p-1 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-amber-400/20 ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-400/20'
                      : 'hover:bg-slate-800 opacity-60 hover:opacity-100'
                  }`}
                  title={`${item.label} (${item.countryName})`}
                  aria-label={item.label}
                >
                  <CountryFlag country={item.code} size="md" className="rounded-full overflow-hidden object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. MAIN BOOTH HERO */}
      <main className="max-w-md mx-auto w-full px-4 pt-6 pb-4 flex-1">
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Booth Badge & Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'vi' ? 'Hồ Sơ Doanh Nghiệp Số' : 'Digital Business Pass'}</span>
            </div>

            {business.logo_url ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white p-2 shadow-xl ring-2 ring-amber-500/30 mb-3">
                <Image
                  src={business.logo_url}
                  alt={brand.primary}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg mb-3">
                {brand.primary.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '1B'}
              </div>
            )}

            <h1 className="text-2xl font-black tracking-tight text-white mb-1 [text-wrap:balance]">
              {brand.primary}
            </h1>
            {brand.secondary && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 [text-wrap:balance]">
                {brand.secondary}
              </p>
            )}
            <p className="text-xs text-slate-300 max-w-xs line-clamp-3">
              {displayDescription}
            </p>
          </div>

          {/* Business Website link (if available) - No Hotline / No Zalo */}
          {business.website && (
            <div className="flex justify-center mb-6">
              <a
                href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t.websiteBtn}</span>
              </a>
            </div>
          )}

          <hr className="border-slate-800 my-4" />

          {/* 3. FORM THU THẬP LEAD QUÉT QR */}
          {submitted ? (
            <div className="py-8 px-4 text-center bg-emerald-950/30 border border-emerald-500/30 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t.successTitle}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {t.successMsg}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-400 underline underline-offset-4 hover:text-amber-300"
              >
                {lang === 'vi' ? 'Gửi thêm thông tin khác' : 'Submit another response'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-base font-bold text-amber-300 flex items-center justify-center gap-1.5">
                  <Handshake className="w-4 h-4 text-amber-400" />
                  {t.formTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {t.formSubtitle}
                </p>
              </div>

              {/* Tên */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.nameLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* SĐT */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.phoneLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Công ty */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.companyLabel}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t.companyPlaceholder}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Nhu cầu */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.interestLabel}
                </label>
                <textarea
                  rows={2}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder={t.interestPlaceholder}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide mt-2"
              >
                {loading ? t.submittingBtn : t.submitBtn}
              </button>
            </form>
          )}
        </div>

        {/* 4. DISCREET FOOTER & LINKS */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <Link
            href={`/expo?lang=${lang}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white py-2.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md active:scale-[0.98]"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.viewDirectoryBtn}</span>
          </Link>

          <Link
            href={`/expo/${business.slug}/crm?lang=${lang}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors py-1 px-3 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <Lock className="w-3 h-3" />
            <span>Quản Trị Mini-CRM (Live)</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors py-1.5 px-3.5 rounded-full hover:bg-slate-900 border border-amber-500/30 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Liên Hệ 1Booking Digital Pass</span>
          </button>

          <p className="text-[10px] text-slate-600">
            Powered by 1Booking.Asia
          </p>
        </div>
      </main>

      {/* POPUP MODAL LIÊN HỆ */}
      <ExpoContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        defaultBusinessName={brandName}
        source={`1Booking Expo Pass - Gian Hàng ${brandName}`}
        lang={lang}
      />
    </div>
  );
}
