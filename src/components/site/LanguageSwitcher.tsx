// src/components/site/LanguageSwitcher.tsx
"use client";

import React from 'react';
import { useAppLanguage } from '@/lib/use-app-language';
import { type AppLanguage } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'mobile';
  className?: string;
  solid?: boolean;
}

export function LanguageSwitcher({
  variant = 'pill',
  className = '',
  solid = false,
}: LanguageSwitcherProps) {
  const { lang, setLang, languages } = useAppLanguage();

  if (variant === 'mobile') {
    return (
      <div className={`p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 ${className}`}>
        <div className="text-[11px] font-bold text-slate-400 mb-2 px-1 flex items-center justify-between">
          <span>🌐 Ngôn ngữ / Language:</span>
          <span className="font-mono text-amber-400 font-bold uppercase">{lang}</span>
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
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                }`}
                title={item.label}
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

  // Mặc định: Variant 'pill' nhỏ gọn dùng trên Header và Footer
  return (
    <div
      className={`inline-flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-full border transition-all ${
        solid
          ? 'bg-muted/40 border-border text-foreground shadow-xs'
          : 'bg-black/40 backdrop-blur-md border-white/20 text-white shadow-xs'
      } ${className}`}
      role="group"
      aria-label="Language Switcher"
    >
      {languages.map((item) => {
        const isActive = lang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title={`${item.nativeName} (${item.label})`}
          >
            <span className="text-xs leading-none">{item.flag}</span>
            <span className="text-[10px] font-mono tracking-wider uppercase">{item.code}</span>
          </button>
        );
      })}
    </div>
  );
}
