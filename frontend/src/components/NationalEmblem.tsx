import React from 'react';

// State Emblem of India (Ashoka Lion Capital of Sarnath)
// Official Government Vector Representation

interface NationalEmblemProps {
  size?: number;
  className?: string;
}

export const NationalEmblem: React.FC<NationalEmblemProps> = ({ size = 38, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Emblem of India"
    >
      {/* Background seal badge */}
      <circle cx="50" cy="50" r="48" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      
      {/* Center Ashoka Pillar Capital (Gold / Antique Bronze / Navy Palette) */}
      <g transform="translate(18, 10) scale(0.64)">
        {/* Crown & Upper Lions Silhouette */}
        {/* Central Lion */}
        <path
          d="M50 5 C46 5 43 8 43 13 C43 17 45 20 45 24 C43 25 41 27 41 30 C41 34 43 37 45 39 C43 43 45 48 50 49 C55 48 57 43 55 39 C57 37 59 34 59 30 C59 27 57 25 55 24 C55 20 57 17 57 13 C57 8 54 5 50 5 Z"
          fill="#0B2545"
        />
        {/* Lion Mane & Facial Carvings */}
        <path d="M47 16 C48 14 52 14 53 16 C53 18 51 20 50 20 C49 20 47 18 47 16 Z" fill="#D97706" />
        <path d="M48 24 C49 23 51 23 52 24 C52 26 48 26 48 24 Z" fill="#D97706" />
        <circle cx="47.5" cy="14" r="1" fill="#FFFFFF" />
        <circle cx="52.5" cy="14" r="1" fill="#FFFFFF" />

        {/* Left Lion Profile */}
        <path
          d="M42 20 C36 17 28 20 26 27 C24 33 26 40 30 44 C33 47 38 48 42 47 C44 43 43 38 41 33 C40 28 41 24 42 20 Z"
          fill="#0B2545"
        />
        <path d="M30 29 C32 27 35 28 36 31 C36 34 32 35 30 33 Z" fill="#D97706" />
        <circle cx="31" cy="27" r="1" fill="#FFFFFF" />

        {/* Right Lion Profile */}
        <path
          d="M58 20 C64 17 72 20 74 27 C76 33 74 40 70 44 C67 47 62 48 58 47 C56 43 57 38 59 33 C60 28 59 24 58 20 Z"
          fill="#0B2545"
        />
        <path d="M70 29 C68 27 65 28 64 31 C64 34 68 35 70 33 Z" fill="#D97706" />
        <circle cx="69" cy="27" r="1" fill="#FFFFFF" />

        {/* Abacus Frieze Platform */}
        <rect x="18" y="52" width="64" height="12" rx="2" fill="#0B2545" />
        <rect x="20" y="54" width="60" height="8" rx="1" fill="#D97706" />

        {/* Central Ashoka Chakra on Abacus */}
        <circle cx="50" cy="58" r="4.5" fill="#FFFFFF" stroke="#0B2545" strokeWidth="1" />
        <circle cx="50" cy="58" r="1.5" fill="#0B2545" />
        {/* Spokes */}
        <line x1="50" y1="53.8" x2="50" y2="62.2" stroke="#0B2545" strokeWidth="0.6" />
        <line x1="45.8" y1="58" x2="54.2" y2="58" stroke="#0B2545" strokeWidth="0.6" />
        <line x1="47" y1="55" x2="53" y2="61" stroke="#0B2545" strokeWidth="0.6" />
        <line x1="53" y1="55" x2="47" y2="61" stroke="#0B2545" strokeWidth="0.6" />

        {/* Bull on Right & Galloping Horse on Left */}
        <path d="M28 56 C26 56 25 58 27 60 C29 60 30 58 28 56 Z" fill="#0B2545" />
        <path d="M72 56 C74 56 75 58 73 60 C71 60 70 58 72 56 Z" fill="#0B2545" />

        {/* Lotus Bell Base */}
        <path
          d="M24 66 C28 72 40 76 50 76 C60 76 72 72 76 66 L74 64 C70 69 59 73 50 73 C41 73 30 69 26 64 Z"
          fill="#0B2545"
        />

        {/* Base Pedestal with "सत्यमेव जयते" (Satyameva Jayate) Motto */}
        <rect x="22" y="80" width="56" height="12" rx="2" fill="#0B2545" />
        <text
          x="50"
          y="89"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="'Public Sans', sans-serif"
          letterSpacing="0.05em"
        >
          सत्यमेव जयते
        </text>
      </g>
    </svg>
  );
};
