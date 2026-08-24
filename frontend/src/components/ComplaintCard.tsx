'use client';

// C.5 — Complaint Card with Bilingual i18n
// Vadodara Municipal Corporation (VMC)

import React from 'react';
import { motion } from 'framer-motion';
import { Complaint } from '@/types';
import { CategoryIcon, getCategoryColor, getSeverityColor } from './CategoryIcon';
import { ConfirmationAvatarStack } from './ConfirmationAvatarStack';
import { useLanguage } from '@/context/LanguageContext';

interface ComplaintCardProps {
  complaint: Complaint;
  isNew?: boolean;
  onClick?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending:    { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  Assigned:   { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  'In Progress': { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  Resolved:   { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
};

function timeAgo(dateStr: string, lang: 'en' | 'gu'): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (lang === 'gu') {
    if (h > 24) return `${Math.floor(h / 24)} દિવસ પહેલા`;
    if (h > 0) return `${h} કલાક પહેલા`;
    return `${m} મિનિટ પહેલા`;
  }
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint: c, isNew = false, onClick }) => {
  const { language, t } = useLanguage();
  const accentColor = getCategoryColor(c.category);
  const severityColor = getSeverityColor(c.confirmation_count, c.status);
  const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.Pending;
  const isCritical = c.confirmation_count >= 8 && c.status !== 'Resolved';

  const catLabel = t(`cat.${c.category}`, (c.category || '').replace(/_/g, ' '));
  const statusKey = (c.status || '').toLowerCase().replace(/ /g, '_');
  const statusLabel = t(`status.${statusKey}`, c.status);
  const wardLabel = t(`ward.${c.ward_id}`, c.ward_name || `Ward ${c.ward_id}`);

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -1, borderColor: '#94A3B8' }}
      onClick={onClick}
      className={`relative flex gap-3 rounded-lg border border-slate-200 overflow-hidden cursor-pointer bg-white p-4 shadow-2xs ${isNew ? 'bg-blue-50/80 animate-pulse' : ''}`}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accentColor,
        }}
      />

      {/* Category Icon */}
      <div className="flex flex-col items-center gap-2 pt-0.5 pl-1 shrink-0">
        <CategoryIcon category={c.category} size={20} color={accentColor} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-900 capitalize text-sm">
            {catLabel}
          </span>
          <span
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              borderColor: statusStyle.border,
            }}
            className="text-[11px] font-bold px-2 py-0.5 rounded border"
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-2 line-clamp-1">
          {c.description || (language === 'gu' ? 'નાગરિક દ્વારા નોંધાયેલ ફરિયાદ.' : 'Civic infrastructure report submitted by citizen.')}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>📍 {wardLabel}</span>
          <span>{timeAgo(c.created_at, language)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <ConfirmationAvatarStack count={c.confirmation_count || 1} size={20} />
          <span className="text-[10px] font-mono text-slate-400 font-semibold">
            #{c.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
