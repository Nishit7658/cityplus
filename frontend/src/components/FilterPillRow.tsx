'use client';

// C.10 — Filter Pill Row
// Horizontal scrollable chips, edge fade mask on mobile
// D.10 — Toggle: background cross-fade 150ms + scale-pop 1.06 on activation

import React from 'react';
import { motion } from 'framer-motion';

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterPillRowProps {
  options: FilterOption[];
  active: string[];
  onToggle: (key: string) => void;
  className?: string;
}

export const FilterPillRow: React.FC<FilterPillRowProps> = ({ options, active, onToggle, className = '' }) => {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 edge-fade-right ${className}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        flexWrap: 'wrap',
      }}
    >
      {options.map(opt => {
        const isActive = active.includes(opt.key);
        return (
          <motion.button
            key={opt.key}
            whileTap={isActive ? {} : { scale: 1.06 }}
            transition={{ duration: 0.18 }}
            onClick={() => onToggle(opt.key)}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 'var(--radius-pill)',
              border: isActive ? 'none' : '1px solid var(--color-border)',
              background: isActive ? 'var(--color-teal-100)' : 'transparent',
              color: isActive ? 'var(--color-teal-900)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
              fontSize: 'var(--fs-body-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
              flexShrink: 0,
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span style={{
                background: isActive ? 'var(--color-teal-700)' : 'var(--color-border-strong)',
                color: isActive ? '#FAF7F2' : 'var(--color-ink-muted)',
                borderRadius: 'var(--radius-pill)',
                padding: '1px 7px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}>
                {opt.count}
              </span>
            )}
            {isActive && (
              <span
                onClick={(e) => { e.stopPropagation(); onToggle(opt.key); }}
                style={{ marginLeft: 2, opacity: 0.6, fontSize: 14, lineHeight: 1 }}
              >
                ×
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
