// src/components/site/LanguageSwitcher.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAppLanguage } from '@/lib/use-app-language';
import { type AppLanguage } from '@/lib/i18n';
import { ChevronDown, Check, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'mobile';
  className?: string;
  solid?: boolean;
}

export function LanguageSwitcher({
  variant,
  className = '',
  solid = false,
}: LanguageSwitcherProps) {
  const { lang, setLang, languages } = useAppLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active language item
  const currentItem = languages.find((item) => item.code === lang) || languages[0];

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Mobile menu variant
  if (variant === 'mobile') {
    const labelMap: Record<AppLanguage, string> = {
      vi: 'Ngôn ngữ',
      en: 'Language',
      ko: '언어',
      zh: '语言',
    };

    return (
      <div className={`p-2.5 rounded-2xl bg-muted/60 border border-border/80 ${className}`}>
        <div className="text-[11px] font-bold text-muted-foreground mb-2 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5 text-amber-500" />
            <span>{labelMap[lang] || 'Ngôn ngữ'}</span>
          </span>
          <span className="font-mono text-amber-500 font-bold uppercase text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            {currentItem.flag} {currentItem.code.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {languages.map((item) => {
            const isActive = lang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02] ring-1 ring-amber-400'
                    : 'bg-background/90 text-foreground hover:bg-muted hover:text-amber-500 border border-border/70'
                }`}
                title={item.nativeName}
              >
                <span className="text-base mb-0.5">{item.flag}</span>
                <span className="text-[10px] uppercase font-mono tracking-wider">{item.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop & Default: Sleek Dropdown Button (replacing the raw 4-flag horizontal pill)
  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
          solid
            ? 'bg-muted/60 hover:bg-muted border border-border text-foreground hover:border-amber-400 shadow-xs'
            : 'bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-amber-400/60 text-white shadow-xs'
        } ${isOpen ? 'ring-2 ring-amber-400/50 border-amber-400' : ''}`}
        title={`Đổi ngôn ngữ: Hiện tại ${currentItem.nativeName}`}
      >
        <span className="text-sm leading-none">{currentItem.flag}</span>
        <span className="font-mono text-[11px] tracking-wider uppercase font-extrabold">
          {currentItem.code}
        </span>
        <ChevronDown
          className={`size-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Chọn ngôn ngữ"
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl shadow-black/60 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/10 mb-1 flex items-center justify-between">
            <span>Ngôn ngữ / Language</span>
            <Globe className="size-3 text-amber-400" />
          </div>

          <div className="space-y-0.5">
            {languages.map((item) => {
              const isActive = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setLang(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                      : 'text-zinc-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div>
                      <div className="leading-tight">{item.nativeName}</div>
                      <div
                        className={`text-[10px] font-mono uppercase ${
                          isActive ? 'text-slate-900/80 font-bold' : 'text-zinc-400'
                        }`}
                      >
                        {item.label}
                      </div>
                    </div>
                  </div>
                  {isActive && <Check className="size-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
