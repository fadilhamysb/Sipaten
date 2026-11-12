import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Simbol SVG: Dokumen kebijakan yang terintegrasi dengan gelembung percakapan */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
        aria-hidden="true"
      >
        {/* Latar dokumen kebijakan (Navy #0B1F3A) */}
        <path
          d="M10 6C10 4.89543 10.8954 4 12 4H28L38 14V42C38 43.1046 37.1046 44 36 44H12C10.8954 44 10 43.1046 10 42V6Z"
          fill="#0B1F3A"
        />
        {/* Lipatan sudut dokumen */}
        <path
          d="M28 4V12C28 13.1046 28.8954 14 30 14H38L28 4Z"
          fill="#1C355E"
        />
        {/* Garis teks kebijakan di dokumen */}
        <rect x="16" y="18" width="16" height="2.5" rx="1.25" fill="#E2E8F0" />
        <rect x="16" y="24" width="12" height="2.5" rx="1.25" fill="#CBD5E1" />

        {/* Gelembung komunikasi publik yang terintegrasi (Aksen Merah Kemenko #D32F2F) */}
        <path
          d="M24 28C24 25.7909 25.7909 24 28 24H40C42.2091 24 44 25.7909 44 28V36C44 38.2091 42.2091 40 40 40H34L28 44V40H28C25.7909 40 24 38.2091 24 36V28Z"
          fill="#D32F2F"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Garis pesan di dalam gelembung percakapan */}
        <circle cx="31" cy="32" r="1.5" fill="#FFFFFF" />
        <circle cx="35" cy="32" r="1.5" fill="#FFFFFF" />
        <circle cx="39" cy="32" r="1.5" fill="#FFFFFF" />
      </svg>

      <div className="flex flex-col leading-tight">
        <span className={`font-bold tracking-tight text-[#0B1F3A] ${titleSize}`}>
          SIPATEN
        </span>
        {showSubtitle && (
          <span className={`font-medium text-slate-500 tracking-normal ${subSize}`}>
            Aplikasi Pembuatan Konten
          </span>
        )}
      </div>
    </div>
  );
};
