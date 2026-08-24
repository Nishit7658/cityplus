'use client';

// C.6 — Recurring Problem Alert Card
// Terracotta tinted bg, 6px left bar, D.9 stitch reveal animation on scroll-into-view
// Circular-arrow recurrence glyph, italic serif recommendation text

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Complaint } from '@/types';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';

interface RecurringAlertCardProps {
  complaint: Complaint;
  onClick?: () => void;
}

// Circular arrow recurrence glyph — custom SVG (not a warning triangle)
const RecurrenceGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 10A6.5 6.5 0 1 1 10 16.5" stroke="#C05B32" />
    <path d="M3.5 6.5V10H7" stroke="#C05B32" />
  </svg>
);

export const RecurringAlertCard: React.FC<RecurringAlertCardProps> = ({ complaint: c, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // D.9 — IntersectionObserver: stitch reveal on first scroll-into-view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  const months = c.months_span || Math.ceil((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -2, boxShadow: '0 4px 14px rgba(34,34,31,0.06)' }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="relative rounded-lg border overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(192,91,50,0.06) 0%, #FFFFFF 60%)',
        border: '1px solid #D8CFBD',
        boxShadow: 'var(--shadow-rest)',
        padding: '16px 16px 16px 22px',
      }}
    >
      {/* D.9 — Stitch reveal: bar draws top-to-bottom on scroll-into-view */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 6,
          background: 'var(--color-terracotta-700)',
          borderRadius: '12px 0 0 12px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          className={revealed ? 'stitch-bar' : ''}
          style={{
            width: '100%',
            height: revealed ? '100%' : '0%',
            background: 'var(--color-terracotta-700)',
            transformOrigin: 'top',
          }}
        />
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <RecurrenceGlyph />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 'var(--fs-eyebrow)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-terracotta-700)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            marginBottom: 4,
          }}>
            Recurring Problem
          </div>
          <div style={{
            fontSize: 16,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: 'var(--color-ink)',
          }}>
            Reported <strong style={{ color: 'var(--color-terracotta-700)' }}>{c.total_cycles || c.months_span || 2}×</strong> in {months} months
          </div>
        </div>
      </div>

      {/* Category + location */}
      <div style={{
        fontSize: 'var(--fs-body-sm)',
        color: 'var(--color-ink-muted)',
        marginBottom: 10,
        textTransform: 'capitalize',
      }}>
        {(c.category || '').replace(/_/g, ' ')} · {c.ward_name || `Ward ${c.ward_id || 1}`}
      </div>

      {/* Italic serif recommendation — deliberate typographic differentiator */}
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 15,
        fontStyle: 'italic',
        color: 'var(--color-ink-muted)',
        lineHeight: 1.5,
        marginBottom: 12,
      }}>
        Recommend structural repair, not a routine fix.
      </p>

      {/* Avatar stack */}
      <ConfirmationAvatarStack count={c.confirmation_count || 1} size={22} />
    </motion.div>
  );
};
