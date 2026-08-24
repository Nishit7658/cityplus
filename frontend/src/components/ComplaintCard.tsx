'use client';

// C.5 — Complaint Card
// Left accent bar (4px → 6px on hover), category icon, avatar stack, status badge
// D.1 — New arrival animation (teal highlight wash)
// D.2 — Card hover lift

import React from 'react';
import { motion } from 'framer-motion';
import { Complaint } from '@/types';
import { CategoryIcon, getCategoryColor, getSeverityColor } from './CategoryIcon';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';

interface ComplaintCardProps {
  complaint: Complaint;
  isNew?: boolean;
  onClick?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending:    { bg: 'var(--color-tint-pending)',  color: 'var(--color-status-pending)',  border: 'var(--color-status-pending)' },
  Assigned:   { bg: 'var(--color-tint-medium)',   color: 'var(--color-status-progress)', border: 'var(--color-status-progress)' },
  Resolved:   { bg: 'var(--color-tint-low)',      color: 'var(--color-status-resolved)', border: 'var(--color-status-resolved)' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint: c, isNew = false, onClick }) => {
  const accentColor = getCategoryColor(c.category);
  const severityColor = getSeverityColor(c.confirmation_count, c.status);
  const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.Pending;
  const isCritical = c.confirmation_count >= 8 && c.status !== 'Resolved';

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, boxShadow: '0 4px 14px rgba(34,34,31,0.06)', borderColor: 'var(--color-border-strong)' }}
      onClick={onClick}
      className={`relative flex gap-3 rounded-lg border border-cp-border overflow-hidden cursor-pointer bg-cp-surface ${isNew ? 'complaint-arrival' : ''}`}
      style={{
        boxShadow: 'var(--shadow-rest)',
        minHeight: 88,
        padding: '16px 16px 16px 20px',
        transition: 'box-shadow 200ms cubic-bezier(0.22,1,0.36,1), border-color 200ms cubic-bezier(0.22,1,0.36,1), transform 200ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Left accent bar — 4px, animates to 6px on hover via CSS */}
      <motion.div
        whileHover={{ width: 6 }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accentColor,
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Severity dot + category icon */}
      <div className="flex flex-col items-center gap-2 pt-1" style={{ width: 40, flexShrink: 0 }}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: severityColor,
            flexShrink: 0,
          }} />
          <div style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: severityColor,
            opacity: 0.2,
          }} />
          {isCritical && (
            <div
              className="pulse-dot-ring"
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                background: severityColor,
                opacity: 0.3,
              }}
            />
          )}
        </div>
        <CategoryIcon category={c.category} size={20} color="var(--color-ink-muted)" />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          fontWeight: 500,
          color: 'var(--color-ink)',
          marginBottom: 4,
          textTransform: 'capitalize',
        }}>
          {(c.category || '').replace(/_/g, ' ')}
        </div>
        <div style={{
          fontSize: 'var(--fs-body-sm)',
          color: 'var(--color-ink-muted)',
          marginBottom: 10,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {c.description || 'No description provided.'}
        </div>
        <div style={{
          fontSize: 'var(--fs-body-sm)',
          color: 'var(--color-ink-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <span>{c.ward_name || `Ward ${c.ward_id || 1}`}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {typeof c.latitude === 'number' ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : ''}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{timeAgo(c.created_at)}</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <ConfirmationAvatarStack count={c.confirmation_count || 1} size={22} />
        </div>
      </div>

      {/* Status badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, minWidth: 100 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 28,
          padding: '0 10px',
          borderRadius: 'var(--radius-pill)',
          background: statusStyle.bg,
          color: statusStyle.color,
          border: `1px solid ${statusStyle.border}`,
          fontSize: 'var(--fs-body-sm)',
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
        }}>
          {c.status}
        </span>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-ink-faint)',
        }}>
          #{c.id}
        </span>
      </div>
    </motion.div>
  );
};
