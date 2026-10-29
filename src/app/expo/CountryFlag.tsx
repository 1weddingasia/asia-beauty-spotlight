import React from 'react';

export type SupportedLanguage = 'vi' | 'en' | 'ko' | 'zh';

interface FlagProps {
  country: SupportedLanguage | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountryFlag({ country, className = '', size = 'md' }: FlagProps) {
  const code = (country || 'vi').toLowerCase();

  const sizeClasses = {
    sm: 'w-5 h-3.5 rounded-sm',
    md: 'w-6 h-4 rounded-[3px]',
    lg: 'w-8 h-5 rounded-md',
  }[size] || 'w-6 h-4 rounded-[3px]';

  // VIETNAM FLAG 🇻🇳
  if (code === 'vi' || code === 'vn') {
    return (
      <svg
        viewBox="0 0 30 20"
        className={`inline-block shrink-0 shadow-xs border border-white/10 overflow-hidden ${sizeClasses} ${className}`}
        aria-label="Cờ Việt Nam"
      >
        <rect width="30" height="20" fill="#da251d" />
        <polygon
          points="15,4 16.5,8.8 21.5,8.8 17.5,11.8 19,16.5 15,13.5 11,16.5 12.5,11.8 8.5,8.8 13.5,8.8"
          fill="#ff0"
        />
      </svg>
    );
  }

  // UNITED KINGDOM / ENGLISH FLAG 🇬🇧
  if (code === 'en' || code === 'gb' || code === 'uk') {
    return (
      <svg
        viewBox="0 0 60 40"
        className={`inline-block shrink-0 shadow-xs border border-white/10 overflow-hidden ${sizeClasses} ${className}`}
        aria-label="English / UK Flag"
      >
        <clipPath id="uk-clip">
          <rect width="60" height="40" />
        </clipPath>
        <g clipPath="url(#uk-clip)">
          <rect width="60" height="40" fill="#012169" />
          {/* Diagonal White */}
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
          {/* Diagonal Red */}
          <path d="M0,0 L30,20 M60,40 L30,20" stroke="#C8102E" strokeWidth="2.5" />
          <path d="M60,0 L30,20 M0,40 L30,20" stroke="#C8102E" strokeWidth="2.5" />
          {/* Cross White */}
          <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="12" />
          {/* Cross Red */}
          <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7" />
        </g>
      </svg>
    );
  }

  // SOUTH KOREA FLAG 🇰🇷
  if (code === 'ko' || code === 'kr') {
    return (
      <svg
        viewBox="0 0 36 24"
        className={`inline-block shrink-0 shadow-xs border border-white/10 overflow-hidden bg-white ${sizeClasses} ${className}`}
        aria-label="Cờ Hàn Quốc"
      >
        <rect width="36" height="24" fill="#ffffff" />
        {/* Taegeuk Circle */}
        <g transform="translate(18, 12)">
          {/* S-curve Taegeuk */}
          <path d="M -6,0 A 6,6 0 0,1 6,0 A 3,3 0 0,1 0,0 A 3,3 0 0,0 -6,0" fill="#cd2e3a" />
          <path d="M 6,0 A 6,6 0 0,1 -6,0 A 3,3 0 0,1 0,0 A 3,3 0 0,0 6,0" fill="#0047a0" />
          {/* 4 Trigrams (simplified clean representation) */}
          <g stroke="#000" strokeWidth="0.9" fill="none">
            {/* Top-left: Qian (3 solid lines) */}
            <g transform="translate(-11, -7) rotate(34)">
              <line x1="-3" y1="-2" x2="3" y2="-2" />
              <line x1="-3" y1="0" x2="3" y2="0" />
              <line x1="-3" y1="2" x2="3" y2="2" />
            </g>
            {/* Bottom-right: Kun (3 broken lines) */}
            <g transform="translate(11, 7) rotate(34)">
              <line x1="-3" y1="-2" x2="-0.5" y2="-2" /><line x1="0.5" y1="-2" x2="3" y2="-2" />
              <line x1="-3" y1="0" x2="-0.5" y2="0" /><line x1="0.5" y1="0" x2="3" y2="0" />
              <line x1="-3" y1="2" x2="-0.5" y2="2" /><line x1="0.5" y1="2" x2="3" y2="2" />
            </g>
            {/* Top-right: Kan */}
            <g transform="translate(11, -7) rotate(-34)">
              <line x1="-3" y1="-2" x2="-0.5" y2="-2" /><line x1="0.5" y1="-2" x2="3" y2="-2" />
              <line x1="-3" y1="0" x2="3" y2="0" />
              <line x1="-3" y1="2" x2="-0.5" y2="2" /><line x1="0.5" y1="2" x2="3" y2="2" />
            </g>
            {/* Bottom-left: Li */}
            <g transform="translate(-11, 7) rotate(-34)">
              <line x1="-3" y1="-2" x2="3" y2="-2" />
              <line x1="-3" y1="0" x2="-0.5" y2="0" /><line x1="0.5" y1="0" x2="3" y2="0" />
              <line x1="-3" y1="2" x2="3" y2="2" />
            </g>
          </g>
        </g>
      </svg>
    );
  }

  // CHINA FLAG 🇨🇳
  if (code === 'zh' || code === 'cn') {
    return (
      <svg
        viewBox="0 0 30 20"
        className={`inline-block shrink-0 shadow-xs border border-white/10 overflow-hidden ${sizeClasses} ${className}`}
        aria-label="Cờ Trung Quốc"
      >
        <rect width="30" height="20" fill="#de2910" />
        {/* Main Big Star */}
        <polygon
          points="5,2 6,5 9,5 6.5,7 7.5,10 5,8 2.5,10 3.5,7 1,5 4,5"
          fill="#ffde00"
        />
        {/* 4 Small Stars */}
        <polygon points="10,2 10.5,3.2 11.8,3.2 10.8,4 11.2,5.2 10,4.4 8.8,5.2 9.2,4 8.2,3.2 9.5,3.2" fill="#ffde00" transform="scale(0.7) translate(4.5, 0)" />
        <polygon points="12,4 12.5,5.2 13.8,5.2 12.8,6 13.2,7.2 12,6.4 10.8,7.2 11.2,6 10.2,5.2 11.5,5.2" fill="#ffde00" transform="scale(0.7) translate(5, 1.5)" />
        <polygon points="12,7 12.5,8.2 13.8,8.2 12.8,9 13.2,10.2 12,9.4 10.8,10.2 11.2,9 10.2,8.2 11.5,8.2" fill="#ffde00" transform="scale(0.7) translate(5, 3.5)" />
        <polygon points="10,9 10.5,10.2 11.8,10.2 10.8,11 11.2,12.2 10,11.4 8.8,12.2 9.2,11 8.2,10.2 9.5,10.2" fill="#ffde00" transform="scale(0.7) translate(4.5, 5)" />
      </svg>
    );
  }

  // Fallback
  return (
    <span className={`inline-flex items-center justify-center bg-slate-800 text-[10px] font-bold text-slate-300 font-mono border border-slate-700 ${sizeClasses} ${className}`}>
      {code.toUpperCase()}
    </span>
  );
}
