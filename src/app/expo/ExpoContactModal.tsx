"use client";

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Phone,
  User,
  Building2,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { CONTACT_MODAL_TRANSLATIONS, type ExpoLanguage } from '@/types/expo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultBusinessName?: string;
  source?: string;
  lang?: ExpoLanguage;
}

export function ExpoContactModal({
  isOpen,
  onClose,
  defaultBusinessName = '',
  source = '1Booking Expo Pass',
  lang = 'vi',
}: Props) {
  const t = CONTACT_MODAL_TRANSLATIONS[lang] || CONTACT_MODAL_TRANSLATIONS.vi;
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState(t.services[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBusinessName(defaultBusinessName);
      setSelectedService(t.services[0]);
    }
  }, [isOpen, defaultBusinessName, t.services]);

  const handleResetAndClose = () => {
    if (isSubmitting) return;
    setIsSuccess(false);
    setContactName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setSelectedService(t.services[0]);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleResetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !phone.trim()) {
      toast.error(t.errRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expo/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: contactName.trim(),
          phone: phone.trim(),
          business_name: businessName.trim() || null,
          email: email.trim() || null,
          service_type: selectedService,
          message: message.trim() || null,
          source,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || t.errGeneral);
      }

      setIsSuccess(true);
      toast.success(t.successTitle);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg || t.errGeneral);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => { if (!isSubmitting) handleResetAndClose(); }}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE - 100% COMMERCIAL B2B LANGUAGE */
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10 animate-in zoom-in-75">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              {t.successTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              {t.successDesc}
            </p>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              {t.finishBtn}
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t.badge}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
              {t.title}
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {t.desc}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.nameLabel} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Số điện thoại / Zalo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.phoneLabel} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Tên doanh nghiệp / Gian hàng */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.businessLabel}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t.businessPlaceholder}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Dịch vụ quan tâm */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {t.serviceLabel}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {t.services.map((opt) => {
                    const isSelected = selectedService === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedService(opt)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lời nhắn */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.messageLabel}
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.messagePlaceholder}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
                  />
                </div>
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.submittingBtn}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.submitBtn}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1Booking Expo Pass • Realtime B2B Platform</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
