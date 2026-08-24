'use client';

// E.5 / D.8 — Priority Score Radial Gauge
// SVG circular progress ring, stroke-dasharray animates 0→target over 700ms
// Ring color shifts sage→amber→brick based on value

import React, { useEffect, useRef } from 'react';

interface PriorityRingProps {
  value: number;        // 0–100 score
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

function scoreToColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.7) return '#B33B2E'; // brick
  if (ratio >= 0.4) return '#D89A2C'; // amber
  return '#6B9E7A';                    // sage
}

export const PriorityRing: React.FC<PriorityRingProps> = ({
  value = 0,
  maxValue = 100,
  size = 72,
  strokeWidth = 5,
  label,
  sublabel,
}) => {
  const safeValue = Math.min(Math.max(value, 0), maxValue);
  const ratio = safeValue / maxValue;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const color = scoreToColor(safeValue, maxValue);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    // Start at 0
    el.style.strokeDashoffset = String(circumference);
    el.style.transition = 'none';
    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1), stroke 700ms ease`;
        el.style.strokeDashoffset = String(circumference * (1 - ratio));
      });
    });
  }, [value, circumference, ratio]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Animated ring */}
        <circle
          ref={ringRef}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label !== undefined && (
          <span style={{
            fontSize: size > 60 ? '16px' : '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink)',
            lineHeight: 1,
          }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span style={{
            fontSize: '10px',
            color: 'var(--color-ink-muted)',
            fontFamily: 'var(--font-body)',
            marginTop: 2,
          }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
