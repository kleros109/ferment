import React from 'react';

interface SourdoughLoafLogoProps {
  className?: string;
  size?: number;
}

export function SourdoughLoafLogo({ className = 'w-10 h-10', size }: SourdoughLoafLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl p-1 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-900/30 border border-amber-500/30 shadow-inner overflow-hidden shrink-0 ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        aria-label="Artisan Sourdough Loaf"
        role="img"
      >
        <defs>
          {/* Main crust gradient */}
          <linearGradient id="crustGrad" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="45%" stopColor="#d97706" />
            <stop offset="85%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Under-ear bloom (soft cream sourdough crumb/interior) */}
          <linearGradient id="bloomGrad" x1="18" y1="20" x2="42" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="60%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Ear shadow for depth */}
          <linearGradient id="earShadow" x1="20" y1="18" x2="46" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#451a03" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
          </linearGradient>

          {/* Flour dusting highlight */}
          <radialGradient id="flourDust" cx="30" cy="18" r="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft bottom glow shadow */}
        <ellipse cx="32" cy="52" rx="22" ry="5" fill="#1c1917" fillOpacity="0.35" />

        {/* Main Boule Body */}
        <path
          d="M10 38C10 24.5 19.5 14 32 14C44.5 14 54 24.5 54 38C54 45 44 49 32 49C20 49 10 45 10 38Z"
          fill="url(#crustGrad)"
        />

        {/* Flour Dusting Layer */}
        <path
          d="M10 38C10 24.5 19.5 14 32 14C44.5 14 54 24.5 54 38C54 45 44 49 32 49C20 49 10 45 10 38Z"
          fill="url(#flourDust)"
        />

        {/* Ear Shadow / Cut depth */}
        <path
          d="M16 34C22 23 35 20 46 25C43 27 34 26 24 33C19 36 17 35 16 34Z"
          fill="url(#earShadow)"
        />

        {/* Open Expansion Bloom (Creamy crumb peeking out from the slash) */}
        <path
          d="M17 33C23 23 37 21 47 26C41 31 30 32 20 37C18 36 17 34.5 17 33Z"
          fill="url(#bloomGrad)"
        />

        {/* The Crisp Raised "Ear" Ridge */}
        <path
          d="M15 34C20 22 36 18 48 24C44 24 32 24 21 31C18 33 16 34.5 15 34Z"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="0.75"
        />

        {/* Wheat Stalk / Blade Scoring Details on Side Crust */}
        {/* Central spine of score */}
        <path
          d="M26 44C32 41 39 37 46 32"
          stroke="#fef3c7"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        {/* Wheat cuts */}
        <path
          d="M31 43L33 40"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M34 40.5L37 43"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M37 38L39 35"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M40 35.5L43 38"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Subtle blistering dots on crust */}
        <circle cx="21" cy="42" r="0.75" fill="#fef3c7" fillOpacity="0.6" />
        <circle cx="24" cy="45" r="0.6" fill="#fef3c7" fillOpacity="0.5" />
        <circle cx="28" cy="46" r="0.8" fill="#fef3c7" fillOpacity="0.6" />
        <circle cx="47" cy="40" r="0.75" fill="#fef3c7" fillOpacity="0.6" />
        <circle cx="50" cy="36" r="0.6" fill="#fef3c7" fillOpacity="0.5" />
      </svg>
    </div>
  );
}
