// E.1 — Custom Category Icon Set
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Clean, high-contrast GovTech styling, 1.5px stroke, 24×24px viewBox

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  fillColor?: string;
  className?: string;
}

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const PotholeIcon = ({ size = 24, color = '#0B2545', fillColor = 'rgba(11,37,69,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <ellipse cx="12" cy="13" rx="8" ry="5" stroke={color} fill={fillColor} />
    <path d="M8 13 Q9 9 12 8 Q15 9 16 13" stroke={color} fill="none" />
    <path d="M10 11 Q10.5 10 11 10.5" stroke={color} />
    <path d="M13 10.5 Q13.5 10 14 11" stroke={color} />
  </svg>
);

export const WaterLeakIcon = ({ size = 24, color = '#1E40AF', fillColor = 'rgba(30,64,175,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <path d="M12 3 Q15 8 15 12 A3 3 0 0 1 9 12 Q9 8 12 3Z" stroke={color} fill={fillColor} />
    <path d="M9 18 Q9.5 16 10 18" stroke={color} strokeWidth={1.2} />
    <path d="M12 19 Q12.5 17 13 19" stroke={color} strokeWidth={1.2} />
    <path d="M15 18 Q15.5 16 16 18" stroke={color} strokeWidth={1.2} />
  </svg>
);

export const StreetlightIcon = ({ size = 24, color = '#D97706', fillColor = 'rgba(217,119,6,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <line x1="12" y1="21" x2="12" y2="8" stroke={color} />
    <path d="M12 8 Q12 4 17 4" stroke={color} fill="none" />
    <ellipse cx="17" cy="4" rx="2.5" ry="1.5" stroke={color} fill={fillColor} />
    <line x1="9" y1="21" x2="15" y2="21" stroke={color} />
  </svg>
);

export const GarbageIcon = ({ size = 24, color = '#475569', fillColor = 'rgba(71,85,105,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <path d="M5 8 L6.5 20 H17.5 L19 8Z" stroke={color} fill={fillColor} />
    <line x1="3" y1="8" x2="21" y2="8" stroke={color} />
    <path d="M9 8 V6 Q9 4 12 4 Q15 4 15 6 V8" stroke={color} />
    <path d="M9 12 L9.5 17" stroke={color} strokeWidth={1.2} />
    <path d="M12 12 V17" stroke={color} strokeWidth={1.2} />
    <path d="M15 12 L14.5 17" stroke={color} strokeWidth={1.2} />
    <path d="M7 6 Q5 4 4 5" stroke={color} strokeWidth={1.2} />
    <path d="M17 6 Q19 4 20 5" stroke={color} strokeWidth={1.2} />
  </svg>
);

export const ManholeIcon = ({ size = 24, color = '#B91C1C', fillColor = 'rgba(185,28,28,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <ellipse cx="12" cy="12" rx="9" ry="5" stroke={color} fill={fillColor} />
    <ellipse cx="12" cy="10" rx="5" ry="2.5" stroke={color} fill="none" />
    <line x1="7" y1="10" x2="7" y2="12" stroke={color} />
    <line x1="17" y1="10" x2="17" y2="12" stroke={color} />
    <path d="M10 9.5 L10 8 M12 9 L12 7.5 M14 9.5 L14 8" stroke={color} strokeWidth={1.2} />
  </svg>
);

export const WiringIcon = ({ size = 24, color = '#D97706', fillColor = 'rgba(217,119,6,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <path d="M4 18 L10 12" stroke={color} />
    <path d="M14 8 L20 4" stroke={color} />
    <path d="M10 12 Q12 10 14 8" stroke={color} strokeDasharray="2 1.5" />
    <circle cx="10" cy="12" r="1.5" stroke={color} fill={fillColor} />
    <path d="M12 6 L15 3 M14 8 L17 5" stroke={color} strokeWidth={1.2} />
    <path d="M7 17 L4 20 M8 15 L5 18" stroke={color} strokeWidth={1.2} />
  </svg>
);

export const GasLeakIcon = ({ size = 24, color = '#B91C1C', fillColor = 'rgba(185,28,28,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <path d="M12 20 A6 6 0 0 1 6 14 C6 10 12 4 12 4 C12 4 18 10 18 14 A6 6 0 0 1 12 20Z" stroke={color} fill={fillColor} />
    <path d="M10 16 Q11 13 12 15 Q13 12 14 10" stroke={color} strokeWidth={1.2} />
    <path d="M8 8 Q7 6 8 5" stroke={color} strokeWidth={1} />
    <path d="M16 8 Q17 6 16 5" stroke={color} strokeWidth={1} />
    <path d="M6 12 Q4 11 4 10" stroke={color} strokeWidth={1} />
    <path d="M18 12 Q20 11 20 10" stroke={color} strokeWidth={1} />
  </svg>
);

export const RoadDamageIcon = ({ size = 24, color = '#334155', fillColor = 'rgba(51,65,85,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <rect x="3" y="8" width="18" height="8" rx="1" stroke={color} fill={fillColor} />
    <path d="M8 8 L10 12 L7 16" stroke={color} fill="none" />
    <path d="M14 8 L16 13 L13 16" stroke={color} fill="none" />
    <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeDasharray="3 2" strokeWidth={1} />
  </svg>
);

export const DrainageIcon = ({ size = 24, color = '#0284C7', fillColor = 'rgba(2,132,199,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <path d="M4 6 H20 V10 H4 Z" stroke={color} fill={fillColor} />
    <path d="M7 10 L7 18" stroke={color} />
    <path d="M12 10 L12 18" stroke={color} />
    <path d="M17 10 L17 18" stroke={color} />
    <path d="M4 6 L12 3 L20 6" stroke={color} />
  </svg>
);

export const TrafficSignalIcon = ({ size = 24, color = '#0B2545', fillColor = 'rgba(11,37,69,0.08)', className }: IconProps) => (
  <svg {...baseProps(size)} className={className}>
    <rect x="8" y="3" width="8" height="14" rx="2" stroke={color} fill={fillColor} />
    <circle cx="12" cy="7"  r="1.5" stroke={color} fill="rgba(185,28,28,0.7)" />
    <circle cx="12" cy="11" r="1.5" stroke={color} fill="rgba(217,119,6,0.7)" />
    <circle cx="12" cy="15" r="1.5" stroke={color} fill="rgba(21,128,61,0.7)" />
    <line x1="12" y1="17" x2="12" y2="21" stroke={color} />
    <line x1="9" y1="21" x2="15" y2="21" stroke={color} />
  </svg>
);

// Category icon resolver
export type CategoryKey =
  | 'pothole' | 'water_leak' | 'broken_streetlight' | 'garbage_overflow'
  | 'open_manhole' | 'exposed_wiring' | 'gas_leak' | 'road_damage' | 'drainage' | 'traffic_signal';

export const CategoryIcon = ({
  category,
  size = 20,
  color,
  fillColor,
  className,
}: {
  category: string;
  size?: number;
  color?: string;
  fillColor?: string;
  className?: string;
}) => {
  const props = { size, color, fillColor, className };
  const key = (category || '').toLowerCase().replace(/\s+/g, '_') as CategoryKey;
  switch (key) {
    case 'pothole':             return <PotholeIcon {...props} />;
    case 'water_leak':          return <WaterLeakIcon {...props} />;
    case 'broken_streetlight':  return <StreetlightIcon {...props} />;
    case 'garbage_overflow':    return <GarbageIcon {...props} />;
    case 'open_manhole':        return <ManholeIcon {...props} />;
    case 'exposed_wiring':      return <WiringIcon {...props} />;
    case 'gas_leak':            return <GasLeakIcon {...props} />;
    case 'road_damage':         return <RoadDamageIcon {...props} />;
    case 'drainage':            return <DrainageIcon {...props} />;
    case 'traffic_signal':      return <TrafficSignalIcon {...props} />;
    default:                    return <PotholeIcon {...props} />;
  }
};

// Category color map (High-contrast official municipal palette)
export const getCategoryColor = (category: string): string => {
  const map: Record<string, string> = {
    pothole:            '#0B2545',
    water_leak:         '#1E40AF',
    broken_streetlight: '#D97706',
    garbage_overflow:   '#475569',
    open_manhole:       '#B91C1C',
    exposed_wiring:     '#D97706',
    gas_leak:           '#B91C1C',
    road_damage:        '#334155',
    drainage:           '#0284C7',
    traffic_signal:     '#0B2545',
  };
  return map[(category || '').toLowerCase().replace(/\s+/g, '_')] || '#0B2545';
};

export const getSeverityColor = (confirmationCount: number, status: string): string => {
  if (status === 'Resolved') return '#15803D';
  if (confirmationCount >= 8)  return '#B91C1C';
  if (confirmationCount >= 4)  return '#B45309';
  return '#166534';
};
