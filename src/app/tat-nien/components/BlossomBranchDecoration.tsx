import React from 'react';

/**
 * BlossomBranchDecoration
 * Cành hoa mai vàng & hoa đào Tết trang trí góc màn hình mang đậm không khí Xuân Bính Ngọ 2026.
 * Sử dụng SVG Vector độ sắc nét cao, không làm nặng trang, không che khuất thao tác người dùng (pointer-events-none).
 */
export default function BlossomBranchDecoration({
  position = 'top-right',
  className = '',
}: {
  position?: 'top-right' | 'top-left';
  className?: string;
}) {
  const isRight = position === 'top-right';

  return (
    <div
      className={`absolute top-0 ${
        isRight ? 'right-0' : 'left-0'
      } pointer-events-none z-30 overflow-hidden w-36 h-28 sm:w-56 sm:h-40 md:w-72 md:h-48 transition-all ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 260 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md ${isRight ? '' : 'scale-x-[-1]'}`}
        preserveAspectRatio="xMaxYMin meet"
      >
        <defs>
          {/* Gradients cho Cành Gỗ Tự Nhiên */}
          <linearGradient id="branchWoodGrad" x1="260" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="60%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Gradient Cánh Hoa Mai Vàng Rực Rỡ */}
          <radialGradient id="maiPetalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="45%" stopColor="#FDE047" />
            <stop offset="85%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>

          {/* Gradient Cánh Hoa Đào Hồng Thắm */}
          <radialGradient id="daoPetalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="50%" stopColor="#FDA4AF" />
            <stop offset="85%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#E11D48" />
          </radialGradient>

          {/* Gradient Nhụy Hoa */}
          <radialGradient id="pollenGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="80%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>

          {/* Lộc Non / Búp Xanh */}
          <linearGradient id="budLeafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A3E635" />
            <stop offset="100%" stopColor="#4D7C0F" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Cành cây mẹ uốn lượn từ góc trên phải vươn sang trái */}
        <g stroke="url(#branchWoodGrad)" strokeLinecap="round" strokeLinejoin="round">
          {/* Nhánh chính */}
          <path
            d="M260 0 C230 15, 195 22, 160 40 C130 55, 95 68, 55 92 C35 104, 18 122, 10 135"
            strokeWidth="5.5"
            fill="none"
          />
          {/* Nhánh phụ 1 vươn lên cao */}
          <path
            d="M190 24 C175 14, 155 12, 138 18 C125 22, 115 28, 105 35"
            strokeWidth="3"
            fill="none"
          />
          {/* Nhánh phụ 2 trĩu xuống */}
          <path
            d="M140 48 C125 65, 110 85, 98 110 C92 122, 85 138, 80 150"
            strokeWidth="2.8"
            fill="none"
          />
          {/* Nhánh nhỏ lộc xuân */}
          <path d="M85 75 C70 70, 58 72, 45 78" strokeWidth="2" fill="none" />
          <path d="M170 36 C165 48, 158 55, 150 62" strokeWidth="2" fill="none" />
        </g>

        {/* 2. Búp non & Lộc xanh đầu cành */}
        <g fill="url(#budLeafGrad)">
          {/* Lộc non đầu nhánh */}
          <path d="M8 133 C6 128, 9 123, 14 125 C19 127, 18 135, 8 133 Z" />
          <path d="M42 77 C38 74, 40 70, 45 71 C50 72, 48 78, 42 77 Z" />
          <path d="M103 34 C100 30, 103 26, 108 27 C113 28, 111 34, 103 34 Z" />
          <path d="M78 152 C75 148, 77 144, 82 145 C87 146, 85 152, 78 152 Z" />
        </g>

        {/* 3. Nụ hoa mai & hoa đào chưa nở */}
        <g>
          {/* Nụ đào hồng xinh */}
          <ellipse cx="148" cy="64" rx="4" ry="5.5" fill="url(#daoPetalGrad)" transform="rotate(-20 148 64)" />
          <circle cx="147" cy="67" r="2.5" fill="#4D7C0F" />

          {/* Nụ mai vàng e ấp */}
          <ellipse cx="68" cy="85" rx="4" ry="5" fill="url(#maiPetalGrad)" transform="rotate(35 68 85)" />
          <circle cx="70" cy="88" r="2.2" fill="#4D7C0F" />

          {/* Nụ mai nhỏ xinh trên cao */}
          <ellipse cx="120" cy="24" rx="3.5" ry="4.5" fill="url(#maiPetalGrad)" transform="rotate(-15 120 24)" />
          <circle cx="121" cy="27" r="2" fill="#4D7C0F" />
        </g>

        {/* 4. HOA MAI VÀNG BUNG NỞ (Biểu tượng Tài Lộc & May Mắn Phương Nam) */}
        {/* Bông mai lớn 5 cánh xòe đẹp tại vị trí ngã ba nhánh (160, 40) */}
        <g transform="translate(160, 40)" filter="url(#softGlow)">
          {/* 5 Cánh Mai Vàng Phú Quý */}
          <ellipse cx="0" cy="-14" rx="7" ry="11" fill="url(#maiPetalGrad)" />
          <ellipse cx="13" cy="-4" rx="7" ry="11" fill="url(#maiPetalGrad)" transform="rotate(72 13 -4)" />
          <ellipse cx="8" cy="12" rx="7" ry="11" fill="url(#maiPetalGrad)" transform="rotate(144 8 12)" />
          <ellipse cx="-8" cy="12" rx="7" ry="11" fill="url(#maiPetalGrad)" transform="rotate(216 -8 12)" />
          <ellipse cx="-13" cy="-4" rx="7" ry="11" fill="url(#maiPetalGrad)" transform="rotate(288 -13 -4)" />
          {/* Nhụy Đỏ Cam Rực Rỡ */}
          <circle cx="0" cy="0" r="4.5" fill="url(#pollenGrad)" />
          {/* Tia nhụy vàng óng */}
          <line x1="0" y1="0" x2="0" y2="-6" stroke="#FEF08A" strokeWidth="1.2" />
          <line x1="0" y1="0" x2="5" y2="-4" stroke="#FEF08A" strokeWidth="1.2" />
          <line x1="0" y1="0" x2="5" y2="4" stroke="#FEF08A" strokeWidth="1.2" />
          <line x1="0" y1="0" x2="-5" y2="4" stroke="#FEF08A" strokeWidth="1.2" />
          <line x1="0" y1="0" x2="-5" y2="-4" stroke="#FEF08A" strokeWidth="1.2" />
          <circle cx="0" cy="-6" r="1" fill="#EA580C" />
          <circle cx="5" cy="-4" r="1" fill="#EA580C" />
          <circle cx="5" cy="4" r="1" fill="#EA580C" />
          <circle cx="-5" cy="4" r="1" fill="#EA580C" />
          <circle cx="-5" cy="-4" r="1" fill="#EA580C" />
        </g>

        {/* Bông mai thứ hai ở nhánh giữa (100, 70) */}
        <g transform="translate(100, 70) scale(0.85)" filter="url(#softGlow)">
          <ellipse cx="0" cy="-13" rx="6.5" ry="10" fill="url(#maiPetalGrad)" />
          <ellipse cx="12" cy="-4" rx="6.5" ry="10" fill="url(#maiPetalGrad)" transform="rotate(72 12 -4)" />
          <ellipse cx="7" cy="11" rx="6.5" ry="10" fill="url(#maiPetalGrad)" transform="rotate(144 7 11)" />
          <ellipse cx="-7" cy="11" rx="6.5" ry="10" fill="url(#maiPetalGrad)" transform="rotate(216 -7 11)" />
          <ellipse cx="-12" cy="-4" rx="6.5" ry="10" fill="url(#maiPetalGrad)" transform="rotate(288 -12 -4)" />
          <circle cx="0" cy="0" r="4" fill="url(#pollenGrad)" />
          <circle cx="0" cy="0" r="1.5" fill="#FDE047" />
        </g>

        {/* 5. HOA ĐÀO HỒNG THẮM (Tượng trưng cho Mùa Xuân & Duyên Lành Phương Bắc) */}
        {/* Bông đào nở rộ ở nhánh dưới (105, 115) */}
        <g transform="translate(105, 115) scale(0.9)" filter="url(#softGlow)">
          <ellipse cx="0" cy="-13" rx="7" ry="10" fill="url(#daoPetalGrad)" />
          <ellipse cx="12" cy="-4" rx="7" ry="10" fill="url(#daoPetalGrad)" transform="rotate(72 12 -4)" />
          <ellipse cx="8" cy="11" rx="7" ry="10" fill="url(#daoPetalGrad)" transform="rotate(144 8 11)" />
          <ellipse cx="-8" cy="11" rx="7" ry="10" fill="url(#daoPetalGrad)" transform="rotate(216 -8 11)" />
          <ellipse cx="-12" cy="-4" rx="7" ry="10" fill="url(#daoPetalGrad)" transform="rotate(288 -12 -4)" />
          <circle cx="0" cy="0" r="4" fill="url(#pollenGrad)" />
          <circle cx="0" cy="0" r="1.5" fill="#FFE4E6" />
        </g>

        {/* Bông mai nhỏ ở đầu cành trái (32, 110) */}
        <g transform="translate(32, 110) scale(0.7)" filter="url(#softGlow)">
          <ellipse cx="0" cy="-12" rx="6" ry="9" fill="url(#maiPetalGrad)" />
          <ellipse cx="11" cy="-4" rx="6" ry="9" fill="url(#maiPetalGrad)" transform="rotate(72 11 -4)" />
          <ellipse cx="7" cy="10" rx="6" ry="9" fill="url(#maiPetalGrad)" transform="rotate(144 7 10)" />
          <ellipse cx="-7" cy="10" rx="6" ry="9" fill="url(#maiPetalGrad)" transform="rotate(216 -7 10)" />
          <ellipse cx="-11" cy="-4" rx="6" ry="9" fill="url(#maiPetalGrad)" transform="rotate(288 -11 -4)" />
          <circle cx="0" cy="0" r="3.5" fill="url(#pollenGrad)" />
        </g>

        {/* Bông đào nhỏ ở nhánh trên cao (205, 15) */}
        <g transform="translate(205, 15) scale(0.65)" filter="url(#softGlow)">
          <ellipse cx="0" cy="-12" rx="6" ry="9" fill="url(#daoPetalGrad)" />
          <ellipse cx="11" cy="-4" rx="6" ry="9" fill="url(#daoPetalGrad)" transform="rotate(72 11 -4)" />
          <ellipse cx="7" cy="10" rx="6" ry="9" fill="url(#daoPetalGrad)" transform="rotate(144 7 10)" />
          <ellipse cx="-7" cy="10" rx="6" ry="9" fill="url(#daoPetalGrad)" transform="rotate(216 -7 10)" />
          <ellipse cx="-11" cy="-4" rx="6" ry="9" fill="url(#daoPetalGrad)" transform="rotate(288 -11 -4)" />
          <circle cx="0" cy="0" r="3" fill="url(#pollenGrad)" />
        </g>

        {/* 6. Cánh hoa mai / đào nhẹ rơi đón gió xuân */}
        <g opacity="0.85">
          {/* Cánh mai vàng lượn bay */}
          <path
            d="M50 145 C48 140, 56 138, 60 142 C64 146, 56 152, 50 145 Z"
            fill="url(#maiPetalGrad)"
            transform="rotate(25 55 145)"
          />
          {/* Cánh đào hồng rơi nhẹ */}
          <path
            d="M135 140 C132 135, 140 132, 144 136 C148 140, 140 146, 135 140 Z"
            fill="url(#daoPetalGrad)"
            transform="rotate(-15 138 140)"
          />
        </g>
      </svg>
    </div>
  );
}
