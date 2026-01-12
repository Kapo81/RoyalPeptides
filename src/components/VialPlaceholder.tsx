interface VialPlaceholderProps {
  shortName: string;
  className?: string;
}

export default function VialPlaceholder({ shortName, className = '' }: VialPlaceholderProps) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-b from-[#0B0D12] to-[#050608] ${className}`}>
      <svg viewBox="0 0 300 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vialGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a1d24', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0f1115', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0a0c0f', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2a2d34', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1a1d24', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="labelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00A0E0', stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: '#0088c7', stopOpacity: 0.95 }} />
            <stop offset="100%" style={{ stopColor: '#11D0FF', stopOpacity: 0.8 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(150, 200)">
          <rect x="-40" y="-140" width="80" height="200" rx="8" fill="url(#vialGradient)" stroke="#2a2d34" strokeWidth="1.5"/>

          <ellipse cx="0" cy="-140" rx="40" ry="8" fill="url(#capGradient)" stroke="#2a2d34" strokeWidth="1.5"/>
          <rect x="-40" y="-165" width="80" height="25" rx="4" fill="url(#capGradient)" stroke="#2a2d34" strokeWidth="1.5"/>
          <ellipse cx="0" cy="-165" rx="40" ry="8" fill="#1a1d24" stroke="#2a2d34" strokeWidth="1.5"/>

          <rect x="-35" y="-50" width="70" height="85" rx="3" fill="url(#labelGradient)" opacity="0.95" filter="url(#glow)"/>

          <text
            x="0"
            y="-10"
            fontFamily="Arial, sans-serif"
            fontSize="18"
            fontWeight="bold"
            fill="#F5F7FA"
            textAnchor="middle"
            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {shortName.length > 12 ? shortName.substring(0, 12) : shortName}
          </text>

          <text
            x="0"
            y="15"
            fontFamily="Arial, sans-serif"
            fontSize="10"
            fill="#F5F7FA"
            textAnchor="middle"
            opacity="0.8"
          >
            RESEARCH GRADE
          </text>

          <line x1="-30" y1="-70" x2="30" y2="-70" stroke="#F5F7FA" strokeWidth="0.5" opacity="0.3"/>
          <line x1="-30" y1="50" x2="30" y2="50" stroke="#F5F7FA" strokeWidth="0.5" opacity="0.3"/>

          <circle cx="0" cy="80" r="3" fill="#00A0E0" opacity="0.5"/>
          <circle cx="0" cy="100" r="3" fill="#00A0E0" opacity="0.5"/>
          <circle cx="0" cy="120" r="3" fill="#00A0E0" opacity="0.5"/>
        </g>
      </svg>
    </div>
  );
}
