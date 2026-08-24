'use client';

// D.7 — Count-Up Stat Number animation
// requestAnimationFrame, ease-out cubic-bezier(0.16, 1, 0.3, 1), 600–800ms

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// 7-day sparkline SVG (pure minimal, 48×20px, no axis)
const Sparkline = ({ data, color = '#2E8C7B' }: { data: number[]; color?: string }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 48, h = 20;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ display: 'block' }}>
      <polyline points={points} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

interface StatCardProps {
  eyebrow: string;
  value: number;
  trend?: { direction: 'up' | 'down'; percent: number; positive?: boolean };
  sparklineData?: number[];
  className?: string;
}

function easeOut(t: number): number {
  // cubic-bezier(0.16, 1, 0.3, 1) approximation
  return 1 - Math.pow(1 - t, 3);
}

export const StatCard: React.FC<StatCardProps> = ({ eyebrow, value, trend, sparklineData, className = '' }) => {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const duration = 700;

  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(easeOut(t) * value));
      if (t < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  const TrendArrow = ({ dir, pos }: { dir: 'up' | 'down'; pos?: boolean }) => {
    const color = pos
      ? 'var(--color-severity-low)'
      : 'var(--color-severity-critical)';
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: 'inline', marginBottom: 1 }}>
        {dir === 'up'
          ? <polygon points="5,1 9,9 1,9" fill={color} />
          : <polygon points="1,1 9,1 5,9" fill={color} />}
      </svg>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 14px rgba(34,34,31,0.06)' }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-cp-surface border border-cp-border rounded-lg p-6 relative overflow-hidden cursor-default ${className}`}
      style={{ boxShadow: 'var(--shadow-rest)' }}
    >
      <p style={{
        fontSize: 'var(--fs-eyebrow)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-ink-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 8,
        fontWeight: 600,
      }}>
        {eyebrow}
      </p>

      <p style={{
        fontSize: 'var(--fs-display-xl)',
        fontFamily: 'var(--font-display)',
        color: 'var(--color-ink)',
        lineHeight: 'var(--lh-display-xl)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      }}>
        {displayed.toLocaleString()}
      </p>

      {trend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
          fontSize: 'var(--fs-body-sm)',
        }}>
          <TrendArrow dir={trend.direction} pos={trend.positive} />
          <span style={{ color: trend.positive ? 'var(--color-severity-low)' : 'var(--color-severity-critical)', fontWeight: 600 }}>
            {trend.percent}%
          </span>
          <span style={{ color: 'var(--color-ink-faint)' }}>vs last week</span>
        </div>
      )}

      {sparklineData && (
        <div style={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.7 }}>
          <Sparkline data={sparklineData} />
        </div>
      )}
    </motion.div>
  );
};
