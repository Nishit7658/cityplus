'use client';

// C.10 — Filter Pill Row
// High-visibility interactive filter chips with smooth toggle and clear active state
// Zero clipping or fading masks

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
      className={`flex items-center gap-1.5 flex-wrap ${className}`}
      style={{
        overflow: 'visible',
      }}
    >
      {options.map((opt) => {
        const isActive = active.includes(opt.key);
        return (
          <motion.button
            key={opt.key}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onToggle(opt.key)}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 'var(--radius-pill)',
              border: isActive ? '1.5px solid var(--color-teal-700)' : '1px solid var(--color-border)',
              background: isActive ? 'var(--color-teal-700)' : 'var(--color-surface)',
              color: isActive ? '#FAF7F2' : 'var(--color-ink)',
              cursor: 'pointer',
              fontSize: 'var(--fs-body-sm)',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: isActive ? '0 1px 4px rgba(27, 107, 89, 0.25)' : 'var(--shadow-rest)',
              transition: 'all 150ms cubic-bezier(0.22, 1, 0.36, 1)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                e.currentTarget.style.background = 'var(--color-surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'var(--color-surface)';
              }
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-border-strong)',
                  color: isActive ? '#FAF7F2' : 'var(--color-ink-muted)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '1px 6px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                {opt.count}
              </span>
            )}
            {isActive && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(opt.key);
                }}
                style={{
                  marginLeft: 1,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1,
                  opacity: 0.85,
                }}
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
