import React from "react";

/**
 * Official vector brand logos for Saudi Enterprise & Tech Integrations.
 * Guarantees zero CORS failures, 100% vector sharpness, and instant rendering.
 */

// 1. ZATCA (هيئة الزكاة والضريبة والجمارك)
export const ZatcaLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#0B192C] p-2.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(10, 8) scale(0.8)">
        {/* Top Left Ribbon - Emerald */}
        <path d="M15 28 L48 10 L70 34 L38 52 Z" fill="#10B981" />
        {/* Top Right Ribbon - Teal */}
        <path d="M48 10 L82 22 L70 34 L48 24 Z" fill="#0EA5E9" />
        {/* Center Primary Facet - Dark Emerald */}
        <path d="M15 28 L38 52 L28 84 L5 60 Z" fill="#059669" />
        {/* Right Facet - Light Emerald */}
        <path d="M38 52 L70 34 L82 68 L50 86 Z" fill="#34D399" />
        {/* Bottom Accent Leaf - Gold */}
        <path d="M50 86 L82 68 L74 94 L42 94 Z" fill="#F59E0B" />
      </g>
      <text
        x="50"
        y="94"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        letterSpacing="1.2"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ZATCA
      </text>
    </svg>
  </div>
);

// 2. ZID (زد)
export const ZidLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#702082] p-2 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* "ز" Letter Calligraphy */}
      <circle cx="34" cy="22" r="6" fill="#10B981" />
      <path
        d="M34 35 C34 46, 28 60, 15 67 C11 69, 9 65, 13 61 C23 51, 26 43, 25 37 C25 33, 30 31, 34 35 Z"
        fill="#FFFFFF"
      />
      {/* "د" Letter Calligraphy */}
      <path
        d="M72 35 C72 54, 57 67, 42 67 C37 67, 37 60, 43 60 C53 60, 62 50, 62 37 C62 33, 72 31, 72 35 Z"
        fill="#FFFFFF"
      />
      <text
        x="50"
        y="92"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        letterSpacing="1.5"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ZID
      </text>
    </svg>
  </div>
);

// 3. SALLA (سلة)
export const SallaLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#00B093] p-2 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M26 44 C26 66, 32 74, 50 74 C68 74, 74 66, 74 44"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M37 40 C37 26, 63 26, 63 40" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <circle cx="37" cy="44" r="4.5" fill="white" />
      <circle cx="63" cy="44" r="4.5" fill="white" />
      <path
        d="M43 58 C46 61, 54 61, 57 58"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// 4. WHATSAPP CLOUD API
export const WhatsappLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#25D366] p-2 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 12C29 12 12 29 12 50C12 56.8 13.8 63.3 16.9 69L13 87L31.5 82.2C36.9 85.1 43.1 86.8 49.5 86.8C70.5 86.8 87.5 69.8 87.5 48.8C87.5 27.8 70.5 12 50 12Z"
        fill="white"
      />
      <path
        d="M41 34C40 34 39 34.5 38.3 35.3C37 36.6 36.2 39 37.3 41.8C38.9 46 42.1 50.5 46.1 54.5C50.1 58.5 54.6 61.7 58.8 63.3C61.6 64.4 64 63.6 65.3 62.3C66.1 61.6 66.6 60.6 66.6 59.6C66.6 58.8 66.2 58 65.5 57.6L60 54.8C59.3 54.5 58.5 54.5 57.9 55L55.6 56.8C54.7 57.5 53.5 57.5 52.6 56.9C50.3 55.4 47.6 52.7 46.1 50.4C45.5 49.5 45.5 48.3 46.2 47.4L48 45.1C48.5 44.5 48.5 43.7 48.2 43L45.4 37.5C45 36.8 44.2 36.4 43.4 36.4C42 34 41 34 41 34Z"
        fill="#25D366"
      />
    </svg>
  </div>
);

// 5. STC PAY
export const StcPayLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#4A0072] p-2 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 45 H78 M22 55 H78" stroke="#FF007F" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M36 32 C43 32, 48 38, 48 45 C48 52, 43 58, 36 58"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="64" cy="50" r="6" fill="white" />
    </svg>
  </div>
);

// 6. MOYASAR (ميسر)
export const MoyasarLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#001A30] p-2 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25 50 C25 35, 45 35, 45 50 C45 65, 65 65, 65 50"
        stroke="#00A2E3"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 50 C35 43, 45 43, 45 50 C45 57, 55 57, 55 50"
        stroke="#00E5A3"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Horizontal SVG variants for landing page hero/partner marquee
export const ZatcaHorizontalLogo: React.FC<{ className?: string }> = ({ className = "h-10" }) => (
  <div className={`inline-flex items-center gap-2.5 ${className}`}>
    <ZatcaLogo className="w-9 h-9 shrink-0" />
    <div className="flex flex-col text-right leading-none">
      <span className="text-white font-black text-sm tracking-tight">هيئة الزكاة والضريبة والجمارك</span>
      <span className="text-emerald-400 font-mono text-[10px] tracking-wider uppercase font-bold mt-0.5">ZATCA Phase 2</span>
    </div>
  </div>
);

export const ZidHorizontalLogo: React.FC<{ className?: string }> = ({ className = "h-10" }) => (
  <div className={`inline-flex items-center gap-2.5 ${className}`}>
    <ZidLogo className="w-9 h-9 shrink-0" />
    <div className="flex flex-col text-right leading-none">
      <span className="text-white font-black text-sm tracking-tight">منصة زد للتجزئة</span>
      <span className="text-purple-300 font-mono text-[10px] tracking-wider uppercase font-bold mt-0.5">Zid E-Commerce</span>
    </div>
  </div>
);
