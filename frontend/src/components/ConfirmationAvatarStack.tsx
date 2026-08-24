'use client';

// E.3 — Confirmation Avatar Stack
// Overlapping circular avatars showing confirmers (24px, -8px overlap, white 2px border)
// Used consistently: Complaint Cards, Detail Drawer, Hotspot cards

import React from 'react';

const MUTED_COLORS = [
  { bg: '#E3F1EC', text: '#0B4A40' },
  { bg: '#EAF0F4', text: '#2C4A5A' },
  { bg: '#FBF1DF', text: '#6B4A1A' },
  { bg: '#F7E3D8', text: '#7A2E10' },
  { bg: '#F6F2EA', text: '#4A3F2E' },
];

function getInitials(phone: string): string {
  if (!phone) return '?';
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-2) || '??';
}

interface Props {
  count: number;
  phones?: string[];
  size?: number;
  max?: number;
}

export const ConfirmationAvatarStack: React.FC<Props> = ({
  count = 1,
  phones = [],
  size = 24,
  max = 3,
}) => {
  const visible = Math.min(count, max);
  const overflow = count > max ? count - max : 0;

  return (
    <div className="flex items-center">
      <div className="flex" style={{ marginRight: overflow ? 4 : 0 }}>
        {Array.from({ length: visible }).map((_, i) => {
          const phone = phones[i] || '';
          const initials = getInitials(phone);
          const palette = MUTED_COLORS[i % MUTED_COLORS.length];
          return (
            <div
              key={i}
              title={phone || `Confirmer ${i + 1}`}
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: palette.bg,
                color: palette.text,
                border: '2px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.38,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                marginLeft: i === 0 ? 0 : -size * 0.33,
                zIndex: visible - i,
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'var(--color-surface-sunken)',
              color: 'var(--color-ink-muted)',
              border: '2px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.36,
              fontWeight: 600,
              marginLeft: -size * 0.33,
              zIndex: 0,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 'var(--fs-body-sm)',
          color: 'var(--color-ink-muted)',
          marginLeft: 8,
          fontFamily: 'var(--font-body)',
        }}
      >
        {count} {count === 1 ? 'citizen' : 'citizens'}
      </span>
    </div>
  );
};
