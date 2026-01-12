import { useState } from 'react';

interface CanadaLogoProps {
  variant?: 'nav' | 'hero' | 'badge' | 'watermark';
  className?: string;
  showText?: boolean;
}

export default function CanadaLogo({
  variant = 'badge',
  className = '',
  showText = false
}: CanadaLogoProps) {
  const [isClicked, setIsClicked] = useState(false);

  const variantStyles = {
    nav: {
      size: 'h-[18px] w-[27px]',
      glow: false
    },
    hero: {
      size: 'h-[24px] w-[36px]',
      glow: true
    },
    badge: {
      size: 'h-[16px] w-[24px]',
      glow: false
    },
    watermark: {
      size: 'h-full w-full',
      glow: false
    }
  };

  const style = variantStyles[variant];

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div
      className={`inline-flex items-center ${showText ? 'space-x-2' : ''} ${className} cursor-pointer group`}
      onClick={handleClick}
    >
      <div className="relative inline-flex items-center">
        {style.glow && (
          <>
            <div
              className="absolute inset-0 bg-red-600/30 rounded-sm blur-md animate-[redGlowPulse_4s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:opacity-50"
              style={{ willChange: 'transform, opacity' }}
            />
            <div
              className="absolute inset-0 bg-red-500/20 rounded-sm blur-sm opacity-40"
              style={{ willChange: 'opacity' }}
            />
          </>
        )}
        {isClicked && (
          <div
            className="absolute inset-0 bg-white rounded-sm blur-sm animate-[whiteFlash_0.3s_ease-out] pointer-events-none"
            style={{ willChange: 'opacity' }}
          />
        )}
        <svg
          viewBox="0 0 36 18"
          className={`${style.size} relative z-10 transition-all duration-300 group-hover:brightness-110 group-active:scale-95 motion-reduce:transition-none`}
          style={{ willChange: 'transform' }}
          role="img"
          aria-label={variant === 'nav' ? 'Canada flag icon – Canadian site' : 'Canada flag emblem – Canadian-made research-grade peptides'}
        >
          <rect width="36" height="18" fill="#FF0000"/>
          <rect x="9" y="0" width="18" height="18" fill="#FFFFFF"/>
          <path
            d="M18 4.5l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z"
            fill="#FF0000"
          />
        </svg>
      </div>
      {showText && (
        <span className="text-xs font-medium text-gray-300 whitespace-nowrap">
          Made in Canada
        </span>
      )}
    </div>
  );
}
